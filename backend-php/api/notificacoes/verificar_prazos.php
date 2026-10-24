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

    // Buscar empréstimos ativos
    $sql = "
        SELECT e.id_emprestimo, e.id_pessoa, e.data_prevista, p.nome AS aluno_nome, p.email AS aluno_email, l.titulo AS livro_titulo
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

        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) continue;

        $diferenca = ceil((strtotime($dataPrevista) - strtotime($hoje)) / (60 * 60 * 24));
        $tipoNotificacao = '';
        $variaveisEmail = [];
        $assuntoLog = '';
        $tipoLog = '';

        if ($diferenca < 0) {
            // ATRASO
            $diasAtraso = abs($diferenca);
            $check = $pdo->prepare("SELECT COUNT(*) FROM notificacao WHERE id_emprestimo = ? AND tipo_notificacao = 'atraso' AND status = 'enviado'");
            $check->execute([$idEmprestimo]);
            if ($check->fetchColumn() > 0) continue;

            $tipoNotificacao = 'atraso';
            $tipoLog = 'atraso';
            $assuntoLog = 'Atraso na devolução';
            $variaveisEmail = [
                'nome'  => $nome,
                'livro' => $titulo,
                'data'  => date('d/m/Y', strtotime($dataPrevista)),
                'dias'  => $diasAtraso
            ];

        } elseif ($diferenca <= 3 && $diferenca >= 0) {
            // LEMBRETE (3 dias ou 1 dia)
            $tipoLembrete = ($diferenca == 1) ? 'lembrete_1dia' : 'lembrete';

            // Verifica se já enviou esse tipo específico
            $check = $pdo->prepare("SELECT COUNT(*) FROM notificacao WHERE id_emprestimo = ? AND tipo_notificacao = ? AND status = 'enviado'");
            $check->execute([$idEmprestimo, $tipoLembrete]);
            if ($check->fetchColumn() > 0) continue;

            $tipoNotificacao = 'lembrete'; // O template usa 'lembrete', mas o log usa o tipo específico
            $tipoLog = $tipoLembrete;
            $assuntoLog = 'Seu empréstimo está perto do vencimento';
            $variaveisEmail = [
                'nome'  => $nome,
                'livro' => $titulo,
                'data'  => date('d/m/Y', strtotime($dataPrevista)),
                'dias'  => $diferenca
            ];

        } else {
            echo "[" . date('Y-m-d H:i:s') . "] {$nome} - faltam {$diferenca} dias (ainda não precisa notificar)\n";
            continue;
        }

        // Enviar e-mail
        try {
            $enviou = $emailService->enviarNotificacao($email, $tipoNotificacao, $variaveisEmail);

            if ($enviou) {
                $insert = $pdo->prepare("INSERT INTO notificacao (id_pessoa, id_emprestimo, tipo_notificacao, assunto, status) VALUES (?, ?, ?, ?, 'enviado')");
                $insert->execute([$idPessoa, $idEmprestimo, $tipoLog, $assuntoLog]);
                $totalEnviados++;
                echo "[" . date('Y-m-d H:i:s') . "] ✅ Notificação enviada para {$nome} ({$email}) - {$tipoLog}\n";
            } else {
                $insert = $pdo->prepare("INSERT INTO notificacao (id_pessoa, id_emprestimo, tipo_notificacao, assunto, status, mensagem_erro) VALUES (?, ?, ?, ?, 'erro', 'Falha no envio')");
                $insert->execute([$idPessoa, $idEmprestimo, $tipoLog, $assuntoLog]);
                echo "[" . date('Y-m-d H:i:s') . "] ❌ Erro ao enviar para {$nome}\n";
            }
        } catch (\Exception $e) {
            $insert = $pdo->prepare("INSERT INTO notificacao (id_pessoa, id_emprestimo, tipo_notificacao, assunto, status, mensagem_erro) VALUES (?, ?, ?, ?, 'erro', ?)");
            $insert->execute([$idPessoa, $idEmprestimo, $tipoLog, $assuntoLog, $e->getMessage()]);
            echo "[" . date('Y-m-d H:i:s') . "] ❌ Erro ao enviar para {$nome}: " . $e->getMessage() . "\n";
        }
    }

    $pdo->commit();
    echo "\n[" . date('Y-m-d H:i:s') . "] Processamento concluído! {$totalEnviados} notificações enviadas.\n";

} catch (PDOException $e) {
    $pdo->rollBack();
    echo "[" . date('Y-m-d H:i:s') . "] ❌ Erro no banco: " . $e->getMessage() . "\n";
} catch (\Exception $e) {
    $pdo->rollBack();
    echo "[" . date('Y-m-d H:i:s') . "] ❌ Erro geral: " . $e->getMessage() . "\n";
}
?>
