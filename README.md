[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/AoyUG5Y1)
# Exam #12345: "Recupero Cibo"
## Student: s310561 Marrone Pietro 

## React Client Application Routes

- Route `/`: pagina principale, mostra la lista completa dei ristoranti quando si arriva sul sito
- Route `/restaurants/:resId`: pagina per la visualizzazione dei pacchetti di ciascun ristorante
- Route `/bookings`: pagina per la visualizzazione delle prenotazioni di un utente
- Route `/login`: pagina per fare il login
- Route `*`: per le pagine che non esistono

## API Server

- POST `/api/login`
  - request parameters and request body content
  - response body content
- GET `/api/something`
  - request parameters
  - response body content
- POST `/api/something`
  - request parameters and request body content
  - response body content
- ...

### __Create a new session (login)__

URL: `/api/sessions`

HTTP Method: POST

Description: Create a new session starting from given credentials.

Request body:
```
{
  "username": "harry@test.com",
  "password": "pwd"
}
```

Response: `200 OK` (success) or `500 Internal Server Error` (generic error).

Response body: _None_


### __Get the current session if existing__

URL: `/api/sessions/current`

HTTP Method: GET

Description: Verify if the given session is still valid and return the info about the logged-in user. A cookie with a VALID SESSION ID must be provided to get the info of the user authenticated in the current session.

Request body: _None_ 

Response: `201 Created` (success) or `401 Unauthorized` (error).

Response body:
```
{
  "username": "harry@test.com",
  "id": 4,
  "name": "Harry"
}
```

### __Destroy the current session (logout)__

URL: `/api/sessions/current`

HTTP Method: DELETE

Description: Delete the current session. A cookie with a VALID SESSION ID must be provided.

Request body: _None_

Response: `200 OK` (success) or `500 Internal Server Error` (generic error).

Response body: _None_

## Database Tables

- Table `users` - contains xx yy zz
- Table `something` - contains ww qq ss
- ...

## Main React Components

- `ListOfSomething` (in `List.js`): component purpose and main functionality
- `GreatButton` (in `GreatButton.js`): component purpose and main functionality
- ...

(only _main_ components, minor ones may be skipped)

## Screenshot

![Screenshot](./img/screenshot.jpg)

## Users Credentials

- enrico@test.com, pwd (plus any other requested info)
- luigi@test.com, pwd (plus any other requested info)
- alice@test.com, pwd (plus any other requested info)
- harry@test.com, pwd (plus any other requested info)
- carol@test.com, pwd (plus any other requested info)

