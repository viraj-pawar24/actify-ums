# User Management System (Spring Boot + JWT + RBAC)

Spring Boot 3.5 · Java 17 · Spring Web / Data JPA / Security · JWT (jjwt 0.12) · H2 (default) or MySQL

## Run

**Eclipse / STS:** File → Import → Maven → *Existing Maven Projects* → select this folder →
right-click `UserManagementApplication` → *Run As → Spring Boot App*.

**Command line:** `mvn spring-boot:run`  (tests: `mvn test`)

The app starts on `http://localhost:8080` with an in-memory H2 database and seeds sample data.
H2 console: `http://localhost:8080/h2-console` (JDBC URL `jdbc:h2:mem:usermgmt`, user `sa`, empty password).

### Use MySQL instead
Create nothing by hand (the DB is auto-created), just adjust credentials in `application-mysql.properties`
and start with the profile: `mvn spring-boot:run -Dspring-boot.run.profiles=mysql`
(in STS: Run Configurations → Arguments → Program arguments: `--spring.profiles.active=mysql`).

## Seeded accounts

| Email                | Password     | Roles            |
|----------------------|--------------|------------------|
| admin@example.com    | Admin@123    | ADMIN            |
| manager@example.com  | Manager@123  | MANAGER          |
| user@example.com     | User@1234    | USER             |
| jane@example.com     | Jane@1234    | MANAGER, USER    |

Roles are stored as `ADMIN`, `MANAGER`, `USER`.

## Endpoints

| Method | Path                          | Access        | Purpose                                   |
|--------|-------------------------------|---------------|-------------------------------------------|
| POST   | `/api/auth/login`             | public        | Get a JWT                                 |
| POST   | `/api/admin/users`            | ADMIN         | Create user (roles optional, default USER)|
| GET    | `/api/admin/users`            | ADMIN         | List users                                |
| GET    | `/api/admin/users/{id}`       | ADMIN         | Get user                                  |
| PUT    | `/api/admin/users/{id}`       | ADMIN         | Update name / email / password            |
| DELETE | `/api/admin/users/{id}`       | ADMIN         | Delete user (and their tasks)             |
| PUT    | `/api/admin/users/{id}/roles` | ADMIN         | Replace the user's roles                  |
| GET    | `/api/manager/users`          | MANAGER       | All users with their assigned tasks       |
| POST   | `/api/manager/tasks`          | MANAGER       | Assign a task to a user                   |
| GET    | `/api/user/me`                | authenticated | Own profile                               |
| GET    | `/api/user/tasks`             | authenticated | Own tasks                                 |

Access rules follow the assessment strictly: `/api/admin/**` needs ADMIN, `/api/manager/**` needs MANAGER
(an admin without the MANAGER role gets 403), `/api/user/**` needs any valid token.

## Try it

```bash
# 1. login
TOKEN=$(curl -s -X POST localhost:8080/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin@123"}' | sed -E 's/.*"token":"([^"]+)".*/\1/')

# 2. admin: create a user with two roles
curl -X POST localhost:8080/api/admin/users -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"Sam","email":"sam@example.com","password":"Sam@12345","roles":["MANAGER","USER"]}'

# 3. admin: replace roles
curl -X PUT localhost:8080/api/admin/users/3/roles -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"roles":["USER"]}'

# 4. manager: assign a task (log in as manager@example.com first)
curl -X POST localhost:8080/api/manager/tasks -H "Authorization: Bearer $MANAGER_TOKEN" -H "Content-Type: application/json" \
  -d '{"userId":3,"title":"Write tests","description":"Cover the service layer"}'
```

## Error handling & validation

All errors are JSON: `{ timestamp, status, error, message, path, validationErrors? }`

| Situation                               | Status | Message                                        |
|-----------------------------------------|--------|------------------------------------------------|
| Duplicate email                         | 409    | A user with email '...' already exists         |
| Missing / no token                      | 401    | Authentication required. Provide a valid Bearer token. |
| Malformed or tampered token             | 401    | Invalid JWT token                              |
| Expired token                           | 401    | JWT token has expired                          |
| Wrong email/password                    | 401    | Invalid email or password                      |
| Role not allowed for endpoint           | 403    | You do not have permission to access this resource |
| Invalid email format / weak password    | 400    | Validation failed (+ per-field `validationErrors`) |
| Unknown user / role                     | 404    | ... not found                                  |

Password rule: ≥ 8 chars with upper-case, lower-case, digit and special character. Passwords are stored as BCrypt hashes.

## Notes

- JWT secret: set the `JWT_SECRET` env variable (Base64, ≥ 32 bytes) for anything beyond local testing.
  Token lifetime: `app.jwt.expiration-ms` (default 1 hour).
- The assessment mentions "tasks" without defining them, so a small `Task` entity (title, description, status, assignee) was added.
- User ↔ Role is many-to-many (`Set<Role>` so a role can't be duplicated on a user).
- The user is re-loaded from the DB on every request, so role changes and deletions take effect immediately.

## Structure

```
src/main/java/com/actify/usermanagement
├── config       SecurityConfig, DataInitializer (seed data)
├── controller   Auth / Admin / Manager / User controllers
├── dto          request & response records
├── entity       User, Role, Task, TaskStatus
├── exception    custom exceptions + GlobalExceptionHandler
├── repository   Spring Data JPA repositories
├── security     JwtService, JwtAuthenticationFilter, UserDetailsService, 401/403 handlers
├── service      UserService, TaskService
└── validation   @StrongPassword
```
