/*CREATE TABLE notificacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,

    usuario_id INT NOT NULL,

    tipo VARCHAR(50) NOT NULL,

    mensagem TEXT NOT NULL,

    status ENUM('pendente', 'enviado', 'erro', 'lido') DEFAULT 'pendente',

    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_envio DATETIME NULL,

    CONSTRAINT fk_notificacao_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE

);