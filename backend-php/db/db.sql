CREATE DATABASE IF NOT EXISTS e_papirus;
USE e_papirus;

CREATE TABLE assunto (
    id_assunto INT PRIMARY KEY AUTO_INCREMENT,
    nome_assunto VARCHAR (100)
);

CREATE TABLE autor (
    id_autor INT PRIMARY KEY AUTO_INCREMENT,
    nome_autor VARCHAR (100)
);

CREATE TABLE livro (
  id_livro INT PRIMARY KEY AUTO_INCREMENT,
  id_assunto INT,
  titulo VARCHAR(150),
  editora VARCHAR(100),
  ano YEAR,
  FOREIGN KEY (id_assunto) REFERENCES assunto(id_assunto)
);

CREATE TABLE escreve (
    id_livro INT,
    id_autor INT,
    PRIMARY KEY (id_livro, id_autor),
    FOREIGN KEY (id_livro) REFERENCES livro(id_livro),
    FOREIGN KEY (id_autor) REFERENCES autor(id_autor)
);

CREATE TABLE exemplar (
    id_exemplar INT PRIMARY KEY AUTO_INCREMENT,
    id_livro INT,
    disponibilidade BOOLEAN,
    localizacao VARCHAR(100),
    FOREIGN KEY (id_livro) REFERENCES livro(id_livro)
);

CREATE TABLE funcionario (
    id_funcionario INT PRIMARY KEY AUTO_INCREMENT,
    nome_funcionario VARCHAR(100),
    cpf_funcionario VARCHAR(14),
    email_funcionario VARCHAR(100)
);

-- Tabela única de pessoas (usuário ou professor)
CREATE TABLE pessoa (
    id_pessoa INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100),
    cpf VARCHAR(14),
    email VARCHAR(100),
    telefone VARCHAR(20),
    tipo ENUM('usuario', 'professor')
);

CREATE TABLE emprestimo (
    id_emprestimo INT PRIMARY KEY AUTO_INCREMENT,
    id_exemplar INT,
    id_pessoa INT,
    id_funcionario INT,
    data_emprestimo DATE,
    data_devolucao DATE,
    FOREIGN KEY (id_exemplar) REFERENCES exemplar(id_exemplar),
    FOREIGN KEY (id_pessoa) REFERENCES pessoa(id_pessoa),
    FOREIGN KEY (id_funcionario) REFERENCES funcionario(id_funcionario)
);

CREATE TABLE registra (
    id_funcionario INT,
    id_emprestimo INT,
    PRIMARY KEY (id_funcionario, id_emprestimo),
    FOREIGN KEY (id_funcionario) REFERENCES funcionario(id_funcionario),
    FOREIGN KEY (id_emprestimo) REFERENCES emprestimo(id_emprestimo)
);

CREATE TABLE renovacao (
  id_renovacao INT PRIMARY KEY AUTO_INCREMENT,
  id_emprestimo INT,
  data_renovacao DATE,
  nova_data_devolucao DATE,
  FOREIGN KEY (id_emprestimo) REFERENCES emprestimo(id_emprestimo)
);