# Aplikacja full-stack do projektu

Aplikacja oparta jest o nodejs, bazuje ona na pakiecie express. Zawiera ona jedną ścieżkę GET /data/:date (format daty YYYY-MM-DD HH:MM:SS).
Program domyślnie działa jako serwer nasłuchujący na porcie 5000, do instalaji wymaga on wpisania polecenia `npm install`, uruchomienie `npm start`. 

Do poprawnego działania aplikacji konieczne jest utworzenie pliku o nazwie `.env` zawierającego dane dostępowe do bazy danych w formacie:
```
hostname = localhost
username = user
password = password
database = db
```

Część front-endowa wykonana przez Michała znajduje się w katalogu `public/javascript` i zawiera osobne komentarze opisujące funkcjonalność. Główna część zaplecza to plik `routes/data.js` - generuje on dane z bazy MongoDB wykorzystywane do oblcizeń przez aplikację frontową. 
