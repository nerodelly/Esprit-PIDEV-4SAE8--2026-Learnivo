-- Learnivo - Create MySQL database
-- Run this script with a MySQL user that has CREATE DATABASE privilege
-- e.g. mysql -u root -p < schema-mysql.sql

CREATE DATABASE IF NOT EXISTS learnivo
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Tables (events) are created automatically by Spring Boot JPA (ddl-auto=update)
-- when the application starts. No need to create them manually.
