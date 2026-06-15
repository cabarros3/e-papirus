<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    enviarResposta("erro", "Método inválido. Use PUT.", null, 405);
}

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->id_emprestimo)) {
    enviarResposta("erro", "ID do empréstimo obrigatório.", null, 400);
}

try {
    $pdo->beginTransaction();

    // 1. Buscar dados do empréstimo (para saber qual é o exemplar)
    $stmtGet = $pdo->prepare("SELECT id_exemplar, data_prevista, data_devolucao FROM emprestimo WHERE id_emprestimo = ?");
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

    // Buscar dados para mensagem de confirmação (nome do aluno, título do livro, entre outros)
    $sqlDados = "
        SELECT
            p.nome AS aluno_nome,
            p.email AS aluno_email,
            l.titulo AS livro_titulo,
            emp.data_emprestimo,
            emp.data_prevista
        FROM emprestimo emp
        JOIN pessoa p ON emp.id_pessoa = p.id_pessoa
        JOIN exemplar ex ON emp.id_exemplar = ex.id_exemplar
        JOIN livro l ON ex.id_livro = l.id_livro
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

    
    // Notificação por E-mail (Confirmação de devolução)
    $emailValido = !empty($dadosEmprestimo['aluno_email']) && filter_var($dadosEmprestimo['aluno_email'], FILTER_VALIDATE_EMAIL);
    if ($emailValido) {
        ob_start();
        try {
            require_once '../../config.php';
            require_once '../../vendor/autoload.php';

            if (class_exists('App\\Services\\EmailService')) {
                $emailService = new \App\Services\EmailService();
                $assunto = "Confirmação de Devolução — e-Papirus";
                $corpo = "<h2>Olá, {$dadosEmprestimo['aluno_nome']}!</h2>";
                $corpo .= "<p>Registramos a devolução do livro (exemplar) <strong>{$dadosEmprestimo['livro_titulo']}</strong> em " . date('d/m/Y', strtotime($dataHoje)) . ".</p>";
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

    // Verificação simples de atraso para mensagem
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
