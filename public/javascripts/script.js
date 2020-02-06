/* This is main entry to p5.js
 * https://p5js.org/reference/
 *
 */

/* List of stations with their respectful coordinates
 *
 */
const stationsList = {
    'AM1': [54.35678, 18.62882], // Gdańsk Śródmieście
    'AM2': [54.3743, 18.70246], // Gdańsk Stogi
    'AM3': [54.39802, 18.66587], // Gdańsk Nowy Port
    'AM4': [54.56266, 18.48892], // Gdynia Pogorze
    'AM5': [54.32884, 18.55559], // Gdańsk Szadółki
    'AM6': [54.43333, 18.5811], // Sopot
    'AM8': [54.37875, 18.61947], // Gdańsk Wrzeszcz
    'AM9': [54.51516, 18.5318], // Gdynia Śródmieście
    'AM10': [54.47429, 18.45881] // Gdynia Dąbrowa
}

/* Constants for mapper
 * scale is magnification of all coordinated
 * a is minimal longitude plus margin
 * b is minimal latitude plus margin
 */
const mapperConstants = {
    scale: 1800,
    a: pos[1],
    b: pos[0]
}

let backgroundGradient;
const points = [];

function setup() {
    createCanvas(500, 500);
    background(255)
    const msp = mapStationPoints(mapperConstants);
    print(msp);
    for (const p of msp) {
        points.push(p);
    }
    backgroundGradient = createGraphics(500, 500);
    setupBackground()
}

/* Creates a gradient as a second canvas, with colors of respective pm
 * that is later drawn as a background
 */
function setupBackground() {
    const size = 10
    const maxProbingDist = 10
    const ratio = 0.85
    backgroundGradient.colorMode(HSB)
    for (let y = 0; y < height; y += size) {
        for (let x = 0; x < width; x += size) {
            const p = createVector(x, y)
            const measure = getMeasurement(p, points, maxProbingDist, ratio)
            if (!isNaN(measure.pm)) {
                backgroundGradient.fill(180 - 180 / 32 * measure.pm, 200, 150)
                backgroundGradient.noStroke()
                backgroundGradient.rect(p.x - size / 2, p.y - size / 2, size, size)
            }
        }
    }
}

function draw() {
    const mouse = createVector(mouseX, mouseY)
    background(255)
    image(backgroundGradient, 0, 0);
    resetBrush()
    const average = {
        t: 0,
        h: 0,
        p: 0
    }
    const size = 1
    const maxProbingDist = 20
    const ratio = 0.85
    let counter = 0
    for (let y = -maxProbingDist; y < maxProbingDist; y += size) {
        for (let x = -maxProbingDist; x < maxProbingDist; x += size) {
            let probingDist = maxProbingDist
            const p = createVector(x + mouseX, y + mouseY)
            const pointInfo = getClosestPointInfo(mouse, points);
            if (pointInfo.dist > 0 && pointInfo.dist < maxProbingDist * ratio) {
                probingDist = pointInfo.dist * 1.0 / ratio
                strokeWeight(9)
                //point(pointInfo.point)
            }
            if (p.dist(mouse) > probingDist) continue

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

                colorMode(HSB)
                strokeWeight(size)
                stroke(180 - 180 / 8 * pm, 200, 150)
                point(p)
                colorMode(RGB)
            }
        }
    }
    average.t /= counter
    average.h /= counter
    average.p /= counter

    resetBrush()
    const triangles = getTriangles(mouse, points)

    text(`Triangles: ${triangles.length}`, 5, 15)
    //   for (const t of triangles) {
    //     strokeWeight(2)
    //     stroke(120, 200, 120, 40)
    //     fill(150, 200, 150, 30)

    //     triangle(t[0].x, t[0].y, t[1].x, t[1].y, t[2].x, t[2].y)
    //   }

    const smallest = smallestTriangle(mouse, triangles)
    if (smallest) {
        const t = smallest.triangle
        strokeWeight(2)
        stroke(255, 120, 120, 150)
        fill(255, 150, 150, 150)

        //triangle(t[0].x, t[0].y, t[1].x, t[1].y, t[2].x, t[2].y)
        for (const p of t) {
            strokeWeight(0.2)
            stroke(0)
            line(mouse.x, mouse.y, p.x, p.y)
        }

        const sum = smallest.distsum
        let predictedT = 0
        let predictedH = 0
        let predictedP = 0

        const barycentric = getBarycentricForPoint(mouse, ...t)
        for (let i = 0; i < t.length; i++) {
            predictedT += barycentric[i] * t[i].temp
            predictedH += barycentric[i] * t[i].hum
            predictedP += barycentric[i] * t[i].pm
        }

        resetBrush()


        // text(`[${barycentric[0].toFixed(2)}, ${barycentric[1].toFixed(2)}, ${barycentric[2].toFixed(2)}]`, mouse.x + 5, mouse.y - 20)
    }
    const measure = getMeasurement(mouse, points)
    textPointCaption(mouse, `${measure.temp.toFixed(1)}C, ${measure.hum.toFixed(1)}%, ${measure.pm}`)
    for (const p of points) {
        textPointCaption(p, `${p.temp.toFixed(1)}C, ${p.hum.toFixed(1)}%, ${p.pm.toFixed(1)}`)
    }
}