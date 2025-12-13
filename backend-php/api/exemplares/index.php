<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    enviarResposta("erro", "Método inválido. Use GET.", null, 405);
}

$id_livro = isset($_GET['id_livro']) ? $_GET['id_livro'] : null;
$id_exemplar = isset($_GET['id']) ? $_GET['id'] : null;

try {
    // CORREÇÃO: Removido l.isbn
    $sql = "SELECT 
                e.id_exemplar, 
                e.localizacao, 
                e.disponibilidade, 
                l.id_livro,
                l.titulo,
                l.editora 
            FROM exemplar e
            JOIN livro l ON e.id_livro = l.id_livro";
    
    $params = [];
    $conditions = [];

    // Filtros dinâmicos
    if ($id_exemplar) {
        $conditions[] = "e.id_exemplar = ?";
        $params[] = $id_exemplar;
    } 
    
    if ($id_livro) {
        $conditions[] = "e.id_livro = ?";
        $params[] = $id_livro;
    }

    if (count($conditions) > 0) {
        $sql .= " WHERE " . implode(" AND ", $conditions);
    }

    $sql .= " ORDER BY e.id_exemplar ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $resultado = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if ($resultado) {
        enviarResposta("sucesso", "Exemplares encontrados.", $resultado, 200);
    } else {
        enviarResposta("erro", "Nenhum exemplar encontrado.", null, 404);
    }

} catch (PDOException $e) {
    enviarResposta("erro", "Erro ao buscar exemplares: " . $e->getMessage(), null, 500);
}
?>