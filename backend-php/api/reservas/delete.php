<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    enviarResposta("erro", "Método inválido. Use DELETE.", null, 405);
}

// Pega o ID via URL (ex: delete.php?id=5)
$idReserva = $_GET['id'] ?? null;

if (!$idReserva) {
    enviarResposta("erro", "ID da reserva é obrigatório.", null, 400);
}

try {
    $pdo->beginTransaction();

    // 1. Antes de deletar, precisamos saber qual livro/exemplar estava reservado
    // para liberar a disponibilidade
    $sqlBusca = "SELECT id_livro FROM reserva WHERE id_reserva = ?";
    $stmtBusca = $pdo->prepare($sqlBusca);
    $stmtBusca->execute([$idReserva]);
    $reserva = $stmtBusca->fetch(PDO::FETCH_ASSOC);

    if ($reserva) {
        // 2. Liberar o primeiro exemplar que estiver 'reservado' desse livro
        $sqlLiberar = "UPDATE exemplar SET disponibilidade = 'disponivel' 
                       WHERE id_livro = ? AND disponibilidade = 'reservado' 
                       LIMIT 1";
        $stmtLiberar = $pdo->prepare($sqlLiberar);
        $stmtLiberar->execute([$reserva['id_livro']]);
    }

    // 3. Deleta a reserva (ou muda o status para 'cancelada' se preferir manter histórico)
    $sqlDelete = "DELETE FROM reserva WHERE id_reserva = ?";
    $stmtDelete = $pdo->prepare($sqlDelete);
    $stmtDelete->execute([$idReserva]);

    $pdo->commit();
    enviarResposta("sucesso", "Reserva cancelada e exemplar liberado.", null, 200);

} catch (PDOException $e) {
    $pdo->rollBack();
    enviarResposta("erro", "Erro ao cancelar reserva: " . $e->getMessage(), null, 500);
}
?>