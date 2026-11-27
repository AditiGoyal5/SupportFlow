# SupportFlow

SupportFlow is a ticket-management application with a React/Vite frontend and an Express API backed by PostgreSQL. Users submit and track support requests; administrators manage the ticket queue and workspace accounts.

## Contents

- [Features](#features)
- [Technology](#technology)
- [Prerequisites](#prerequisites)
- [Local setup](#local-setup)
- [Application routes](#application-routes)
- [User and admin workflows](#user-and-admin-workflows)
- [Ticket filters and sorting](#ticket-filters-and-sorting)
- [HTTP API](#http-api)
- [Configuration](#configuration)
- [Tests](#tests)

## Features

- User registration and sign-in using signed bearer tokens.
- Ticket creation, tracking, discussion, and activity history.
- User and administrator workspaces with role-based access.
- Admin ticket queue with status and priority management, assignment, and dashboard metrics.
- Admin account management, including creating accounts, changing roles, and deleting accounts.
- Ticket list and board presentations, search, filters, pagination, and sorting.
- Light/dark theme toggle.

## Technology

- Frontend: React, React Router, Vite, Tailwind CSS, Axios.
- Backend: Node.js, Express, Zod, JSON Web Tokens, bcrypt.
- Database: PostgreSQL.

## Prerequisites

- Node.js and npm.
- PostgreSQL.
- `psql` command-line client to apply the database migrations.

## Local setup

Run commands from the project root unless a directory change is shown.

### 1. Create a database

Create a PostgreSQL database named `supportflow` (or choose another name and use it in the server configuration).

### 2. Apply the database migrations

Apply the SQL files in order. For example, from the project root in PowerShell:

```powershell
psql -h localhost -U postgres -d supportflow -f .\server\database\migrations\001_initial_schema.sql
psql -h localhost -U postgres -d supportflow -f .\server\database\migrations\002_ticket_category.sql
psql -h localhost -U postgres -d supportflow -f .\server\database\migrations\003_dotted_activity_event_types.sql
psql -h localhost -U postgres -d supportflow -f .\server\database\migrations\004_ticket_assignment.sql
```

Replace the host, database, or PostgreSQL user as needed. Each migration is transactional; do not skip or reorder them.

### 3. Configure and start the API

```powershell
Copy-Item .\server\.env.example .\server\.env
```

Edit `server/.env` and set a working `DATABASE_URL` and a private `JWT_SECRET` of at least 32 characters. Do not commit `.env` or use the example secret in a deployed environment.

```powershell
Set-Location .\server
npm install
npm run dev
```

The API listens on port `5000` by default. Its health endpoint is `http://localhost:5000/api/health`.

### 4. Configure and start the frontend

Open a second terminal at the project root:

```powershell
Copy-Item .\SupportFlow_frontend\.env.example .\SupportFlow_frontend\.env
Set-Location .\SupportFlow_frontend
npm install
npm run dev
```

Vite prints the local frontend URL (normally `http://localhost:5173`). Set `VITE_API_BASE_URL` in the frontend `.env` if the API is hosted at a different URL.

### 5. Create the first administrator

Public registration always creates a standard `user` account. To create an administrator, temporarily add `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` to `server/.env`; the seed password must be at least 12 characters and no more than 72 UTF-8 bytes.

```powershell
Set-Location .\server
npm run seed:admin
```

Remove the temporary `ADMIN_*` values from `.env` after the seed completes. Sign in with that account to open the admin workspace.

## Application routes

All `/app` routes require a valid signed-in session. Role-restricted routes redirect users who lack the required role to `/app`.

| Route | Access | Screen and behavior |
|---|---|---|
| `/` | Public | Redirects to `/app` when signed in, otherwise to `/login`. |
| `/login` | Signed out | Sign-in form. Signed-in visitors are redirected to `/app`. |
| `/register` | Signed out | Creates a standard user account and signs the user in. |
| `/app` | Signed in | Role-aware dashboard: user overview or admin ticket statistics. |
| `/app/tickets` | Signed in | User's own/assigned tickets, or the admin's all-ticket queue. |
| `/app/tickets/new` | User | Create-ticket form. Admins are redirected to `/app`. |
| `/app/tickets/:id` | Signed in | Ticket details, comments, and activity; available only when the API authorizes access to that ticket. |
| `/app/users` | Admin | Workspace user management. |
| `/app/admin` | Signed in | Legacy route that redirects to `/app`. |
| Any other path | Public | Redirects to `/`, which then applies the signed-in redirect. |

## User and admin workflows

### User workflow

1. Register at `/register` or sign in at `/login`.
2. From the dashboard, open **My Tickets** or create a request at `/app/tickets/new`.
3. Provide a summary, description, category, and priority. A new ticket starts with `open` status.
4. Open a ticket to read its details and activity, add comments, and see its assigned administrator.
5. The ticket list supports list and board views. Users see tickets they created and tickets assigned to them.
6. Users can edit the title, description, or category of their own open tickets. Users can delete their own tickets.

Users cannot change ticket status or priority, create administrator accounts through public registration, or view tickets they neither created nor are assigned to.

### Administrator workflow

1. Sign in with an administrator account. The dashboard shows total, open, in-progress, and resolved ticket counts; selecting a count opens the matching queue view.
2. Open **All Tickets** to triage the complete queue. Use filters, search, list/board views, and pagination to find work.
3. Open a ticket to view its reporter, comments, and activity. Change status or priority and assign or reassign the ticket to an administrator. Administrators may also leave a ticket unassigned.
4. Open **User Management** to create a user/admin account, change another account's role, or delete an account.

Deleting a user also deletes that user's tickets and related records according to the database's cascade rules. An administrator cannot change their own role or delete their own account.

### Ticket statuses, priorities, and categories

- Status: `open`, `in_progress`, `resolved`, `closed`.
- Priority: `low`, `medium`, `high`, `urgent`.
- Categories shown in the UI: `technical`, `account`, `billing`, `general`, `bug_report`, `feature_request`. The API accepts any non-empty category string up to 50 characters.

Ticket comments are limited to 5,000 characters. Ticket titles are limited to 200 characters and descriptions to 10,000 characters. The create form requires a non-empty title of at least 4 characters, a category, and a description of at least 10 characters.

## Ticket filters and sorting

The filters are available on `/app/tickets` and are reflected in the URL query string, so a filtered view can be bookmarked or shared with another authorized account.

| Filter/option | URL parameter | Behavior |
|---|---|---|
| Status | `status` | Exact match: `open`, `in_progress`, `resolved`, or `closed`. The **All** option removes this filter. |
| Priority | `priority` | Exact match: `low`, `medium`, `high`, or `urgent`. |
| Category | `category` | Exact match against the ticket category values listed above. |
| Search | `search` | Case-insensitive partial match against ticket title or description; whitespace is trimmed and the API accepts at most 100 characters. Despite the UI placeholder, ticket keys are not searched by the API. |
| Sort field | `sort` | UI choices include last updated, creation date, priority, and title. |
| Sort direction | `order` | `asc` or `desc`; omitted/default ordering is descending. |
| Display | `view` | `list` or `board`; board view requests up to 50 tickets and does not use normal pagination. |
| Page | `page` | One-based page number. The list view requests 10 tickets per page. |

Filters can be combined; they narrow results together. Changing a filter resets the page to the first page. **Reset** clears search, status, priority, and category while leaving the selected display and sorting intact.

The API's list endpoint accepts `page` (minimum 1, default 1) and `limit` (1–100, default 20). The frontend normally requests 10 per page in list view and up to 50 in board view. User ticket sorting is applied in the client. Admin list sorting is validated by the API for `created_at`, `updated_at`, or `priority`; the current UI also offers **Title: A–Z**, which the admin API does not accept and can return a validation error.

Example:

```text
/app/tickets?status=open&priority=urgent&search=login
```

## HTTP API

The API base path is `/api`. Unless otherwise noted, endpoints below require `Authorization: Bearer <token>`. Request bodies and query parameters are validated; malformed inputs return a client error.

### Health and authentication

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/health` | Public | Check API/database health. |
| `POST` | `/api/auth/register` | Public | Register a standard user. Body: `name`, `email`, `password`. |
| `POST` | `/api/auth/login` | Public | Sign in. Body: `email`, `password`; returns a user and access token. |
| `GET` | `/api/auth/me` | Signed in | Return the current authenticated user. |

Registration names are 1–100 characters, emails are normalized to lowercase, and passwords must contain at least 8 characters and no more than 72 UTF-8 bytes. Registration does not accept a role field.

### Tickets

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/tickets` | Signed in | List tickets created by the user or assigned to them. |
| `POST` | `/api/tickets` | User | Create a ticket. Body: `title`, `description`, `category`, `priority`. |
| `GET` | `/api/tickets/:id` | Signed in | Read an authorized ticket. Admins can read any ticket. |
| `PATCH` | `/api/tickets/:id` | Owner or admin | Update `title`, `description`, and/or `category`. Non-admin owners may edit only while status is `open`. |
| `DELETE` | `/api/tickets/:id` | Owner or admin | Delete a ticket. |
| `GET` | `/api/tickets/:id/comments` | Authorized ticket viewer | List comments in chronological order. |
| `POST` | `/api/tickets/:id/comments` | Authorized ticket viewer | Add a comment. Body: `content`. |
| `GET` | `/api/tickets/:id/activity` | Authorized ticket viewer | List the ticket activity timeline. |
| `GET` | `/api/tickets/:id/assignable-users` | Admin or assigned admin | List administrator accounts eligible for assignment. |
| `PATCH` | `/api/tickets/:id/assign` | Admin or assigned admin | Assign to an admin account or set `assigned_to` to `null` (admin only). |

Ticket-list query parameters are `page`, `limit`, `status`, `priority`, `category`, and `search`. All filters are optional and can be combined. Non-admin list results are restricted to the authenticated user's created or assigned tickets. Ticket IDs must be valid UUIDs.

### Admin

All `/api/admin/*` endpoints require an authenticated administrator.

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/admin/tickets` | List all tickets, including reporter details. Accepts the ticket-list filters plus `sortBy` (`created_at`, `updated_at`, `priority`) and `sortOrder` (`asc`, `desc`). |
| `PATCH` | `/api/admin/tickets/:id/status` | Change status. Body: `{ "status": "open \| in_progress \| resolved \| closed" }`. |
| `PATCH` | `/api/admin/tickets/:id/priority` | Change priority. Body: `{ "priority": "low \| medium \| high \| urgent" }`. |
| `GET` | `/api/admin/dashboard/stats` | Get ticket totals grouped by status and priority. |
| `GET` | `/api/admin/users` | List workspace users. |
| `PATCH` | `/api/admin/users/:id/role` | Set a user's role. Body: `{ "role": "user \| admin" }`. |

### User management

These endpoints also require an authenticated administrator.

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/users` | List workspace users. |
| `POST` | `/api/users` | Create an account with a selected role. Body: `name`, `email`, `password`, `role`. |
| `PATCH` | `/api/users/:id/role` | Change a user's role. Body: `{ "role": "user \| admin" }`. |
| `DELETE` | `/api/users/:id` | Delete a user and their related records. |

The frontend uses `/api/admin/users` to list accounts and `/api/users` for account creation, role changes, and deletion.

## Configuration

### Server (`server/.env`)

| Variable | Purpose | Default/requirement |
|---|---|---|
| `NODE_ENV` | Runtime environment | `development`; allowed values: `development`, `test`, `production`. |
| `PORT` | API listening port | `5000`. |
| `DATABASE_URL` | PostgreSQL connection string | Required valid URL. |
| `JWT_SECRET` | Signs access tokens | Required; at least 32 characters. |
| `JWT_EXPIRES_IN` | Token lifetime | `1d`; format such as `15m`, `12h`, or `7d`. |
| `CLIENT_ORIGIN` | Allowed browser origin for CORS | `http://localhost:5173`. |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | One-time admin seed input | Set only when running `npm run seed:admin`. |

### Frontend (`SupportFlow_frontend/.env`)

| Variable | Purpose | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Full API base URL, including `/api` | `http://localhost:5000/api` |

The frontend stores the access token in browser local storage and sends it as a bearer token. A `401` on an authenticated request clears the session and returns the user to the signed-out flow.

## Tests

Run the backend integration tests from `server`:

```powershell
Set-Location .\server
npm test
```

The tests use PostgreSQL. Configure a disposable test database, apply all migrations, and set valid `DATABASE_URL` and `JWT_SECRET` values before running them. Do not point integration tests at production data.

Build the frontend from `SupportFlow_frontend`:

```powershell
Set-Location .\SupportFlow_frontend
npm run build
```

