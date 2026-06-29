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

if (!isset($data->id_emprestimo)) {
    enviarResposta("erro", "Informe o ID do empréstimo.", null, 400);
}

// Nova data pode ser enviada ou calculada automaticamente
$novaDataEnviada = isset($data->nova_data_prevista) ? $data->nova_data_prevista : null;

try {
    $pdo->beginTransaction();

    // 1. Buscar dados do empréstimo com informações do aluno e livro
    $stmt = $pdo->prepare("
        SELECT
            e.id_emprestimo,
            e.id_pessoa,
            e.data_prevista,
            e.data_devolucao,
            p.nome AS aluno_nome,
            p.email AS aluno_email,
            l.titulo AS livro_titulo
        FROM emprestimo e
        JOIN pessoa p ON e.id_pessoa = p.id_pessoa
        JOIN exemplar ex ON e.id_exemplar = ex.id_exemplar
        JOIN livro l ON ex.id_livro = l.id_livro
        WHERE e.id_emprestimo = ?
        FOR UPDATE
    ");
    $stmt->execute([$data->id_emprestimo]);
    $emp = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$emp) {
        $pdo->rollBack();
        enviarResposta("erro", "Empréstimo não encontrado.", null, 404);
        exit;
    }

    // 2. Validações de Regra de Negócio
    if ($emp['data_devolucao'] !== null) {
        $pdo->rollBack();
        enviarResposta("erro", "Não é possível renovar: este livro já foi devolvido.", null, 409);
        exit;
    }

    $dataHoje = date('Y-m-d');
    $dataPrevistaAtual = $emp['data_prevista'];

    if ($dataHoje > $dataPrevistaAtual) {
        $pdo->rollBack();
        enviarResposta("erro", "Renovação negada: O livro está atrasado. Por favor, devolva no balcão.", null, 409);
        exit;
    }

    // 3. Calcular/Validar a nova data
    if ($novaDataEnviada) {
        $novaDataObj = new DateTime($novaDataEnviada);
        $hoje = new DateTime($dataHoje);
        $maxData = (new DateTime($dataHoje))->modify('+30 days');

        if ($novaDataObj <= $hoje) {
            $pdo->rollBack();
            enviarResposta("erro", "A nova data deve ser posterior a hoje.", null, 400);
            exit;
        }

        if ($novaDataObj > $maxData) {
            $pdo->rollBack();
            enviarResposta("erro", "A nova data não pode ser superior a 30 dias.", null, 400);
            exit;
        }

        $novaData = $novaDataEnviada;
    } else {
        $novaData = date('Y-m-d', strtotime($dataPrevistaAtual . ' + 7 days'));
    }

    // 4. Inserir registro na tabela RENOVAÇÃO
    $sqlLog = "INSERT INTO renovacao (id_emprestimo, data_renovacao, nova_data_devolucao) VALUES (?, ?, ?)";
    $stmtLog = $pdo->prepare($sqlLog);
    $stmtLog->execute([$data->id_emprestimo, $dataHoje, $novaData]);

    // 5. Atualizar a tabela EMPRESTIMO com a nova data
    $sqlUp = "UPDATE emprestimo SET data_prevista = ? WHERE id_emprestimo = ?";
    $stmtUp = $pdo->prepare($sqlUp);
    $stmtUp->execute([$novaData, $data->id_emprestimo]);

    $pdo->commit();

    // 6. Enviar notificação por e-mail
    $emailValido = !empty($emp['aluno_email']) && filter_var($emp['aluno_email'], FILTER_VALIDATE_EMAIL);
    if ($emailValido) {
        try {
            $emailService = new \App\Services\EmailService();
            $assunto = "Confirmacao de Renovacao - e-Papirus";

            $corpo = "
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #2c3e50; color: white; padding: 15px; text-align: center; }
                    .content { padding: 20px; background: #f9f9f9; }
                    .footer { text-align: center; padding: 10px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header'>
                        <h2>e-Papirus</h2>
                    </div>
                    <div class='content'>
                        <h3>Olá, " . $emp['aluno_nome'] . "!</h3>
                        <p>Seu empréstimo do livro <strong>" . $emp['livro_titulo'] . "</strong> foi renovado com sucesso.</p>
                        <p><strong>Data anterior:</strong> " . date('d/m/Y', strtotime($dataPrevistaAtual)) . "</p>
                        <p><strong>Nova data de devolução:</strong> " . date('d/m/Y', strtotime($novaData)) . "</p>
                        <p>Lembre-se de devolver o livro na nova data para evitar multas.</p>
                        <p>Atenciosamente,<br/>Equipe e-Papirus</p>
                    </div>
                    <div class='footer'>
                        <p>Este e-mail foi enviado automaticamente pelo sistema e-Papirus.</p>
                    </div>
                </div>
            </body>
            </html>
            ";

            $enviou = $emailService->enviar($emp['aluno_email'], $assunto, $corpo);

            if ($enviou) {
                $insert = $pdo->prepare("INSERT INTO notificacao (id_pessoa, id_emprestimo, tipo_notificacao, assunto, status) VALUES (?, ?, 'renovacao', ?, 'enviado')");
                $insert->execute([$emp['id_pessoa'], $data->id_emprestimo, $assunto]);
            } else {
                $insert = $pdo->prepare("INSERT INTO notificacao (id_pessoa, id_emprestimo, tipo_notificacao, assunto, status, mensagem_erro) VALUES (?, ?, 'renovacao', ?, 'erro', 'Falha no envio do e-mail')");
                $insert->execute([$emp['id_pessoa'], $data->id_emprestimo, $assunto]);
            }

        } catch (\Exception $e) {
            $insert = $pdo->prepare("INSERT INTO notificacao (id_pessoa, id_emprestimo, tipo_notificacao, assunto, status, mensagem_erro) VALUES (?, ?, 'renovacao', ?, 'erro', ?)");
            $insert->execute([$emp['id_pessoa'], $data->id_emprestimo, $assunto, $e->getMessage()]);
        }
    }

    enviarResposta("sucesso", "Renovação realizada com sucesso!", [
        "data_anterior" => $dataPrevistaAtual,
        "nova_data_entrega" => $novaData
    ], 201);

} catch (PDOException $e) {
    $pdo->rollBack();
    enviarResposta("erro", "Erro ao renovar: " . $e->getMessage(), null, 500);
}
?>
