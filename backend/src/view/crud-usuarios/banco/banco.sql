CREATE DATABASE sistema_ifpe;

USE sistema_ifpe;


CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL,
    cpf VARCHAR(11) NOT NULL,
    telefone VARCHAR(15) NOT NULL
);
