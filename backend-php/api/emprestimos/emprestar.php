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

// Validações básicas
if (!isset($data->id_exemplar) || !isset($data->id_pessoa) || !isset($data->data_prevista)) {
    enviarResposta("erro", "Dados incompletos. Informe id_exemplar, id_pessoa e data_prevista.", null, 400);
}

try {
    $pdo->beginTransaction();

    // 1. Verificar se o exemplar existe e está disponível
    $stmtEx = $pdo->prepare("SELECT id_livro, disponibilidade FROM exemplar WHERE id_exemplar = ? FOR UPDATE");
    $stmtEx->execute([$data->id_exemplar]);
    $exemplar = $stmtEx->fetch(PDO::FETCH_ASSOC);

    if (!$exemplar) {
        $pdo->rollBack();
        enviarResposta("erro", "Exemplar não encontrado.", null, 404);
        exit;
    }

    if ($exemplar['disponibilidade'] !== 'disponivel') {
        $pdo->rollBack();
        enviarResposta("erro", "Este exemplar não está disponível para empréstimo.", null, 409);
        exit;
    }

    // 2. Buscar dados do aluno e do livro para o e-mail
    $sqlDados = "
        SELECT
            p.nome AS aluno_nome,
            p.email AS aluno_email,
            l.titulo AS livro_titulo
        FROM pessoa p
        JOIN exemplar ex ON ex.id_livro = ?
        JOIN livro l ON ex.id_livro = l.id_livro
        WHERE p.id_pessoa = ?
        LIMIT 1
    ";
    $stmtDados = $pdo->prepare($sqlDados);
    $stmtDados->execute([$exemplar['id_livro'], $data->id_pessoa]);
    $dadosEmprestimo = $stmtDados->fetch(PDO::FETCH_ASSOC);

    // 3. Inserir o empréstimo
    $dataHoje = date('Y-m-d');
    $sqlInsert = "INSERT INTO emprestimo (id_exemplar, id_pessoa, data_emprestimo, data_prevista) VALUES (?, ?, ?, ?)";
    $stmtInsert = $pdo->prepare($sqlInsert);
    $stmtInsert->execute([$data->id_exemplar, $data->id_pessoa, $dataHoje, $data->data_prevista]);

    $idEmprestimo = $pdo->lastInsertId();

    // 4. Atualizar a disponibilidade do exemplar para 'emprestado'
    $stmtUpEx = $pdo->prepare("UPDATE exemplar SET disponibilidade = 'emprestado' WHERE id_exemplar = ?");
    $stmtUpEx->execute([$data->id_exemplar]);

    $pdo->commit();

    // ============================================
    // 5. ENVIAR NOTIFICAÇÃO (USANDO O NOVO TEMPLATE)
    // ============================================
    $emailValido = !empty($dadosEmprestimo['aluno_email']) && filter_var($dadosEmprestimo['aluno_email'], FILTER_VALIDATE_EMAIL);

    if ($emailValido) {
        try {
            $emailService = new \App\Services\EmailService();

            $enviou = $emailService->enviarNotificacao(
                $dadosEmprestimo['aluno_email'],
                'emprestimo',
                [
                    'nome'  => $dadosEmprestimo['aluno_nome'],
                    'livro' => $dadosEmprestimo['livro_titulo'],
                    'data'  => date('d/m/Y', strtotime($data->data_prevista)),
                ]
            );

            // Registra no banco (sucesso ou erro)
            if ($enviou) {
                $insertNotif = $pdo->prepare("INSERT INTO notificacao (id_pessoa, id_emprestimo, tipo_notificacao, assunto, status) VALUES (?, ?, 'emprestimo', 'Empréstimo Confirmado', 'enviado')");
                $insertNotif->execute([$data->id_pessoa, $idEmprestimo]);
            } else {
                $insertNotif = $pdo->prepare("INSERT INTO notificacao (id_pessoa, id_emprestimo, tipo_notificacao, assunto, status, mensagem_erro) VALUES (?, ?, 'emprestimo', 'Empréstimo Confirmado', 'erro', 'Falha no envio do e-mail')");
                $insertNotif->execute([$data->id_pessoa, $idEmprestimo]);
            }
        } catch (\Throwable $e) {
            // Falha no e-mail NÃO impede o empréstimo
            error_log("Falha ao enviar e-mail de empréstimo: " . $e->getMessage());
            $insertNotif = $pdo->prepare("INSERT INTO notificacao (id_pessoa, id_emprestimo, tipo_notificacao, assunto, status, mensagem_erro) VALUES (?, ?, 'emprestimo', 'Empréstimo Confirmado', 'erro', ?)");
            $insertNotif->execute([$data->id_pessoa, $idEmprestimo, $e->getMessage()]);
        }
    }

    // ============================================
    // 6. RESPOSTA DE SUCESSO
    // ============================================
    enviarResposta("sucesso", "Empréstimo realizado com sucesso!", ["id_emprestimo" => $idEmprestimo], 201);

} catch (PDOException $e) {
    $pdo->rollBack();
    enviarResposta("erro", "Erro ao realizar empréstimo: " . $e->getMessage(), null, 500);
}
?>
