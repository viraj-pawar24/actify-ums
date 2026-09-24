# User Management System: React frontend

React 18 + Vite + React Router + Axios. It talks to the Spring Boot backend in `user-management-system`.

## Run

1. Start the backend first (`http://localhost:8080`).
2. In this folder:
   ```bash
   npm install
   npm run dev
   ```
3. Open http://localhost:5173

No CORS setup is needed in development: Vite forwards every `/api/*` request to `http://localhost:8080`
(see `vite.config.js`).

## Sample accounts (seeded by the backend)

| Email                | Password    | Sees                                  |
|----------------------|-------------|---------------------------------------|
| admin@example.com    | Admin@123   | Users, Profile and tasks              |
| manager@example.com  | Manager@123 | Team tasks, Profile and tasks         |
| user@example.com     | User@1234   | Profile and tasks                     |
| jane@example.com     | Jane@1234   | Team tasks, Profile and tasks         |

The login page has buttons that fill these in for you.

## Pages

| Route            | Role    | What it does                                                         |
|------------------|---------|----------------------------------------------------------------------|
| `/login`         | public  | Sign in and receive a JWT                                            |
| `/admin/users`   | ADMIN   | List, search, add, edit and delete users; replace a user's roles     |
| `/manager/team`  | MANAGER | See every user with their tasks; assign a new task                   |
| `/me`            | any     | Your own profile and assigned tasks                                  |

## How auth works

- The token and basic user info are stored in `localStorage` after login.
- `src/api/client.js` adds `Authorization: Bearer <token>` to every request.
- Any 401 (expired or invalid token) signs the user out and returns them to the login page with a message.
- Routes are guarded by role in `ProtectedRoute`; the backend enforces the same rules, so hiding a page in the UI is only a convenience.
- Server validation messages (invalid email, weak password, duplicate email) are shown next to the field or in the form.

## Production build

```bash
npm run build      # output in dist/
```
Set `VITE_API_URL` (for example `https://api.example.com/api`) at build time, and allow that origin with CORS in the backend.

## Structure

```
src
├── api/client.js          axios instance, token + error handling
├── context/               AuthContext (session), ToastContext (notifications)
├── components/            Layout, ProtectedRoute, Modal, shared UI bits
└── pages/                 LoginPage, UsersPage, TeamTasksPage, ProfilePage
```
