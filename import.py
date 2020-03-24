#
# import.py agreguje dane z arkuszy o nazwie np. AM1.xlsx, AM2.xlsx do formatu danych:
# { "_id" : ObjectId("5e3af71be8060b045ef5d4bc"), "time" : "2012-01-01 20:00:00", "AM1" : { "pm10" : 32.9036, "temperature" : 2, "humidity" : 93 }, "AM10" : { "pm10" : 28.0694, "temperature" : 2, "humidity" : 93 }, "AM2" : { "pm10" : 33.446268639, "temperature" : 2, "humidity" : 93 }, "AM3" : { "pm10" : 16.2206, "temperature" : 2, "humidity" : 93 }, "AM4" : { "pm10" : 19.9424, "temperature" : 2, "humidity" : 93 }, "AM5" : { "pm10" : 13, "temperature" : 2, "humidity" : 93 }, "AM6" : { "pm10" : 17.4827, "temperature" : 2, "humidity" : 93 }, "AM8" : { "pm10" : 23.6113, "temperature" : 2, "humidity" : 93 }, "AM9" : { "pm10" : 20.3667, "temperature" : 2, "humidity" : 93 } }
#
# Skrypt ten można uruchomić na na dowolnym środowisku z zainstalowanym python3 oraz PIP
# do działania wymaga on bibliotek pandas (wykorzystywany do odczytu plików xls) oraz pymongo (wykorzytywany do eksportu danych do bazy MongoDB)
#
# Dane wejściowe w formie arkuszy dla stacji z nagłówkami kolumn: "time", "pm10", "temperature" oraz "humidity" powinny znajdować się w katalogu "./data"
# Skrypt zakłada pełną poprawność danych (wypełnione braki i odpowiedni format) ponieważ dane są już po preprocesingu.
#
# Autor: Patryk Chęciński, styczeń 2020
#

from pathlib import Path
import pandas as pd
import pymongo
import os

# creditientials
hostname = 'mongo.checinski.dev'
username = 'wsb-iot-2019'
password = 'WSB_2019_IOT#'
database = 'wsb-iot-2019'

# connection 
client = pymongo.MongoClient(f'mongodb://{username}:{password}@{hostname}:27017/{database}')
raspberrydb = client[database]
collection = raspberrydb["armaag_data"]

for file_name in os.listdir("./data"):
    station = Path(f"./data/{file_name}").stem # get file name without extension
    xls = pd.read_excel(f"./data/{file_name}") # read spreedsheet 
    print(station) 
    for index, row in xls.iterrows(): # loop on all rows in spreedsheet
        time = str(row["time"])

		# create document
        data = {
            station: {
                "pm10": row["pm10"],
                "temperature": row["temperature"],
                "humidity": row["humidity"],
            }
        }
		# insert or update document to database
        collection.update_one({"time": time}, {"$set": data}, upsert=True)
