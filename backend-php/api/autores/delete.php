<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    enviarResposta("erro", "Método inválido. Use DELETE.", null, 405);
}

// Vamos pegar o ID pela URL (ex: delete.php?id=1)
$id = isset($_GET['id']) ? $_GET['id'] : null;

if (!$id) {
    enviarResposta("erro", "ID do autor não fornecido.", null, 400);
}

try {
    $stmt = $pdo->prepare("DELETE FROM autor WHERE id_autor = ?");
    $stmt->execute([$id]);

    if ($stmt->rowCount() > 0) {
        enviarResposta("sucesso", "Autor excluído com sucesso!", null, 200);
    } else {
        enviarResposta("erro", "Autor não encontrado.", null, 404);
    }

} catch (PDOException $e) {
    // Código 23000 geralmente é violação de chave estrangeira (Integrity constraint violation)
    if ($e->getCode() == '23000') {
        enviarResposta("erro", "Não é possível excluir este autor pois ele possui livros cadastrados.", null, 409);
    } else {
        enviarResposta("erro", "Erro ao excluir: " . $e->getMessage(), null, 500);
    }
}
?>