<?php
/**
 * Script para verificação automática de prazos de empréstimo
 * Deve ser executado diariamente via CRON
 */

// Ajuste dos caminhos - voltando 2 pastas (api/notificacoes -> backend-php)
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/utils.php';
require_once __DIR__ . '/../../db/db.php';
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../vendor/autoload.php';

$isCLI = php_sapi_name() === 'cli';

try {
    // Usar a variável $pdo que vem do db.php
    global $pdo;

    $pdo->beginTransaction();

    $hoje = date('Y-m-d');

    // Buscar empréstimos ativos (não devolvidos)
    $sql = "
        SELECT
            e.id_emprestimo,
            e.id_pessoa,
            e.data_prevista,
            p.nome AS aluno_nome,
            p.email AS aluno_email,
            l.titulo AS livro_titulo
        FROM emprestimo e
        JOIN pessoa p ON e.id_pessoa = p.id_pessoa
        JOIN exemplar ex ON e.id_exemplar = ex.id_exemplar
        JOIN livro l ON ex.id_livro = l.id_livro
        WHERE e.data_devolucao IS NULL
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $emprestimos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($emprestimos)) {
        echo "[" . date('Y-m-d H:i:s') . "] Nenhum empréstimo ativo encontrado.\n";
        exit;
    }

    $emailService = new \App\Services\EmailService();
    $totalEnviados = 0;

    foreach ($emprestimos as $emprestimo) {
        $idEmprestimo = $emprestimo['id_emprestimo'];
        $idPessoa = $emprestimo['id_pessoa'];
        $dataPrevista = $emprestimo['data_prevista'];
        $email = $emprestimo['aluno_email'];
        $nome = $emprestimo['aluno_nome'];
        $titulo = $emprestimo['livro_titulo'];

        // Validar e-mail
        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            continue;
        }

        // Calcular diferença de dias
        $diferenca = (strtotime($dataPrevista) - strtotime($hoje)) / (60 * 60 * 24);
        $diferenca = ceil($diferenca);

        $tipoNotificacao = '';
        $assunto = '';
        $corpo = '';

        if ($diferenca < 0) {
            // Em atraso
            $diasAtraso = abs($diferenca);

            // Verificar se já foi enviado aviso de atraso
            $check = $pdo->prepare("SELECT COUNT(*) FROM notificacao WHERE id_emprestimo = ? AND tipo_notificacao = 'atraso' AND status = 'enviado'");
            $check->execute([$idEmprestimo]);
            if ($check->fetchColumn() > 0) {
                echo "[" . date('Y-m-d H:i:s') . "]  Atraso já notificado para {$nome} (empréstimo #{$idEmprestimo})\n";
                continue;
            }

            $tipoNotificacao = 'atraso';
            $assunto = "Atraso na Devolução: e-Papirus";
            $corpo = "<h2>Olá, {$nome}!</h2>";
            $corpo .= "<p>Você está com <strong>{$diasAtraso}</strong> dia(s) de atraso na devolução do livro <strong>{$titulo}</strong>.</p>";
            $corpo .= "<p>Data prevista: " . date('d/m/Y', strtotime($dataPrevista)) . "</p>";
            $corpo .= "<p>Por favor, devolva o livro o mais rápido possível!</p>";
            $corpo .= "<p>Atenciosamente,<br/>Equipe e-Papirus</p>";

        } elseif ($diferenca <= 3 && $diferenca >= 0) {
            // Vence em 3 dias ou menos
            $check = $pdo->prepare("SELECT COUNT(*) FROM notificacao WHERE id_emprestimo = ? AND tipo_notificacao = 'lembrete' AND status = 'enviado'");
            $check->execute([$idEmprestimo]);
            if ($check->fetchColumn() > 0) {
                echo "[" . date('Y-m-d H:i:s') . "]   Lembrete já enviado para {$nome} (empréstimo #{$idEmprestimo})\n";
                continue;
            }

            $tipoNotificacao = 'lembrete';
            $assunto = "Lembrete: Seu Empréstimo Está Perto do Vencimento";
            $corpo = "<h2>Olá, {$nome}!</h2>";
            $corpo .= "<p>Seu empréstimo do livro <strong>{$titulo}</strong> vence em <strong>{$diferenca}</strong> dia(s).</p>";
            $corpo .= "<p>Data prevista: " . date('d/m/Y', strtotime($dataPrevista)) . "</p>";
            $corpo .= "<p>Por favor, devolva o livro na biblioteca dentro do prazo.</p>";
            $corpo .= "<p>Atenciosamente,<br/>Equipe e-Papirus</p>";

        } else {
            // Não precisa enviar ainda
            echo "[" . date('Y-m-d H:i:s') . "]   {$nome} - faltam {$diferenca} dias (ainda não precisa notificar)\n";
            continue;
        }

        // Enviar e-mail
        try {
            $enviou = $emailService->enviar($email, $assunto, $corpo);

            if ($enviou) {
                // Registrar notificação
                $insert = $pdo->prepare("INSERT INTO notificacao (id_pessoa, id_emprestimo, tipo_notificacao, assunto, status) VALUES (?, ?, ?, ?, 'enviado')");
                $insert->execute([$idPessoa, $idEmprestimo, $tipoNotificacao, $assunto]);
                $totalEnviados++;
                echo "[" . date('Y-m-d H:i:s') . "] Notificação enviada para {$nome} ({$email}) - {$tipoNotificacao}\n";
            } else {
                // Registrar erro
                $insert = $pdo->prepare("INSERT INTO notificacao (id_pessoa, id_emprestimo, tipo_notificacao, assunto, status, mensagem_erro) VALUES (?, ?, ?, ?, 'erro', 'Falha no envio')");
                $insert->execute([$idPessoa, $idEmprestimo, $tipoNotificacao, $assunto]);
                echo "[" . date('Y-m-d H:i:s') . "] Erro ao enviar para {$nome}\n";
            }

        } catch (\Exception $e) {
            // Registrar erro com mensagem
            $insert = $pdo->prepare("INSERT INTO notificacao (id_pessoa, id_emprestimo, tipo_notificacao, assunto, status, mensagem_erro) VALUES (?, ?, ?, ?, 'erro', ?)");
            $insert->execute([$idPessoa, $idEmprestimo, $tipoNotificacao, $assunto, $e->getMessage()]);
            echo "[" . date('Y-m-d H:i:s') . "] Erro ao enviar para {$nome}: " . $e->getMessage() . "\n";
        }
    }

    $pdo->commit();
    echo "\n[" . date('Y-m-d H:i:s') . "] " . str_repeat('=', 50) . "\n";
    echo "[" . date('Y-m-d H:i:s') . "] Processamento concluído! {$totalEnviados} notificações enviadas.\n";
    echo "[" . date('Y-m-d H:i:s') . "] " . str_repeat('=', 50) . "\n";

} catch (PDOException $e) {
    $pdo->rollBack();
    echo "[" . date('Y-m-d H:i:s') . "] Erro no banco de dados: " . $e->getMessage() . "\n";
} catch (\Exception $e) {
    $pdo->rollBack();
    echo "[" . date('Y-m-d H:i:s') . "] Erro geral: " . $e->getMessage() . "\n";
}
?>
