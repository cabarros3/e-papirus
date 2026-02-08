<?php
// Desativa a exibição de erros diretamente na tela para não quebrar o JSON
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';
require_once '../../config.php'; 
require_once '../../vendor/autoload.php'; 

use App\Services\EmailService;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    enviarResposta("erro", "Método inválido. Use POST.", null, 405);
}

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->id_exemplar) || !isset($data->id_pessoa)) {
    enviarResposta("erro", "Informe o exemplar e a pessoa (leitor).", null, 400);
}

try {
    $pdo->beginTransaction();

    // 1. Verificar disponibilidade
    $stmtCheck = $pdo->prepare("SELECT disponibilidade FROM exemplar WHERE id_exemplar = ? FOR UPDATE");
    $stmtCheck->execute([$data->id_exemplar]);
    $exemplar = $stmtCheck->fetch(PDO::FETCH_ASSOC);

    if (!$exemplar) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        enviarResposta("erro", "Exemplar não encontrado.", null, 404);
    }

    if ($exemplar['disponibilidade'] !== 'disponivel') {
        if ($pdo->inTransaction()) $pdo->rollBack();
        enviarResposta("erro", "Este exemplar não está disponível (Status: " . $exemplar['disponibilidade'] . ").", null, 409);
    }

    // 2. Datas
    $dataHoje = date('Y-m-d');
    $dataPrevista = (isset($data->data_prevista) && !empty($data->data_prevista)) 
        ? $data->data_prevista 
        : date('Y-m-d', strtotime("+7 days"));

    // 3. Inserir Empréstimo
    $sqlInsert = "INSERT INTO emprestimo (id_exemplar, id_pessoa, data_emprestimo, data_prevista) VALUES (?, ?, ?, ?)";
    $stmtInsert = $pdo->prepare($sqlInsert);
    $stmtInsert->execute([$data->id_exemplar, $data->id_pessoa, $dataHoje, $dataPrevista]);
    
    $idEmprestimo = $pdo->lastInsertId();

    // 4. Atualizar Exemplar
    $sqlUpdate = "UPDATE exemplar SET disponibilidade = 'emprestado' WHERE id_exemplar = ?";
    $stmtUpdate = $pdo->prepare($sqlUpdate);
    $stmtUpdate->execute([$data->id_exemplar]);

    $pdo->commit();

    // --- NOTIFICAÇÃO POR EMAIL ---
    $sqlDados = "
        SELECT p.nome AS aluno_nome, p.email AS aluno_email, l.titulo AS livro_titulo
        FROM pessoa p
        INNER JOIN emprestimo e ON p.id_pessoa = e.id_pessoa
        INNER JOIN exemplar ex ON e.id_exemplar = ex.id_exemplar
        INNER JOIN livro l ON ex.id_livro = l.id_livro
        WHERE e.id_emprestimo = ?
    ";
    $stmtDados = $pdo->prepare($sqlDados);
    $stmtDados->execute([$idEmprestimo]);
    $dadosEmprestimo = $stmtDados->fetch(PDO::FETCH_ASSOC);

    $emailValido = !empty($dadosEmprestimo['aluno_email']) && filter_var($dadosEmprestimo['aluno_email'], FILTER_VALIDATE_EMAIL);
    
    if ($emailValido) {
        // ob_start garante que qualquer saída (debug do PHPMailer ou erros) não vá para o cliente
        ob_start();
        try {
            // Usamos a verificação de classe para evitar o Fatal Error caso o autoload falhe
            if (class_exists('App\Services\EmailService')) {
                $emailService = new EmailService();
                $assunto = "Confirmação de Empréstimo — e-Papirus";
                $corpo = "<h2>Olá, {$dadosEmprestimo['aluno_nome']}!</h2>
                          <p>Seu empréstimo do livro <strong>{$dadosEmprestimo['livro_titulo']}</strong> foi realizado com sucesso!</p>
                          <p>Data de devolução: " . date('d/m/Y', strtotime($dataPrevista)) . "</p>";
                
                $emailService->enviar($dadosEmprestimo['aluno_email'], $assunto, $corpo);
            }
        } catch (\Throwable $t) {
            // Captura qualquer erro de e-mail (incluindo classe não encontrada) e apenas loga
            error_log("Falha ao processar e-mail: " . $t->getMessage());
        }
        ob_end_clean(); // Limpa o buffer
    }

    // Resposta final limpa
    enviarResposta("sucesso", "Empréstimo realizado!", [
        "id_emprestimo" => $idEmprestimo, 
        "data_prevista" => $dataPrevista
    ], 201);

} catch (PDOException $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    enviarResposta("erro", "Erro de banco de dados: " . $e->getMessage(), null, 500);
} catch (\Exception $e) {
    enviarResposta("erro", "Erro inesperado: " . $e->getMessage(), null, 500);
}