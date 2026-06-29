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

    // 1. Buscar dados do empréstimo (para saber qual é o exemplar e o livro)
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

    // Buscar dados para mensagem de confirmação (nome do aluno, email)
    $sqlDados = "
        SELECT
            p.nome AS aluno_nome,
            p.email AS aluno_email,
            emp.data_emprestimo,
            emp.data_prevista
        FROM emprestimo emp
        JOIN pessoa p ON emp.id_pessoa = p.id_pessoa
        WHERE emp.id_emprestimo = ?
        LIMIT 1
    ";
    $stmtDados = $pdo->prepare($sqlDados);
    $stmtDados->execute([$data->id_emprestimo]);
    $dadosEmprestimo = $stmtDados->fetch(PDO::FETCH_ASSOC);

    $dataHoje = date('Y-m-d');

    // 2. Atualizar tabela EMPRESTIMO (setar data_devolucao)
    $stmtUpEmp = $pdo->prepare("UPDATE emprestimo SET data_devolucao = ? WHERE id_emprestimo = ?");
    $stmtUpEmp->execute([$dataHoje, $data->id_emprestimo]);

    // 3. Atualizar tabela EXEMPLAR (liberar para 'disponivel')
    $stmtUpEx = $pdo->prepare("UPDATE exemplar SET disponibilidade = 'disponivel' WHERE id_exemplar = ?");
    $stmtUpEx->execute([$emp['id_exemplar']]);

    $pdo->commit();

    // ============================================
    // 4. NOTIFICAÇÃO DE CONFIRMAÇÃO DE DEVOLUÇÃO
    // ============================================
    $emailValido = !empty($dadosEmprestimo['aluno_email']) && filter_var($dadosEmprestimo['aluno_email'], FILTER_VALIDATE_EMAIL);
    if ($emailValido) {
        ob_start();
        try {
            if (class_exists('App\\Services\\EmailService')) {
                $emailService = new \App\Services\EmailService();
                $assunto = "Confirmacao de Devolucao - e-Papirus";
                $corpo = "<h2>Olá, {$dadosEmprestimo['aluno_nome']}!</h2>";
                $corpo .= "<p>Registramos a devolução do livro <strong>{$emp['livro_titulo']}</strong> em " . date('d/m/Y', strtotime($dataHoje)) . ".</p>";
                if ($dataHoje > $dadosEmprestimo['data_prevista']) {
                    $corpo .= "<p><strong>Observação:</strong> A devolução foi realizada com atraso.</p>";
                }
                $corpo .= "<p>Obrigado,<br/>Equipe e-Papirus</p>";

                $emailService->enviar($dadosEmprestimo['aluno_email'], $assunto, $corpo);
            }
        } catch (\Throwable $t) {
            error_log("Falha ao enviar e-mail de devolução: " . $t->getMessage());
        }
        ob_end_clean();
    }

    // ============================================
    // 5. NOTIFICAÇÃO DE RESERVA DISPONÍVEL
    // ============================================
    try {
        // Buscar reservas ativas para este livro
        $sqlReserva = "
            SELECT
                r.id_reserva,
                r.id_pessoa,
                p.nome AS pessoa_nome,
                p.email AS pessoa_email,
                r.data_expiracao
            FROM reserva r
            JOIN pessoa p ON r.id_pessoa = p.id_pessoa
            WHERE r.id_livro = ?
            AND r.status = 'ativa'
            AND r.data_expiracao >= CURDATE()
            ORDER BY r.data_reserva ASC
            LIMIT 1
        ";
        $stmtReserva = $pdo->prepare($sqlReserva);
        $stmtReserva->execute([$emp['id_livro']]);
        $reserva = $stmtReserva->fetch(PDO::FETCH_ASSOC);

        if ($reserva && !empty($reserva['pessoa_email']) && filter_var($reserva['pessoa_email'], FILTER_VALIDATE_EMAIL)) {
            // Enviar e-mail de reserva disponível
            $emailService = new \App\Services\EmailService();
            $assuntoReserva = "Reserva Disponivel - e-Papirus";

            $corpoReserva = "
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #27ae60; color: white; padding: 15px; text-align: center; }
                    .content { padding: 20px; background: #f9f9f9; }
                    .footer { text-align: center; padding: 10px; font-size: 12px; color: #666; }
                    .alert { background: #d5f5e3; padding: 15px; border-left: 4px solid #27ae60; margin: 15px 0; }
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header'>
                        <h2>e-Papirus</h2>
                    </div>
                    <div class='content'>
                        <h3>Olá, " . $reserva['pessoa_nome'] . "!</h3>
                        <div class='alert'>
                            <p><strong>O livro que você reservou está disponível!</strong></p>
                        </div>
                        <p><strong>Livro:</strong> " . $emp['livro_titulo'] . "</p>
                        <p><strong>Prazo para retirada:</strong> " . date('d/m/Y', strtotime($reserva['data_expiracao'])) . "</p>
                        <p>Compareça à biblioteca para retirar o livro dentro do prazo.</p>
                        <p>Atenciosamente,<br/>Equipe e-Papirus</p>
                    </div>
                    <div class='footer'>
                        <p>Este e-mail foi enviado automaticamente pelo sistema e-Papirus.</p>
                    </div>
                </div>
            </body>
            </html>
            ";

            $enviouReserva = $emailService->enviar($reserva['pessoa_email'], $assuntoReserva, $corpoReserva);

            if ($enviouReserva) {
                // Registrar notificação
                $insertNotif = $pdo->prepare("
                    INSERT INTO notificacao (id_pessoa, tipo_notificacao, assunto, status)
                    VALUES (?, 'reserva_disponivel', ?, 'enviado')
                ");
                $insertNotif->execute([$reserva['id_pessoa'], $assuntoReserva]);

                // Atualizar status da reserva para 'concluida' (opcional - pode ser feito depois quando retirar)
                // $updateReserva = $pdo->prepare("UPDATE reserva SET status = 'concluida' WHERE id_reserva = ?");
                // $updateReserva->execute([$reserva['id_reserva']]);
            } else {
                // Registrar erro
                $insertNotif = $pdo->prepare("
                    INSERT INTO notificacao (id_pessoa, tipo_notificacao, assunto, status, mensagem_erro)
                    VALUES (?, 'reserva_disponivel', ?, 'erro', 'Falha no envio do e-mail')
                ");
                $insertNotif->execute([$reserva['id_pessoa'], $assuntoReserva]);
            }
        }
    } catch (\Throwable $t) {
        error_log("Falha ao enviar notificação de reserva disponível: " . $t->getMessage());
        // Não impede a devolução
    }

    // ============================================
    // 6. RESPOSTA
    // ============================================
    $mensagem = "Devolução realizada com sucesso.";
    if ($dataHoje > $dadosEmprestimo['data_prevista']) {
        $mensagem .= " (ATENÇÃO: Devolvido com atraso!)";
    }

    enviarResposta("sucesso", $mensagem, null, 200);

} catch (PDOException $e) {
    $pdo->rollBack();
    enviarResposta("erro", "Erro na devolução: " . $e->getMessage(), null, 500);
}
?>
