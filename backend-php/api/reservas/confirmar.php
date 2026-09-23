<?php

require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    enviarResposta("erro", "Método inválido. Use POST.", null, 405);
}

$data = json_decode(file_get_contents("php://input"));

if (empty($data->id_reserva)) {
    enviarResposta("erro", "ID da reserva é obrigatório.", null, 400);
}

try {
    $pdo->beginTransaction();

    // Busca a reserva e bloqueia o registro durante a transação
    $sqlReserva = "SELECT id_exemplar, id_pessoa, status
                   FROM reserva
                   WHERE id_reserva = ?
                   FOR UPDATE";

    $stmtReserva = $pdo->prepare($sqlReserva);
    $stmtReserva->execute([$data->id_reserva]);
    $reserva = $stmtReserva->fetch(PDO::FETCH_ASSOC);

    if (!$reserva) {
        $pdo->rollBack();
        enviarResposta("erro", "Reserva não encontrada.", null, 404);
    }

    if ($reserva['status'] !== 'ativa') {
        $pdo->rollBack();
        enviarResposta(
            "erro",
            "Esta reserva não está ativa e não pode ser confirmada.",
            null,
            409
        );
    }

    // Verifica o exemplar específico da reserva
    $sqlExemplar = "SELECT disponibilidade
                    FROM exemplar
                    WHERE id_exemplar = ?
                    FOR UPDATE";

    $stmtExemplar = $pdo->prepare($sqlExemplar);
    $stmtExemplar->execute([$reserva['id_exemplar']]);
    $exemplar = $stmtExemplar->fetch(PDO::FETCH_ASSOC);

    if (!$exemplar) {
        $pdo->rollBack();
        enviarResposta("erro", "Exemplar da reserva não encontrado.", null, 404);
    }

    if ($exemplar['disponibilidade'] !== 'reservado') {
        $pdo->rollBack();
        enviarResposta(
            "erro",
            "O exemplar desta reserva não está mais reservado.",
            null,
            409
        );
    }

    // Cria o empréstimo
    $dataHoje = date('Y-m-d');
    $dataPrevista = date('Y-m-d', strtotime("+7 days"));

    $sqlInsert = "INSERT INTO emprestimo
                  (id_exemplar, id_pessoa, data_emprestimo, data_prevista)
                  VALUES (?, ?, ?, ?)";

    $stmtInsert = $pdo->prepare($sqlInsert);
    $stmtInsert->execute([
        $reserva['id_exemplar'],
        $reserva['id_pessoa'],
        $dataHoje,
        $dataPrevista
    ]);

    $idEmprestimo = $pdo->lastInsertId();

    // Altera o exemplar para emprestado
    $sqlAtualizaExemplar = "UPDATE exemplar
                            SET disponibilidade = 'emprestado'
                            WHERE id_exemplar = ?";

    $stmtAtualizaExemplar = $pdo->prepare($sqlAtualizaExemplar);
    $stmtAtualizaExemplar->execute([
        $reserva['id_exemplar']
    ]);

    // Finaliza a reserva
    $sqlConcluirReserva = "UPDATE reserva
                           SET status = 'concluida'
                           WHERE id_reserva = ?";

    $stmtConcluirReserva = $pdo->prepare($sqlConcluirReserva);
    $stmtConcluirReserva->execute([
        $data->id_reserva
    ]);

    // Confirma todas as alterações
    $pdo->commit();

    enviarResposta(
        "sucesso",
        "Reserva confirmada e empréstimo realizado!",
        [
            "id_emprestimo" => $idEmprestimo,
            "data_prevista" => $dataPrevista
        ],
        201
    );

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    enviarResposta(
        "erro",
        "Erro de banco de dados: " . $e->getMessage(),
        null,
        500
    );
}
