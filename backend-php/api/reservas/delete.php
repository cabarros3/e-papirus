<?php

require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    enviarResposta("erro", "Método inválido. Use DELETE.", null, 405);
}

$idReserva = $_GET['id'] ?? null;

if (!$idReserva) {
    enviarResposta("erro", "ID da reserva é obrigatório.", null, 400);
}

try {
    $pdo->beginTransaction();

    // Busca a reserva e o exemplar específico associado a ela
    $sqlBusca = "SELECT id_exemplar, status
                 FROM reserva
                 WHERE id_reserva = ?
                 FOR UPDATE";

    $stmtBusca = $pdo->prepare($sqlBusca);
    $stmtBusca->execute([$idReserva]);
    $reserva = $stmtBusca->fetch(PDO::FETCH_ASSOC);

    if (!$reserva) {
        $pdo->rollBack();
        enviarResposta("erro", "Reserva não encontrada.", null, 404);
    }

    if ($reserva['status'] !== 'ativa') {
        $pdo->rollBack();
        enviarResposta(
            "erro",
            "Esta reserva não está ativa e não pode ser cancelada.",
            null,
            409
        );
    }

    // Libera exatamente o exemplar da reserva
    $sqlLiberar = "UPDATE exemplar
                   SET disponibilidade = 'disponivel'
                   WHERE id_exemplar = ?";

    $stmtLiberar = $pdo->prepare($sqlLiberar);
    $stmtLiberar->execute([$reserva['id_exemplar']]);

    // Mantém a reserva no histórico e apenas altera seu status
    $sqlCancelar = "UPDATE reserva
                    SET status = 'cancelada'
                    WHERE id_reserva = ?";

    $stmtCancelar = $pdo->prepare($sqlCancelar);
    $stmtCancelar->execute([$idReserva]);

    $pdo->commit();

    enviarResposta(
        "sucesso",
        "Reserva cancelada e exemplar liberado.",
        null,
        200
    );

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    enviarResposta(
        "erro",
        "Erro ao cancelar reserva: " . $e->getMessage(),
        null,
        500
    );
}
?>
