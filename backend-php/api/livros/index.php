<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    enviarResposta("erro", "Método inválido. Use GET.", null, 405);
}

$id = isset($_GET['id']) ? $_GET['id'] : null;

try {
    // Monta a query para buscar Livro + Nome do Assunto + Nomes dos Autores
    $sql = "SELECT 
                l.id_livro, 
                l.titulo, 
                l.editora, 
                l.ano_publicacao,
                l.cidade_publicacao,
                l.nota_resumo,
                l.descricao_fisica,
                a.nome_assunto,
                GROUP_CONCAT(aut.nome_autor SEPARATOR ', ') as nomes_autores
            FROM livro l
            JOIN assunto a ON l.id_assunto = a.id_assunto
            LEFT JOIN livro_autor la ON l.id_livro = la.id_livro
            LEFT JOIN autor aut ON la.id_autor = aut.id_autor";

    // Se tiver ID, adiciona o filtro WHERE
    if ($id) {
        $sql .= " WHERE l.id_livro = ?";
    }

    // Agrupa pelo ID do livro para o GROUP_CONCAT funcionar e não repetir linhas
    $sql .= " GROUP BY l.id_livro";
    
    // Ordena por título se for listagem geral
    if (!$id) {
        $sql .= " ORDER BY l.titulo ASC";
    }

    $stmt = $pdo->prepare($sql);
    
    if ($id) {
        $stmt->execute([$id]);
        $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
    } else {
        $stmt->execute();
        $resultado = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    if ($resultado) {
        enviarResposta("sucesso", "Livros encontrados.", $resultado, 200);
    } else {
        enviarResposta("erro", "Nenhum livro encontrado.", null, 404);
    }

} catch (PDOException $e) {
    enviarResposta("erro", "Erro no banco: " . $e->getMessage(), null, 500);
}
?>