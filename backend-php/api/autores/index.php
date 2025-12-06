<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    enviarResposta("erro", "Método inválido. Use GET.", null, 405);
}

$id = isset($_GET['id']) ? $_GET['id'] : null;

try {
    if ($id) {
        // Busca Específica
        $stmt = $pdo->prepare("SELECT * FROM autor WHERE id_autor = ?");
        $stmt->execute([$id]);
        $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
    } else {
        // Listar Todos (Ordenado por nome)
        $stmt = $pdo->prepare("SELECT * FROM autor ORDER BY nome_autor ASC");
        $stmt->execute();
        $resultado = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    if ($resultado) {
        enviarResposta("sucesso", "Autores encontrados.", $resultado, 200);
    } else {
        enviarResposta("erro", "Nenhum autor encontrado.", null, 404);
    }

} catch (PDOException $e) {
    enviarResposta("erro", "Erro ao buscar autores: " . $e->getMessage(), null, 500);
}
?>