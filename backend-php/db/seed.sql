USE e_papirus;

-- ASSUNTOS
INSERT INTO assunto (nome_assunto) VALUES
('Programação'),
('Banco de Dados'),
('Redes de Computadores'),
('Literatura Brasileira'),
('Matemática');

-- AUTORES
INSERT INTO autor (nome_autor) VALUES
('Robert C. Martin'),
('Abraham Silberschatz'),
('Andrew S. Tanenbaum'),
('Machado de Assis'),
('James Stewart');

-- LIVROS
INSERT INTO livro (id_assunto, titulo, editora, cidade_publicacao, ano_publicacao, nota_resumo, capa, descricao_fisica) VALUES
(1, 'Código Limpo', 'Alta Books', 'Rio de Janeiro', 2009,
 'Guia de boas práticas para escrita de código legível e sustentável.',
 'https://covers.openlibrary.org/b/isbn/9788576082675-L.jpg',
 '464 páginas; 23 cm'),

(2, 'Sistema de Gerenciamento de Banco de Dados', 'McGraw-Hill', 'São Paulo', 2020,
 'Cobertura completa de fundamentos e técnicas avançadas de SGBDs.',
 'https://m.media-amazon.com/images/I/81x1XWg68pL.jpg',
 '1376 páginas; 25 cm'),

(3, 'Redes de Computadores', 'Pearson', 'São Paulo', 2011,
 'Referência clássica sobre arquitetura e protocolos de redes.',
 'https://m.media-amazon.com/images/I/91uoaAYJkrL._AC_UF1000,1000_QL80_.jpg',
 '960 páginas; 24 cm'),

(4, 'Dom Casmurro', 'Editora Ática', 'São Paulo', 1899,
 'Clássico da literatura brasileira narrado por Bentinho, o Dom Casmurro.',
 'https://static.wixstatic.com/media/5801fd_4de6ed5dc5ea458094e4268b05378b79~mv2.jpg/v1/fill/w_640,h_1000,al_c,q_85,usm_0.66_1.00_0.01/5801fd_4de6ed5dc5ea458094e4268b05378b79~mv2.jpg',
 '256 páginas; 21 cm'),

(5, 'Cálculo: Volume 1', 'Cengage Learning', 'São Paulo', 2013,
 'Introdução ao cálculo diferencial e integral com exemplos aplicados.',
 'https://covers.openlibrary.org/b/isbn/9788522112586-L.jpg',
 '620 páginas; 26 cm');

-- LIVRO_AUTOR
INSERT INTO livro_autor (id_livro, id_autor) VALUES
(1, 1), -- Código Limpo -> Robert C. Martin
(2, 2), -- SGBD -> Silberschatz
(3, 3), -- Redes -> Tanenbaum
(4, 4), -- Dom Casmurro -> Machado de Assis
(5, 5); -- Cálculo -> James Stewart

-- EXEMPLARES
INSERT INTO exemplar (id_livro, numero_exemplar, localizacao, disponibilidade) VALUES
(1, 1, 'Estante A1', 'disponivel'),
(1, 2, 'Estante A1', 'disponivel'),
(2, 1, 'Estante B2', 'disponivel'),
(3, 1, 'Estante C3', 'disponivel'),
(3, 2, 'Estante C3', 'disponivel'),
(4, 1, 'Estante D4', 'disponivel'),
(5, 1, 'Estante E5', 'disponivel'),
(5, 2, 'Estante E5', 'disponivel');



