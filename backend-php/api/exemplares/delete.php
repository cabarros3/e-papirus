<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    enviarResposta("erro", "Método inválido. Use DELETE.", null, 405);
}

$id = isset($_GET['id']) ? $_GET['id'] : null;

if (!$id) {
    enviarResposta("erro", "ID do exemplar obrigatório.", null, 400);
}

try {
    $stmt = $pdo->prepare("DELETE FROM exemplar WHERE id_exemplar = ?");
    $stmt->execute([$id]);

    if ($stmt->rowCount() > 0) {
        enviarResposta("sucesso", "Exemplar removido do acervo.", null, 200);
    } else {
        enviarResposta("erro", "Exemplar não encontrado.", null, 404);
    }

} catch (PDOException $e) {
    // Código SQLSTATE 23000 = Violação de integridade (Foreign Key)
    if ($e->getCode() == '23000') {
        enviarResposta("erro", "Não é possível excluir: este exemplar possui histórico de empréstimos.", null, 409);
    } else {
        enviarResposta("erro", "Erro ao excluir: " . $e->getMessage(), null, 500);
    }
}
?>