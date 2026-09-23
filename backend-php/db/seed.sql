USE e_papirus;

-- ASSUNTOS (IDs de 1 a 13)
INSERT INTO assunto (nome_assunto) VALUES
('Programação'),
('Banco de Dados'),
('Redes de Computadores'),
('Literatura Brasileira'),
('Matemática'),
('Fantasia'),
('Ficção Científica'),
('Sistemas Operacionais'),
('Engenharia de Software'),
('Inteligência Artificial'),
('História'),
('Filosofia'),
('Poesia');

-- AUTORES
INSERT INTO autor (nome_autor) VALUES
('Robert C. Martin'),
('Abraham Silberschatz'),
('Andrew S. Tanenbaum'),
('Machado de Assis'),
('James Stewart'),
('J.R.R. Tolkien'),
('Frank Herbert'),
('George Orwell'),
('Thomas H. Cormen'),
('Ian Sommerville'),
('Stuart Russell'),
('Peter Norvig'),
('Graciliano Ramos'),
('Jorge Amado'),
('Clarice Lispector'),
('Yuval Noah Harari'),
('Jostein Gaarder'),
('Marco Aurélio'),
('Luís de Camões'),
('Loiane Groner');

-- LIVROS (Anos de publicação ajustados para a obra original e referências de assunto corrigidas)
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

(4, 'Dom Casmurro', 'Livraria Garnier', 'Rio de Janeiro', 1899,
 'Clássico da literatura brasileira narrado por Bentinho, o Dom Casmurro.',
 'https://static.wixstatic.com/media/5801fd_4de6ed5dc5ea458094e4268b05378b79~mv2.jpg/v1/fill/w_640,h_1000,al_c,q_85,usm_0.66_1.00_0.01/5801fd_4de6ed5dc5ea458094e4268b05378b79~mv2.jpg',
 '256 páginas; 21 cm'),

(5, 'Cálculo: Volume 1', 'Cengage Learning', 'São Paulo', 2013,
 'Introdução ao cálculo diferencial e integral com exemplos aplicados.',
 'https://covers.openlibrary.org/b/isbn/9788522112586-L.jpg',
 '620 páginas; 26 cm'),

(6, 'O Senhor dos Anéis: A Sociedade do Anel', 'Allen & Unwin', 'Londres', 1954,
 'Primeiro volume da trilogia que acompanha a jornada de Frodo para destruir o Um Anel.',
 'https://covers.openlibrary.org/b/isbn/9788595084742-L.jpg',
 '576 páginas; 23 cm'),

(7, 'Duna', 'Chilton Books', 'Filadélfia', 1965,
 'Ficção científica ambientada no planeta desértico Arrakis, com política, religião e ecologia em disputa.',
 'https://covers.openlibrary.org/b/isbn/9788576573197-L.jpg',
 '624 páginas; 23 cm'),

(7, '1984', 'Secker and Warburg', 'Londres', 1949,
 'Distopia sobre vigilância totalitária e controle da linguagem e do pensamento.',
 'https://covers.openlibrary.org/b/isbn/9788535914849-L.jpg',
 '416 páginas; 21 cm'),

(8, 'Sistemas Operacionais Modernos', 'Pearson', 'São Paulo', 2016,
 'Estudo detalhado de processos, memória, arquivos e escalonamento em sistemas operacionais atuais.',
 'https://covers.openlibrary.org/b/isbn/9788543005676-L.jpg',
 '840 páginas; 24 cm'),

(1, 'Introdução aos Algoritmos', 'Campus/Elsevier', 'Rio de Janeiro', 2012,
 'Referência abrangente sobre projeto e análise de algoritmos, conhecida como "CLRS".',
 'https://http2.mlstatic.com/D_NQ_NP_871678-MLA84206494872_052025-O.webp',
 '944 páginas; 25 cm'),

(9, 'Engenharia de Software', 'Pearson', 'São Paulo', 2011,
 'Panorama dos processos, requisitos, projeto e gestão envolvidos no desenvolvimento de software.',
 'https://martinsfontespaulista.vteximg.com.br/arquivos/ids/268950-800-800/866434_detalhes.jpg',
 '552 páginas; 24 cm'),

(10, 'Inteligência Artificial: Uma Abordagem Moderna', 'Campus/Elsevier', 'Rio de Janeiro', 2013,
 'Livro-texto de referência em IA, cobrindo busca, lógica, aprendizado de máquina e agentes inteligentes.',
 'https://covers.openlibrary.org/b/isbn/9788535237016-L.jpg',
 '988 páginas; 25 cm'),

(4, 'Vidas Secas', 'José Olympio', 'Rio de Janeiro', 1938,
 'Retrato da seca nordestina e da luta de uma família de retirantes pela sobrevivência.',
 'https://upload.wikimedia.org/wikipedia/commons/7/74/Vidas_Secas_de_Graciliano_Ramos_-_Capa_da_1%C2%AA_edi%C3%A7%C3%A3o_pela_Jos%C3%A9_Olympio_%281938%29.jpg',
 '176 páginas; 21 cm'),

(4, 'Capitães da Areia', 'José Olympio', 'Rio de Janeiro', 1937,
 'A vida de um grupo de meninos abandonados nas ruas de Salvador.',
 'https://www.literalmenteuai.com.br/wp-content/uploads/2019/07/Capa-Capit%C3%A3es-de-Areia-Jorge-Amado.jpg',
 '280 páginas; 21 cm'),

