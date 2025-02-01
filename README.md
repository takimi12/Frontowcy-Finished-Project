# README - Library Management Application

## 1. Application Screenshot



## 2. Project Description

A library management application that allows easy user registration, login, book borrowing, and enables the administrator to manage the library's resources. The application is divided into two types of users: **Client** and **Administrator**, with each action performed by a user being logged in system logs.

### Main Features:
- User registration with the assignment of a unique library card code.
- User login using the library card.
- List of books available for borrowing.
- Ability to borrow books and view book details.
- Book management panel for the administrator: adding, editing, deleting books.
- User panel: viewing borrowing history and statistics.

## 3. Architecture

The application consists of two main components: the front-end, responsible for the user interface, and the API, which handles the application's logic and stores user and book data in the db.json file, using json-server.

## 4. Tech Stack

| Component                | Technology Used                       | Why?                                              |
|--------------------------|---------------------------------------|--------------------------------------------------|
| Frontend                 | React, Material UI                   | React provides flexibility, Material UI simplifies the interface |
| Backend                  | Express/Json-Server, TypeScript      | Express provides an easy API setup, TypeScript for type safety |
| Authorization            | JWT, Roles (Client, Administrator)    | Simple authorization with role-based access     |
| Database                 | json-server                           | Storing user and book data                       |
| Testing                  | Vitest, Playwright                   | Vitest for unit tests, Playwright for E2E tests  |
| Formatting & Linter      | Prettier, ESLint, Husky              | Automatic code formatting and linting validation |
| Pagination in Tables     | Material UI, React                   | Built-in solution for table pagination           |

## 5. # Local Development

Prerequisites: Node.js v20.

git clone https://github.com/your-username/car-configurator
cd vite-project

# Install dependencies

npm install

# Start JSON server (in a separate terminal)

json-server --watch db.json --port 3000

# Start development server

npm run start

# 6. Application Scripts

| Script        | Description                                                                 |
|---------------|-----------------------------------------------------------------------------|
| `dev`         | Runs the application in development mode                                      |
| `build`       | Builds the application and generates production static files                  |
| `lint`        | Runs ESLint to check code quality                                            |
| `lint-fix`    | Runs ESLint and automatically fixes possible errors                           |
| `preview`     | Runs the application after building in preview mode                          |
| `prettier`    | Formats the code using Prettier                                              |
| `prepare`     | Prepares the environment for Husky (pre-commit hooks)                        |
| `test`        | Runs unit tests using Vitest                                                 |
| `test:ci`     | Runs tests in continuous integration mode                                    |
| `test:e2e`    | Runs E2E tests using Playwright                                              |
| `typecheck`   | Checks TypeScript types without generating code                              |

# 9. Completed Features

- User registration with the assignment of a unique library card code
- User login and logout
- Book borrowing with automatic management of available copies
- Admin panel for managing books and borrowings
- Logging system that records all user actions
- Table pagination for borrowing records
- Unit and E2E tests

# 10. Future Plans

- Expanding the notification system for book return deadlines
- Integration with an external database (e.g., MongoDB)
- Ability to reserve books online
- Implementation of an advanced book search

## 11. Kontakt to the author

# Kontakt

