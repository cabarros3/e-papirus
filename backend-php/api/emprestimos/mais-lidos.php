<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    enviarResposta("erro", "Método inválido. Use GET.", null, 405);
}

$limite = isset($_GET['limite']) ? (int)$_GET['limite'] : 10;

try {
    // Esta query une a lógica de contagem de empréstimos com a lógica de busca de autores
    $sql = "SELECT 
                l.id_livro, 
                l.titulo, 
                l.capa, 
                l.editora, 
                l.ano_publicacao,
                l.nota_resumo,
                a.nome_assunto,
                GROUP_CONCAT(DISTINCT aut.nome_autor SEPARATOR ', ') as nomes_autores,
                COUNT(DISTINCT emp.id_emprestimo) as total_emprestimos
            FROM livro l
            JOIN assunto a ON l.id_assunto = a.id_assunto
            LEFT JOIN livro_autor la ON l.id_livro = la.id_livro
            LEFT JOIN autor aut ON la.id_autor = aut.id_autor
            INNER JOIN exemplar e ON l.id_livro = e.id_livro
            INNER JOIN emprestimo emp ON e.id_exemplar = emp.id_exemplar
            GROUP BY l.id_livro
            ORDER BY total_emprestimos DESC
            LIMIT :limite";

    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':limite', $limite, PDO::PARAM_INT);
    $stmt->execute();
    
    $resultado = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if ($resultado) {
        enviarResposta("sucesso", "Ranking de livros mais lidos gerado.", $resultado, 200);
    } else {
        enviarResposta("sucesso", "Nenhum livro foi emprestado ainda.", [], 200);
    }

} catch (PDOException $e) {
    enviarResposta("erro", "Erro ao gerar ranking: " . $e->getMessage(), null, 500);
}
?>