(4, 'A Hora da Estrela', 'Rocco', 'Rio de Janeiro', 1977,
 'A história de Macabéa, uma jovem nordestina que tenta sobreviver no Rio de Janeiro.',
 'https://rocco.com.br/wp-content/uploads/2025/04/9786555325218.jpg',
 '96 páginas; 20 cm'),

(11, 'Sapiens: Uma Breve História da Humanidade', 'Dvir Publishing House', 'Israel', 2011,
 'Percurso da evolução humana, das revoluções cognitiva e agrícola até a era moderna.',
 'https://cdl-static.s3-sa-east-1.amazonaws.com/covers/gg/9788535933826/sapiens-edicao-em-quadrinhos-o-nascimento-da-humanidade.jpg',
 '464 páginas; 23 cm'),

(12, 'O Mundo de Sofia', 'Aschehoug', 'Oslo', 1991,
 'Introdução à história da filosofia contada através da jornada de uma jovem estudante.',
 'https://cdl-static.s3-sa-east-1.amazonaws.com/covers/gg/9788555342714/o-mundo-de-sofia-em-quadrinhos-vol-1.jpg',
 '552 páginas; 21 cm'),

(12, 'Meditações', 'Edipro', 'São Paulo', 2011,
 'Reflexões pessoais do imperador romano sobre estoicismo, virtude e autodisciplina.',
 'https://encrypted-tbn0.gstatic.com/licensed-image?q=tbn:ANd9GcQISTwALkDQJFQP64o2ItkGPaVZYIoO8G0ObzKBmYaE2ON4H9-QFkPg7g04B0wM8kLD72EzOq6NSrecvos',
 '224 páginas; 21 cm'),

(13, 'Os Lusíadas', 'António Gonçalves', 'Lisboa', 1572,
 'Poema épico que narra as grandes navegações e a história de Portugal.',
 'https://encrypted-tbn2.gstatic.com/licensed-image?q=tbn:ANd9GcRUN5W08iCAujnYaKJWwBMBZ4UQvbZofPXh6Lr71dR208RCs67qtMi1MB8fUYSNUl4Tc-4dM2dDoueMmtg',
 '320 páginas; 21 cm'),

(1, 'Estruturas de Dados e Algoritmos com JavaScript', 'Novatec', 'São Paulo', 2017,
 'Implementação prática de estruturas de dados e algoritmos clássicos usando JavaScript.',
 'https://http2.mlstatic.com/D_NQ_NP_654685-MLA108194825401_032026-O.webp',
 '272 páginas; 23 cm');

-- LIVRO_AUTOR
INSERT INTO livro_autor (id_livro, id_autor) VALUES
(1, 1),  -- Código Limpo -> Robert C. Martin
(2, 2),  -- SGBD -> Silberschatz
(3, 3),  -- Redes -> Tanenbaum
(4, 4),  -- Dom Casmurro -> Machado de Assis
(5, 5),  -- Cálculo -> James Stewart
(6, 6),  -- Senhor dos Anéis -> Tolkien
(7, 7),  -- Duna -> Frank Herbert
(8, 8),  -- 1984 -> George Orwell
(9, 3),  -- Sistemas Operacionais Modernos -> Tanenbaum
(10, 9), -- Introdução aos Algoritmos -> Cormen
(11, 10), -- Engenharia de Software -> Sommerville
(12, 11), -- IA: Abordagem Moderna -> Stuart Russell
(12, 12), -- IA: Abordagem Moderna -> Peter Norvig
(13, 13), -- Vidas Secas -> Graciliano Ramos
(14, 14), -- Capitães da Areia -> Jorge Amado
(15, 15), -- A Hora da Estrela -> Clarice Lispector
(16, 16), -- Sapiens -> Yuval Noah Harari
(17, 17), -- O Mundo de Sofia -> Jostein Gaarder
(18, 18), -- Meditações -> Marco Aurélio
(19, 19), -- Os Lusíadas -> Luís de Camões
(20, 20); -- Estruturas de Dados com JS -> Loiane Groner

-- EXEMPLARES
INSERT INTO exemplar (id_livro, numero_exemplar, localizacao, disponibilidade) VALUES
(1, 1, 'Estante A1', 'disponivel'),
(1, 2, 'Estante A1', 'disponivel'),
(2, 1, 'Estante B2', 'disponivel'),
(3, 1, 'Estante C3', 'disponivel'),
(3, 2, 'Estante C3', 'disponivel'),
(4, 1, 'Estante D4', 'disponivel'),
(5, 1, 'Estante E5', 'disponivel'),
(5, 2, 'Estante E5', 'disponivel'),
(6, 1, 'Estante F6', 'disponivel'),
(6, 2, 'Estante F6', 'disponivel'),
(7, 1, 'Estante F6', 'disponivel'),
(8, 1, 'Estante F6', 'disponivel'),
(8, 2, 'Estante F6', 'disponivel'),
(9, 1, 'Estante A1', 'disponivel'),
(10, 1, 'Estante A1', 'disponivel'),
(10, 2, 'Estante A1', 'disponivel'),
(11, 1, 'Estante A1', 'disponivel'),
(12, 1, 'Estante A1', 'disponivel'),
(13, 1, 'Estante D4', 'disponivel'),
(14, 1, 'Estante D4', 'disponivel'),
(15, 1, 'Estante D4', 'disponivel'),
(15, 2, 'Estante D4', 'disponivel'),
(16, 1, 'Estante G7', 'disponivel'),
(17, 1, 'Estante H8', 'disponivel'),
(18, 1, 'Estante H8', 'disponivel'),
(19, 1, 'Estante I9', 'disponivel'),
(20, 1, 'Estante A1', 'disponivel');