Email: tomek12olech@gmail.com
GitHub: [takimi12](https://github.com/takimi12)
LinkedIn:


# README - Aplikacja do Zarządzania Biblioteką

## 1. Screen z aplikacji



## 2. Opis projektu

Aplikacja do zarządzania biblioteką, pozwalająca na łatwe rejestrowanie użytkowników, logowanie, wypożyczanie książek, a także umożliwiająca administratorowi zarządzanie zasobami biblioteki. Aplikacja jest podzielona na dwa typy użytkowników: **Klient** oraz **Administrator**, a każda akcja wykonywana przez użytkownika jest rejestrowana w logach systemowych.

### Główne funkcje:
- Rejestracja użytkownika i nadawanie unikalnego kodu karty bibliotecznej.
- Logowanie użytkowników za pomocą karty bibliotecznej.
- Lista książek dostępnych do wypożyczenia.
- Możliwość wypożyczenia książki oraz podglądu szczegółów książki.
- Panel zarządzania książkami dla administratora: dodawanie, edytowanie, usuwanie książek.
- Panel użytkownika: przeglądanie historii wypożyczeń oraz statystyki.

## 3. Architektura

Aplikacja składa się z dwóch głównych komponentów: front-endu, który jest odpowiedzialny za interfejs użytkownika, oraz API, które obsługuje logikę aplikacji i przechowuje dane użytkowników i książek pliku db.json, korzystając z json-server


## 4. Tech Stack

| Komponent                 | Użyta technologia                     | Dlaczego?                                            |
|---------------------------|---------------------------------------|------------------------------------------------------|
| Frontend                  | React, Material UI                   | React zapewnia elastyczność, Material UI upraszcza interfejs |
| Backend                   | Express/Json-Server, TypeScript      | Express zapewnia wygodną konfigurację API, TypeScript dla typowania |
| Autoryzacja               | JWT, Role (Klient, Administrator)     | Prosta autoryzacja z podziałem ról w aplikacji       |
| Baza danych               | json-server  | Przechowywanie danych użytkowników i książek        |
| Testy                     | Vitest, Playwright                   | Vitest dla testów jednostkowych, Playwright dla testów E2E |
| Formatowanie i Linter     | Prettier, ESLint, Husky               | Automatyczne formatowanie kodu i walidacja linterskie |
| Paginacja w tabelach      | Material UI, React                   | Wbudowane rozwiązanie do paginacji tabel             |

## 5. # Local Development

Prerequisites: Node.js v20.\*

git clone https://github.com/your-username/car-configurator
cd vite-project

# Install dependencies

npm install

# Start JSON server (in a separate terminal)

json-server --watch db.json --port 3000

# Start development server

npm run start


## 6. Skrypty w aplikacji

| Skrypt        | Opis                                                       |
|---------------|------------------------------------------------------------|
| `dev`         | Uruchamia aplikację w trybie deweloperskim                 |
| `build`       | Buduje aplikację i generuje statyczne pliki produkcyjne    |
| `lint`        | Uruchamia ESLint do sprawdzenia jakości kodu               |
| `lint-fix`    | Uruchamia ESLint i automatycznie naprawia możliwe błędy   |
| `preview`     | Uruchamia aplikację po zbudowaniu w trybie podglądu        |
| `prettier`    | Formatuje kod przy użyciu Prettiera                        |
| `prepare`     | Przygotowuje środowisko dla Husky (hooki pre-commit)       |
| `test`        | Uruchamia testy jednostkowe przy pomocy Vitest             |
| `test:ci`     | Uruchamia testy w trybie ciągłej integracji                |
| `test:e2e`    | Uruchamia testy E2E przy użyciu Playwright                 |
| `typecheck`   | Sprawdza typy w TypeScript bez generowania kodu            |


## 9. Co zostało zrobione?

- Rejestracja użytkowników z nadawaniem unikalnego kodu karty bibliotecznej
- Logowanie i wylogowywanie użytkowników
- Wypożyczenie książek z automatycznym zarządzaniem liczbą dostępnych egzemplarzy
- Panel administracyjny do zarządzania książkami i wypożyczeniami
- System logów rejestrujący wszystkie akcje użytkowników
- Paginacja tabel z wynikami wypożyczeń
- Testy jednostkowe i E2E

## 10. Plany na przyszłość

- Rozbudowa systemu powiadomień o terminach zwrotu książek
- Integracja z zewnętrzną bazą danych (np. MongoDB)
- Możliwość rezerwacji książek online
- Implementacja zaawansowanej wyszukiwarki książek

## 11. Kontakt do autora

# Kontakt

Email: tomek12olech@gmail.com
GitHub: [takimi12](https://github.com/takimi12)
LinkedIn: