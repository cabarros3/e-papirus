<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/utils.php';
require_once __DIR__ . '/../../db/db.php';
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../vendor/autoload.php';

$isCLI = php_sapi_name() === 'cli';

try {
    global $pdo;
    $pdo->beginTransaction();

    $hoje = date('Y-m-d');
    $totalEnviados = 0;

    // ============================================
    // PARTE 1: EMPRÉSTIMOS (LEMBRETE E ATRASO)
    // ============================================
    $sqlEmp = "
        SELECT e.id_emprestimo, e.id_pessoa, e.data_prevista, p.nome AS aluno_nome, p.email AS aluno_email, l.titulo AS livro_titulo, a.nome_autor
        FROM emprestimo e
        JOIN pessoa p ON e.id_pessoa = p.id_pessoa
        JOIN exemplar ex ON e.id_exemplar = ex.id_exemplar
        JOIN livro l ON ex.id_livro = l.id_livro
        LEFT JOIN livro_autor la ON la.id_livro = l.id_livro
        LEFT JOIN autor a ON a.id_autor = la.id_autor
        WHERE e.data_devolucao IS NULL
    ";
    $stmtEmp = $pdo->prepare($sqlEmp);
    $stmtEmp->execute();
    $emprestimos = $stmtEmp->fetchAll(PDO::FETCH_ASSOC);

    $emailService = new \App\Services\EmailService();

    foreach ($emprestimos as $emp) {
        $idEmprestimo = $emp['id_emprestimo'];
        $idPessoa = $emp['id_pessoa'];
        $dataPrevista = $emp['data_prevista'];
        $email = $emp['aluno_email'];
        $nome = $emp['aluno_nome'];
        $titulo = $emp['livro_titulo'];
        $autor = $emp['nome_autor'] ?? 'Autor não informado';

        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) continue;

        $diferenca = ceil((strtotime($dataPrevista) - strtotime($hoje)) / (60 * 60 * 24));
        $tipoEmail = '';
        $tipoLog = '';
        $assuntoLog = '';
        $variaveis = [];

        if ($diferenca < 0) {
            // ATRASO
            $diasAtraso = abs($diferenca);
            $check = $pdo->prepare("SELECT COUNT(*) FROM notificacao WHERE id_emprestimo = ? AND tipo_notificacao = 'atraso' AND status = 'enviado'");
            $check->execute([$idEmprestimo]);
            if ($check->fetchColumn() > 0) continue;

            $tipoEmail = 'atraso';
            $tipoLog = 'atraso';
            $assuntoLog = 'Atraso na devolução';
            $variaveis = ['nome' => $nome, 'livro' => $titulo, 'autor' => $autor, 'data' => date('d/m/Y', strtotime($dataPrevista)), 'dias' => $diasAtraso];

        } elseif ($diferenca <= 3 && $diferenca >= 0) {
            // LEMBRETE (3 dias ou 1 dia)
            $tipoLembrete = ($diferenca == 1) ? 'lembrete_1dia' : 'lembrete';
            $check = $pdo->prepare("SELECT COUNT(*) FROM notificacao WHERE id_emprestimo = ? AND tipo_notificacao = ? AND status = 'enviado'");
            $check->execute([$idEmprestimo, $tipoLembrete]);
            if ($check->fetchColumn() > 0) continue;

            $tipoEmail = 'lembrete';
            $tipoLog = $tipoLembrete;
            $assuntoLog = 'Seu empréstimo está perto do vencimento';
            $variaveis = ['nome' => $nome, 'livro' => $titulo, 'autor' => $autor, 'data' => date('d/m/Y', strtotime($dataPrevista)), 'dias' => $diferenca];
        } else {
            continue;
        }

        try {
            $enviou = $emailService->enviarNotificacao($email, $tipoEmail, $variaveis);
            if ($enviou) {
                $insert = $pdo->prepare("INSERT INTO notificacao (id_pessoa, id_emprestimo, tipo_notificacao, assunto, status) VALUES (?, ?, ?, ?, 'enviado')");
                $insert->execute([$idPessoa, $idEmprestimo, $tipoLog, $assuntoLog]);
                $totalEnviados++;
                if ($isCLI) echo "[" . date('Y-m-d H:i:s') . "] ✅ E-mail de empréstimo enviado para {$nome} - {$tipoLog}\n";
            } else {
                $insert = $pdo->prepare("INSERT INTO notificacao (id_pessoa, id_emprestimo, tipo_notificacao, assunto, status, mensagem_erro) VALUES (?, ?, ?, ?, 'erro', 'Falha no envio')");
                $insert->execute([$idPessoa, $idEmprestimo, $tipoLog, $assuntoLog]);
            }
        } catch (\Exception $e) {
            error_log("Erro e-mail empréstimo: " . $e->getMessage());
        }
    }

    // ============================================
    // PARTE 2: RESERVAS EXPIRADAS
    // ============================================
    $sqlRes = "
        SELECT r.id_reserva, r.id_pessoa, r.id_exemplar, r.data_expiracao, p.nome AS aluno_nome, p.email AS aluno_email, l.titulo, a.nome_autor
        FROM reserva r
        JOIN pessoa p ON r.id_pessoa = p.id_pessoa
        JOIN livro l ON r.id_livro = l.id_livro
        LEFT JOIN livro_autor la ON la.id_livro = l.id_livro
        LEFT JOIN autor a ON a.id_autor = la.id_autor
        WHERE r.status = 'ativa' AND r.data_expiracao < CURDATE()
    ";
    $stmtRes = $pdo->prepare($sqlRes);
    $stmtRes->execute();
    $reservasExpiradas = $stmtRes->fetchAll(PDO::FETCH_ASSOC);

    foreach ($reservasExpiradas as $res) {
        $idReserva = $res['id_reserva'];
        $idPessoa = $res['id_pessoa'];
        $email = $res['aluno_email'];
        $nome = $res['aluno_nome'];
        $titulo = $res['titulo'];
        $autor = $res['nome_autor'] ?? 'Autor não informado';

        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) continue;

        // Enviar e-mail
        try {
            $enviou = $emailService->enviarNotificacao($email, 'reserva_expirada', [
                'nome' => $nome,
                'livro' => $titulo,
                'autor' => $autor,
                'data' => date('d/m/Y', strtotime($res['data_expiracao']))
            ]);

            if ($enviou) {
                $insert = $pdo->prepare("INSERT INTO notificacao (id_pessoa, tipo_notificacao, assunto, status) VALUES (?, 'reserva_expirada', 'Sua reserva expirou', 'enviado')");
                $insert->execute([$idPessoa]);
                $totalEnviados++;
                if ($isCLI) echo "[" . date('Y-m-d H:i:s') . "] ✅ E-mail de reserva expirada para {$nome}\n";
            } else {
                $insert = $pdo->prepare("INSERT INTO notificacao (id_pessoa, tipo_notificacao, assunto, status, mensagem_erro) VALUES (?, 'reserva_expirada', 'Sua reserva expirou', 'erro', 'Falha no envio')");
                $insert->execute([$idPessoa]);
            }
        } catch (\Exception $e) {
            error_log("Erro e-mail reserva: " . $e->getMessage());
        }

        // Atualizar status da reserva para cancelada e liberar o exemplar
        $updRes = $pdo->prepare("UPDATE reserva SET status = 'cancelada' WHERE id_reserva = ?");
        $updRes->execute([$idReserva]);

        $updEx = $pdo->prepare("UPDATE exemplar SET disponibilidade = 'disponivel' WHERE id_exemplar = ?");
        $updEx->execute([$res['id_exemplar']]);
    }

    $pdo->commit();
    if ($isCLI) {
        echo "\n[" . date('Y-m-d H:i:s') . "] ✅ Processamento concluído! {$totalEnviados} notificações enviadas.\n";
    } else {
        enviarResposta("sucesso", "Processamento concluído!", ["enviados" => $totalEnviados], 200);
    }

} catch (PDOException $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    echo "❌ Erro no banco: " . $e->getMessage() . "\n";
} catch (\Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    echo "❌ Erro geral: " . $e->getMessage() . "\n";
}
?>
