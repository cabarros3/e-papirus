<?php

require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';
require_once '../../config.php';
require_once '../../vendor/autoload.php';

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
    $sqlExemplar = "SELECT disponibilidade, id_livro
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

    // --- BUSCA DADOS PARA O E-MAIL ---
    $sqlInfo = "SELECT p.nome AS aluno_nome, p.email AS aluno_email, l.titulo, a.nome_autor
                FROM pessoa p
                JOIN livro l ON l.id_livro = ?
                LEFT JOIN livro_autor la ON la.id_livro = l.id_livro
                LEFT JOIN autor a ON a.id_autor = la.id_autor
                WHERE p.id_pessoa = ? LIMIT 1";
    $stmtInfo = $pdo->prepare($sqlInfo);
    $stmtInfo->execute([$exemplar['id_livro'], $reserva['id_pessoa']]);
    $info = $stmtInfo->fetch(PDO::FETCH_ASSOC);

    // Confirma todas as alterações
    $pdo->commit();

    // --- ENVIAR NOTIFICAÇÃO DE RESERVA CONFIRMADA ---
    $emailValido = !empty($info['aluno_email']) && filter_var($info['aluno_email'], FILTER_VALIDATE_EMAIL);
    if ($emailValido) {
        try {
            $emailService = new \App\Services\EmailService();
            $enviou = $emailService->enviarNotificacao(
                $info['aluno_email'],
                'reserva_confirmada',
                [
                    'nome'  => $info['aluno_nome'],
                    'livro' => $info['titulo'],
                    'autor' => $info['nome_autor'] ?? 'Autor não informado',
                    'data'  => date('d/m/Y', strtotime($dataPrevista))
                ]
            );

            if ($enviou) {
                $insertNotif = $pdo->prepare("INSERT INTO notificacao (id_pessoa, id_emprestimo, tipo_notificacao, assunto, status) VALUES (?, ?, 'reserva_confirmada', 'Reserva Confirmada e Empréstimo Realizado', 'enviado')");
                $insertNotif->execute([$reserva['id_pessoa'], $idEmprestimo]);
            } else {
                $insertNotif = $pdo->prepare("INSERT INTO notificacao (id_pessoa, id_emprestimo, tipo_notificacao, assunto, status, mensagem_erro) VALUES (?, ?, 'reserva_confirmada', 'Reserva Confirmada e Empréstimo Realizado', 'erro', 'Falha no envio')");
                $insertNotif->execute([$reserva['id_pessoa'], $idEmprestimo]);
            }
        } catch (\Throwable $e) {
            error_log("Falha ao enviar e-mail de reserva confirmada: " . $e->getMessage());
        }
    }

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
