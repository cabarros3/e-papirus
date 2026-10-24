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

$novaDataEnviada = isset($data->nova_data_prevista) ? $data->nova_data_prevista : null;

try {
    $pdo->beginTransaction();

    // 1. Buscar dados do empréstimo com informações do aluno e livro
    $stmt = $pdo->prepare("
        SELECT
            e.id_emprestimo, e.id_pessoa, e.data_prevista, e.data_devolucao,
            p.nome AS aluno_nome, p.email AS aluno_email, l.titulo AS livro_titulo
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

    // 2. Validações
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

    // 3. Calcular nova data
    if ($novaDataEnviada) {
        $novaDataObj = new DateTime($novaDataEnviada);
        $hoje = new DateTime($dataHoje);
        $maxData = (new DateTime($dataHoje))->modify('+30 days');

        if ($novaDataObj <= $hoje || $novaDataObj > $maxData) {
            $pdo->rollBack();
            enviarResposta("erro", "A nova data deve ser entre amanhã e 30 dias.", null, 400);
            exit;
        }
        $novaData = $novaDataEnviada;
    } else {
        $novaData = date('Y-m-d', strtotime($dataPrevistaAtual . ' + 7 days'));
    }

    // 4. Inserir histórico e atualizar empréstimo
    $stmtLog = $pdo->prepare("INSERT INTO renovacao (id_emprestimo, data_renovacao, nova_data_devolucao) VALUES (?, ?, ?)");
    $stmtLog->execute([$data->id_emprestimo, $dataHoje, $novaData]);

    $stmtUp = $pdo->prepare("UPDATE emprestimo SET data_prevista = ? WHERE id_emprestimo = ?");
    $stmtUp->execute([$novaData, $data->id_emprestimo]);

    $pdo->commit();

    // 5. Enviar e-mail
    $emailValido = !empty($emp['aluno_email']) && filter_var($emp['aluno_email'], FILTER_VALIDATE_EMAIL);
    if ($emailValido) {
        try {
            $emailService = new \App\Services\EmailService();

            $enviou = $emailService->enviarNotificacao(
                $emp['aluno_email'],
                'renovacao',
                [
                    'nome'          => $emp['aluno_nome'],
                    'livro'         => $emp['livro_titulo'],
                    'data_anterior' => date('d/m/Y', strtotime($dataPrevistaAtual)),
                    'data_nova'     => date('d/m/Y', strtotime($novaData))
                ]
            );

            if ($enviou) {
                $insert = $pdo->prepare("INSERT INTO notificacao (id_pessoa, id_emprestimo, tipo_notificacao, assunto, status) VALUES (?, ?, 'renovacao', 'Renovação Confirmada', 'enviado')");
                $insert->execute([$emp['id_pessoa'], $data->id_emprestimo]);
            } else {
                $insert = $pdo->prepare("INSERT INTO notificacao (id_pessoa, id_emprestimo, tipo_notificacao, assunto, status, mensagem_erro) VALUES (?, ?, 'renovacao', 'Renovação Confirmada', 'erro', 'Falha no envio')");
                $insert->execute([$emp['id_pessoa'], $data->id_emprestimo]);
            }
        } catch (\Exception $e) {
            error_log("Falha ao enviar e-mail de renovação: " . $e->getMessage());
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
