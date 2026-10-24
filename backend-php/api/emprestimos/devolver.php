<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';
require_once '../../config.php';
require_once '../../vendor/autoload.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    enviarResposta("erro", "Método inválido. Use PUT.", null, 405);
}

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->id_emprestimo)) {
    enviarResposta("erro", "ID do empréstimo obrigatório.", null, 400);
}

try {
    $pdo->beginTransaction();

    // 1. Buscar dados do empréstimo
    $stmtGet = $pdo->prepare("
        SELECT
            e.id_exemplar,
            e.data_prevista,
            e.data_devolucao,
            ex.id_livro,
            l.titulo AS livro_titulo
        FROM emprestimo e
        JOIN exemplar ex ON e.id_exemplar = ex.id_exemplar
        JOIN livro l ON ex.id_livro = l.id_livro
        WHERE e.id_emprestimo = ?
    ");
    $stmtGet->execute([$data->id_emprestimo]);
    $emp = $stmtGet->fetch(PDO::FETCH_ASSOC);

    if (!$emp) {
        $pdo->rollBack();
        enviarResposta("erro", "Empréstimo não encontrado.", null, 404);
        exit;
    }

    if ($emp['data_devolucao'] !== null) {
        $pdo->rollBack();
        enviarResposta("erro", "Este empréstimo já foi devolvido.", null, 409);
        exit;
    }

    // 2. Buscar dados do aluno
    $sqlDados = "SELECT p.nome AS aluno_nome, p.email AS aluno_email FROM emprestimo emp JOIN pessoa p ON emp.id_pessoa = p.id_pessoa WHERE emp.id_emprestimo = ?";
    $stmtDados = $pdo->prepare($sqlDados);
    $stmtDados->execute([$data->id_emprestimo]);
    $dadosEmprestimo = $stmtDados->fetch(PDO::FETCH_ASSOC);

    $dataHoje = date('Y-m-d');

    // 3. Atualizar tabelas
    $stmtUpEmp = $pdo->prepare("UPDATE emprestimo SET data_devolucao = ? WHERE id_emprestimo = ?");
    $stmtUpEmp->execute([$dataHoje, $data->id_emprestimo]);

    $stmtUpEx = $pdo->prepare("UPDATE exemplar SET disponibilidade = 'disponivel' WHERE id_exemplar = ?");
    $stmtUpEx->execute([$emp['id_exemplar']]);

    $pdo->commit();

    // ============================================
    // 4. E-MAIL: CONFIRMAÇÃO DE DEVOLUÇÃO
    // ============================================
    $emailValido = !empty($dadosEmprestimo['aluno_email']) && filter_var($dadosEmprestimo['aluno_email'], FILTER_VALIDATE_EMAIL);

    if ($emailValido) {
        try {
            $emailService = new \App\Services\EmailService();

            $observacao = ($dataHoje > $dadosEmprestimo['data_prevista'])
                ? "⚠️ <strong>Observação:</strong> A devolução foi realizada com atraso."
                : "";

            $enviou = $emailService->enviarNotificacao(
                $dadosEmprestimo['aluno_email'],
                'devolucao',
                [
                    'nome'       => $dadosEmprestimo['aluno_nome'],
                    'livro'      => $emp['livro_titulo'],
                    'data'       => date('d/m/Y', strtotime($dataHoje)),
                    'observacao' => $observacao
                ]
            );

            if ($enviou) {
                $insertNotif = $pdo->prepare("INSERT INTO notificacao (id_pessoa, id_emprestimo, tipo_notificacao, assunto, status) VALUES (?, ?, 'devolucao', 'Devolução Confirmada', 'enviado')");
                $insertNotif->execute([$dadosEmprestimo['id_pessoa'] ?? $dadosEmprestimo['aluno_id'] ?? 0, $data->id_emprestimo]); // Fallback caso não tenha id_pessoa na busca
            } else {
                $insertNotif = $pdo->prepare("INSERT INTO notificacao (id_pessoa, id_emprestimo, tipo_notificacao, assunto, status, mensagem_erro) VALUES (?, ?, 'devolucao', 'Devolução Confirmada', 'erro', 'Falha no envio do e-mail')");
                $insertNotif->execute([$dadosEmprestimo['id_pessoa'] ?? $dadosEmprestimo['aluno_id'] ?? 0, $data->id_emprestimo]);
            }
        } catch (\Throwable $t) {
            error_log("Falha ao enviar e-mail de devolução: " . $t->getMessage());
        }
    }

    // ============================================
    // 5. E-MAIL: RESERVA DISPONÍVEL (se houver)
    // ============================================
    try {
        $sqlReserva = "SELECT r.id_pessoa, p.nome AS pessoa_nome, p.email AS pessoa_email, r.data_expiracao FROM reserva r JOIN pessoa p ON r.id_pessoa = p.id_pessoa WHERE r.id_livro = ? AND r.status = 'ativa' AND r.data_expiracao >= CURDATE() ORDER BY r.data_reserva ASC LIMIT 1";
        $stmtReserva = $pdo->prepare($sqlReserva);
        $stmtReserva->execute([$emp['id_livro']]);
        $reserva = $stmtReserva->fetch(PDO::FETCH_ASSOC);

        if ($reserva && !empty($reserva['pessoa_email']) && filter_var($reserva['pessoa_email'], FILTER_VALIDATE_EMAIL)) {
            $emailService = new \App\Services\EmailService();

            $enviouReserva = $emailService->enviarNotificacao(
                $reserva['pessoa_email'],
                'reserva_disponivel',
                [
                    'nome'  => $reserva['pessoa_nome'],
                    'livro' => $emp['livro_titulo'],
                    'data'  => date('d/m/Y', strtotime($reserva['data_expiracao']))
                ]
            );

            if ($enviouReserva) {
                $insertNotif = $pdo->prepare("INSERT INTO notificacao (id_pessoa, tipo_notificacao, assunto, status) VALUES (?, 'reserva_disponivel', 'O livro que você reservou está disponível!', 'enviado')");
                $insertNotif->execute([$reserva['id_pessoa']]);
            }
        }
    } catch (\Throwable $t) {
        error_log("Falha ao enviar notificação de reserva disponível: " . $t->getMessage());
    }

    // 6. Resposta
    $mensagem = "Devolução realizada com sucesso.";
    if ($dataHoje > $emp['data_prevista']) {
        $mensagem .= " (ATENÇÃO: Devolvido com atraso!)";
    }

    enviarResposta("sucesso", $mensagem, null, 200);

} catch (PDOException $e) {
    $pdo->rollBack();
    enviarResposta("erro", "Erro na devolução: " . $e->getMessage(), null, 500);
}
?>
