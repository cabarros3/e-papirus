<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    enviarResposta("erro", "Método inválido. Use PUT.", null, 405);
}

$data = json_decode(file_get_contents("php://input"));

if (empty($data->id_reserva) || empty($data->status)) {
    enviarResposta("erro", "ID da reserva e novo status são obrigatórios.", null, 400);
}

try {
    $sql = "UPDATE reserva SET status = ? WHERE id_reserva = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$data->status, $data->id_reserva]);

    enviarResposta("sucesso", "Status da reserva atualizado!", null, 200);
} catch (PDOException $e) {
    enviarResposta("erro", "Erro ao atualizar: " . $e->getMessage(), null, 500);
}
?>