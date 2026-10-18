-- Rodar UMA vez por máquina, como root:
--   mysql -u root -p < tests/banco/criar-banco-teste.sql
CREATE DATABASE IF NOT EXISTS epapirus_test CHARACTER SET utf8mb4;
CREATE USER IF NOT EXISTS 'epapirus_test'@'localhost' IDENTIFIED BY 'epapirus_test';
GRANT ALL PRIVILEGES ON epapirus_test.* TO 'epapirus_test'@'localhost';
FLUSH PRIVILEGES;
