<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    enviarResposta("erro", "Método inválido. Use DELETE.", null, 405);
}

$id = isset($_GET['id']) ? $_GET['id'] : null;

if (!$id) {
    enviarResposta("erro", "ID da pessoa obrigatório.", null, 400);
}

try {
    // Tenta deletar
    $stmt = $pdo->prepare("DELETE FROM pessoa WHERE id_pessoa = ?");
    $stmt->execute([$id]);

    if ($stmt->rowCount() > 0) {
        enviarResposta("sucesso", "Pessoa removida do sistema.", null, 200);
    } else {
        enviarResposta("erro", "Pessoa não encontrada.", null, 404);
    }

} catch (PDOException $e) {
    // Tratamento de FK (Empréstimos ou Usuário de Sistema vinculados)
    if ($e->getCode() == '23000') {
        enviarResposta("erro", "Não é possível excluir: Esta pessoa possui login no sistema ou histórico de empréstimos.", null, 409);
    } else {
        enviarResposta("erro", "Erro ao excluir: " . $e->getMessage(), null, 500);
    }
}
?>