create database usermgmt;
USE usermgmt;
SELECT * FROM users;
SELECT * FROM roles;
SELECT u.email, r.name AS role
FROM users u
JOIN user_roles ur ON ur.user_id = u.id
JOIN roles r ON r.id = ur.role_id;
SELECT * FROM tasks;