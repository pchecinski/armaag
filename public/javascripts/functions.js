function resetBrush() {
    fill(0)
    stroke(0)
    strokeWeight(1)
}

function textMousePosition(mouse, s) {
    text(`[${(mouse.x / s.scale + s.a).toFixed(4)}; ${((height - mouse.y) / s.scale + s.b).toFixed(4)}]`, 5, 15);
}

function textPointCaption(p, caption) {
    resetBrush()
    //stroke(255-predicted * 255/8)
    strokeWeight(5)
    point(p)
    strokeWeight(0.5)
    text(caption, p.x + 5, p.y - 5)
}

// function mapStationPoints(s) {
//   let i = 0;
//   return stationsList.map(p => {
//     const v = createVector((p[1] - s.a) * s.scale, height - (p[0] - s.b) * s.scale)
//     v.temp = temperatures[i]
//     v.hum = humidity[i++]
//     return v
//   });
// }

/* Maps stations as p5.Vectors, and set their temperature,
 * humidity and pm values so we can use them later
 * @param s: mapperConstants
 */
function mapStationPoints(s) {
    let parsed = [];
    for (stationName in stationsList) {
        if (!data[stationName]) continue;

        const v = createVector((stationsList[stationName][1] - s.a) * s.scale, height - (stationsList[stationName][0] - s.b) * s.scale);
        v.temp = data[stationName].temperature;
        v.hum = data[stationName].humidity;
        v.pm = data[stationName].pm10;
        parsed.push(v);
    }

    return parsed;
}

/* Constructs all valid triangles from given points satisfying rule:
 * @param point: all triangles must have this point inside of them to be considered valid
 * @param points: points to construct triangles from
 */
function getTriangles(point, points) {
    const triangles = [];
    for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
            if (i !== j) {
                for (let k = j + 1; k < points.length; k++) {
                    const p0 = points[i]
                    const p1 = points[j]
                    const p2 = points[k];
                    if (j !== k && isPointInTriangle(point, p0, p1, p2)) {
                        triangles.push([p0, p1, p2]);
                    }
                }
            }
        }
    }
    return triangles
}

/* Selects closest point from list of points
 * @param p: given point
 * @param points: list of point to search from
 */
function closestPoint(p, points) {
    let dist = Infinity;
    let index = -1;
    for (let i = 0; i < points.length; i++) {
        const other = points[i];
        d = p.dist(other);
        if (d < dist) {
            dist = d;
            index = i;
        }
    }
    if (index < 0) return {};
    return {
        dist,
        x: points[index].x,
        y: points[index].y
    };
}

/* Selects closest point from list of points and returns info about it
 * @param p: given point
 * @param points: list of point to search from
 */
function getClosestPointInfo(p, points) {
    let dist = Infinity
    let index = -1
    let closest = null
    for (let i = 0; i < points.length; i++) {
        const other = points[i]
        d = p.dist(other)
        if (d < dist) {
            dist = d
            index = i
            closest = p
        }
    }
    if (index < 0) {
        return {}
    } else {
        return {
            dist,
            point: p
        }
    }
}

/* Selects smallest triangle from given list of triangles, 
 * smallest meaning one having lowest distance from each of its corner points to given point
 * @param point: given point
 * @param triangles: list of triangles to search from, triangle => [p0, p1, p2]
 */
function smallestTriangle(point, triangles) {
    const ts = triangles.map(t => {
        return {
            area: abs(area(...t)),
            distsum: point.dist(t[0]) + point.dist(t[1]) + point.dist(t[2]),
            triangle: t
        }
    })
    ts.sort((a, b) => b.distsum - a.distsum).reverse()
    if (ts && ts[0])
        return ts[0]
}


/* Calculates area of triangle constructed from given point
 * @param p0, p1, p2: given corners of triangle
 */
function area(p0, p1, p2) {
    return 1 / 2 * (-p1.y * p2.x + p0.y * (-p1.x + p2.x) + p0.x * (p1.y - p2.y) + p1.x * p2.y)
}

/* Checks if point is inside triangle constructed from points
 * @param p: point to be checked
 * @param p0, p1, p2: given corners of triangle
 */
function isPointInTriangle(p, p0, p1, p2) {
    const A = 1 / 2 * (-p1.y * p2.x + p0.y * (-p1.x + p2.x) + p0.x * (p1.y - p2.y) + p1.x * p2.y);
    const sign = A < 0 ? -1 : 1;
    const s = (p0.y * p2.x - p0.x * p2.y + (p2.y - p0.y) * p.x + (p0.x - p2.x) * p.y) * sign;
    const t = (p0.x * p1.y - p0.y * p1.x + (p0.y - p1.y) * p.x + (p1.x - p0.x) * p.y) * sign;

    return s > 0 && t > 0 && (s + t) < 2 * A * sign;
}

/* Calculates barycentric coordinates
 * https://en.wikipedia.org/wiki/Barycentric_coordinate_system
 * @param p: point to be base for calculations
 * @param p0, p1, p2: given corners of triangle
 */
function getBarycentricForPoint(p, p0, p1, p2) {
    const v0 = p5.Vector.sub(p1, p0)
    const v1 = p5.Vector.sub(p2, p0)
    const v2 = p5.Vector.sub(p, p0)
    const d00 = v0.dot(v0)
    const d01 = v0.dot(v1)
    const d11 = v1.dot(v1)
    const d20 = v2.dot(v0)
    const d21 = v2.dot(v1)
    const denom = d00 * d11 - d01 * d01
    const v = (d11 * d20 - d01 * d21) / denom
    const w = (d00 * d21 - d01 * d20) / denom
    const u = 1.0 - v - w
    return [u, v, w]
}

/* Calculates average temperature, humidity and pm values in given point
 * @param measurePoint: point to be base for calculations
 * @param points: positions of stations with temperature and other values
 * @param maxProbingDist: maximum distance for getting average values
 * @param ratio: value meaning how close measurePoint 
 *  can get to station to lower probint distance
 */
function getMeasurement(measurePoint, points, maxProbingDist = 20, ratio = 0.85) {
    const average = {
        t: 0,
        h: 0,
        p: 0
    }
    const size = 1
    //const maxProbingDist = 20
    //const ratio = 0.85
    let counter = 0
    for (let y = -maxProbingDist; y < maxProbingDist; y += size) {
        for (let x = -maxProbingDist; x < maxProbingDist; x += size) {
            let probingDist = maxProbingDist
            const p = createVector(x + measurePoint.x, y + measurePoint.y)
            const pointInfo = getClosestPointInfo(measurePoint, points);
            if (pointInfo.dist > 0 && pointInfo.dist < maxProbingDist * ratio) {
                probingDist = pointInfo.dist * 1.0 / ratio
            }
            if (p.dist(measurePoint) > probingDist) continue

            const ts = getTriangles(p, points)
            const sm = smallestTriangle(p, ts)
            if (sm) {
                counter++
                const barycentric = getBarycentricForPoint(p, ...sm.triangle)
                let temp = 0
                let hum = 0
                let pm = 0
                for (let i = 0; i < sm.triangle.length; i++) {
                    temp += barycentric[i] * sm.triangle[i].temp
                    hum += barycentric[i] * sm.triangle[i].hum
                    pm += barycentric[i] * sm.triangle[i].pm
                }
                average.t += temp
                average.h += hum
                average.p += pm
            }
        }
    }
    average.t /= counter
    average.h /= counter
    average.p /= counter

    return {
        temp: average.t,
        hum: average.h,
        pm: average.p
    }
}