CREATE DATABASE sistema_ifpe;

USE sistema_ifpe;


CREATE TABLE livros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(30) NOT NULL,
    editora VARCHAR(30) NOT NULL,
    ano VARCHAR(10) NOT NULL
);
