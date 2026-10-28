# 📖 LibraryPro — Library Management System

A full-stack web app for running a small library: track books and copies, register members, lend and return books, and see what's late at a glance.

**Backend:** Laravel 13 REST API with Sanctum token auth · **Frontend:** React 19 + Vite + React Router · **Database:** MySQL / MariaDB

---

## Features

- **Dashboard**: totals for books, copies on the shelf, members, open loans, late loans and fines collected, plus lists of late books, recent loans, books by category and the most borrowed titles.
- **Books**: add, edit and delete books. Search by title, author or ISBN, filter by category or "available only", with pagination. The app keeps track of total and available copies.
- **Members**: manage members (active / blocked), search, and open a member page with their full loan history.
- **Loans**: lend a book in a few clicks, return it with one click, and filter by *Borrowed / Late / Returned*.
- **Categories**: organise books by category, with a book count for each.
- **Library rules enforced by the API**
  - a member can have at most **3** books at a time
  - a member with a **late** book can't borrow a new one
  - blocked members can't borrow
  - late returns are fined **$0.50 per day**
  - books still on loan can't be deleted
- **Roles**: `admin` can do everything; `librarian` can do everything except delete.

## Tech stack

| Layer    | Tools |
|----------|-------|
| Backend  | PHP 8.3+, Laravel 13, Laravel Sanctum (API tokens), Eloquent ORM |
| Frontend | React 19, React Router 7, Vite 8, plain CSS |
| Database | MySQL / MariaDB (includes a SQL view, `overdue_loans`) |

## Project structure

```
library-management-system/
├── backend/                 Laravel REST API
│   ├── app/Http/Controllers   Auth, Books, Members, Loans, Categories, Dashboard
│   ├── app/Models             Book, Category, Loan, Member, User
│   ├── database/library_db.sql   schema + demo data
│   └── routes/api.php
└── frontend/                React app
    └── src/
        ├── api.js             every API call goes through here
        ├── AuthContext.jsx    login state
        ├── components/        layout + shared UI (modal, pagination…)
        └── pages/             Dashboard, Books, Members, Loans, Categories, Login
```

## Getting started

### Requirements

- PHP 8.3+ and [Composer](https://getcomposer.org/)
- Node.js 20+
- MySQL or MariaDB (XAMPP works fine)

### 1. Database

Import `backend/database/library_db.sql`. It creates the `library_db` database with demo data. You can import it in phpMyAdmin, or run:

```bash
mysql -u root < backend/database/library_db.sql
```

### 2. Backend (API)

```bash
cd backend
composer install
cp .env.example .env        # edit DB_* if your MySQL user/password differ
php artisan key:generate
php artisan migrate         # adds Laravel's own tables (tokens, cache, jobs)
php artisan serve           # http://127.0.0.1:8000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

Vite forwards every `/api` request to `http://127.0.0.1:8000`, so there's no CORS setup to do.

### Demo accounts

| Role      | Email                   | Password   |
|-----------|-------------------------|------------|
| Admin     | `admin@library.com`     | `admin123` |
| Librarian | `librarian@library.com` | `admin123` |

## API overview

Every route except `POST /api/login` needs an `Authorization: Bearer <token>` header.

| Method | Endpoint                    | Description |
|--------|-----------------------------|-------------|
| POST   | `/api/login`                | Log in, returns a token and the user |
| GET    | `/api/me`                   | Current user |
| POST   | `/api/logout`               | Revoke the current token |
| GET    | `/api/dashboard`            | Stats and lists for the dashboard |
| GET    | `/api/books`                | List books (`q`, `category_id`, `available`, `page`, `per_page`) |
| POST / PUT / DELETE | `/api/books/{id}` | Create, update, delete (delete is admin only) |
| GET    | `/api/members`              | List members (`q`, `status`, `page`, `per_page`) |
| GET    | `/api/members/{id}`         | A member with their loan history |
| POST / PUT / DELETE | `/api/members/{id}` | Create, update, delete (delete is admin only) |
| GET    | `/api/loans`                | List loans (`status=active\|overdue\|returned`, `q`, `member_id`) |
| POST   | `/api/loans`                | Lend a book `{ member_id, book_id, days }` |
| PATCH  | `/api/loans/{id}/return`    | Return a book (works out the fine) |
| GET / POST / PUT / DELETE | `/api/categories` | Manage categories (delete is admin only) |

Validation errors come back as `422` with errors for each field, and the frontend shows them in its forms.

## License

[MIT](LICENSE) © Jad Ba
