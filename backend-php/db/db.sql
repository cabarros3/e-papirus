CREATE DATABASE e_papirus;
USE e_papirus

CREATE TABLE assunto (
    id_assunto INT PRIMARY KEY AUTO_INCREMENT,
    nome_assunto VARCHAR (100)
    NOT NULL
    UNIQUE
);

CREATE TABLE autor (
    id_autor INT PRIMARY KEY AUTO_INCREMENT,
    nome_autor VARCHAR (100)
    NOT NULL
);

CREATE TABLE livro (
    id_livro INT PRIMARY KEY AUTO_INCREMENT,
    id_assunto INT NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    editora VARCHAR(100) NOT NULL,
    cidade_publicacao VARCHAR(100) NULL,
    ano_publicacao YEAR NOT NULL,
    nota_resumo TEXT,
    capa VARCHAR(255),
    descricao_fisica TEXT,
    FOREIGN KEY (id_assunto) REFERENCES assunto(id_assunto)
);

CREATE TABLE livro_autor (
    id_livro INT,
    id_autor INT,
    PRIMARY KEY (id_livro, id_autor),
    FOREIGN KEY (id_livro) REFERENCES livro(id_livro),
    FOREIGN KEY (id_autor) REFERENCES autor(id_autor)
);

CREATE TABLE exemplar (
    id_exemplar INT PRIMARY KEY AUTO_INCREMENT,
    id_livro INT,
    localizacao VARCHAR(100),
    FOREIGN KEY (id_livro) REFERENCES livro(id_livro),
    disponibilidade ENUM('disponivel','emprestado','reservado') DEFAULT 'disponivel',
    numero_exemplar INT AFTER id_livro
);

CREATE TABLE pessoa (
    id_pessoa INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    matricula VARCHAR(14) NOT NULL UNIQUE,
    cpf VARCHAR(11)
      NOT NULL
      UNIQUE
      CHECK (cpf REGEXP '^[0-9]{11}$'),
    email VARCHAR(100) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    tipo ENUM('aluno', 'professor', 'funcionario'),
    cargo ENUM('bibliotecario', 'auxiliar', 'estagiario')
);

CREATE TABLE usuario_sistema (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    id_pessoa INT UNIQUE,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    FOREIGN KEY (id_pessoa) REFERENCES pessoa(id_pessoa)
);

CREATE TABLE emprestimo (
    id_emprestimo INT PRIMARY KEY AUTO_INCREMENT,
    id_exemplar INT,
    id_pessoa INT,
    data_emprestimo DATE,
    data_prevista DATE NOT NULL,
    data_devolucao DATE NULL,
    FOREIGN KEY (id_exemplar) REFERENCES exemplar(id_exemplar),
    FOREIGN KEY (id_pessoa) REFERENCES pessoa(id_pessoa)
);

CREATE TABLE renovacao (
  id_renovacao INT PRIMARY KEY AUTO_INCREMENT,
  id_emprestimo INT,
  data_renovacao DATE,
  nova_data_devolucao DATE,
  FOREIGN KEY (id_emprestimo) REFERENCES emprestimo(id_emprestimo)
);

-- tabela nova --
CREATE TABLE reserva (
    id_reserva INT PRIMARY KEY AUTO_INCREMENT,
    id_livro INT NOT NULL,
    id_pessoa INT NOT NULL,
    data_reserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_expiracao DATE NOT NULL, -- Prazo para a pessoa buscar o livro
    status ENUM('ativa', 'concluida', 'cancelada') DEFAULT 'ativa',
    FOREIGN KEY (id_livro) REFERENCES livro(id_livro),
    FOREIGN KEY (id_pessoa) REFERENCES pessoa(id_pessoa)
);