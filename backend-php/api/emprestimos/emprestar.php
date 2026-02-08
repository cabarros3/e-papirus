<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';
require_once '../../config.php'; // Carrega constantes de email
require_once '../../vendor/autoload.php'; // Carrega autoload do Composer

use App\Services\EmailService; // Importa o serviço de email

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    enviarResposta("erro", "Método inválido. Use POST.", null, 405);
}

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->id_exemplar) || !isset($data->id_pessoa)) {
    enviarResposta("erro", "Informe o exemplar e a pessoa (leitor).", null, 400);
}

try {
    $pdo->beginTransaction();

    // 1. Verificar se o exemplar está DISPONÍVEL
    // Usamos 'FOR UPDATE' para travar essa linha durante a transação (evita condição de corrida)
    $stmtCheck = $pdo->prepare("SELECT disponibilidade FROM exemplar WHERE id_exemplar = ? FOR UPDATE");
    $stmtCheck->execute([$data->id_exemplar]);
    $exemplar = $stmtCheck->fetch(PDO::FETCH_ASSOC);

    if (!$exemplar) {
        $pdo->rollBack();
        enviarResposta("erro", "Exemplar não encontrado.", null, 404);
        exit;
    }

    if ($exemplar['disponibilidade'] !== 'disponivel') {
        $pdo->rollBack();
        enviarResposta("erro", "Este exemplar não está disponível (Status: " . $exemplar['disponibilidade'] . ").", null, 409);
        exit;
    }

    // 2. Calcular datas
    $dataHoje = date('Y-m-d');
    // Se o front enviar data_prevista, usa ela. Senão, aplica regra dos 7 dias
    if (isset($data->data_prevista) && !empty($data->data_prevista)) {
        $dataPrevista = $data->data_prevista;
    } else {
        $diasEmprestimo = 7;
        $dataPrevista = date('Y-m-d', strtotime("+$diasEmprestimo days"));
    }

    // 3. Inserir na tabela EMPRESTIMO
    $sqlInsert = "INSERT INTO emprestimo (id_exemplar, id_pessoa, data_emprestimo, data_prevista) VALUES (?, ?, ?, ?)";
    $stmtInsert = $pdo->prepare($sqlInsert);
    $stmtInsert->execute([$data->id_exemplar, $data->id_pessoa, $dataHoje, $dataPrevista]);
    
    $idEmprestimo = $pdo->lastInsertId();

    // 4. Atualizar status do EXEMPLAR para 'emprestado'
    $sqlUpdate = "UPDATE exemplar SET disponibilidade = 'emprestado' WHERE id_exemplar = ?";
    $stmtUpdate = $pdo->prepare($sqlUpdate);
    $stmtUpdate->execute([$data->id_exemplar]);

    $pdo->commit();

    // Buscar dados do emprestimo para notificação
    $sqlDados = "
        SELECT
            p.nome AS aluno_nome,
            p.email AS aluno_email,
            l.titulo AS livro_titulo
        FROM pessoa p
        INNER JOIN emprestimo e ON p.id_pessoa = e.id_pessoa
        INNER JOIN exemplar ex ON e.id_exemplar = ex.id_exemplar
        INNER JOIN livro l ON ex.id_livro = l.id_livro
        WHERE e.id_emprestimo = ?
    ";
    $stmtDados = $pdo->prepare($sqlDados);
    $stmtDados->execute([$idEmprestimo]);
    $dadosEmprestimo = $stmtDados->fetch(PDO::FETCH_ASSOC);

    //NOTIFICAÇÃO: Enviar email de confirmação de empréstimo

    // Validar dados necessários e email válido
    $emailValido = !empty($dadosEmprestimo['aluno_email']) && 
               filter_var($dadosEmprestimo['aluno_email'], FILTER_VALIDATE_EMAIL);
    $dadosCompletos = !empty($dadosEmprestimo['aluno_nome']) && 
                  !empty($dadosEmprestimo['livro_titulo']);

    if ($emailValido && $dadosCompletos) {

        try {
            // Instancia o serviço de email
            $emailService = new EmailService();
            
            // Monta o assunto
            $assunto = "Confirmação de Empréstimo — e-Papirus";
            
            // Monta o corpo do email em HTML
            $corpo = "
                <h2>Olá, {$dadosEmprestimo['aluno_nome']}!</h2>
                <p>Seu empréstimo foi realizado com sucesso!</p>
                
                <hr>
                
                <h3>Detalhes do Empréstimo:</h3>
                <ul>
                    <li><strong>Livro:</strong> {$dadosEmprestimo['livro_titulo']}</li>
                    <li><strong>Data do Empréstimo:</strong> " . date('d/m/Y') . "</li>
                    <li><strong>Data Prevista de Devolução:</strong> " . date('d/m/Y', strtotime($dataPrevista)) . "</li>
                    <li><strong>ID do Empréstimo:</strong> {$idEmprestimo}</li>
                </ul>
                
                <hr>
                
                <p>⚠️<strong>Lembre-se:</strong> Devolva o livro até a data prevista para evitar possíveis multas.</p>
                
                <p>Dúvidas? Em caso de dúvidas, entre em contato com a biblioteca!</p>
                
                <br>
                <p>Atenciosamente,<br><strong>E-Papirus Biblioteca</strong></p>
            ";
            
            // Tenta enviar o email
            $emailEnviado = $emailService->enviar(
                $dadosEmprestimo['aluno_email'],
                $assunto,
                $corpo
            );
            
            // Se falhou, apenas registra no log (não afeta o empréstimo)
            if (!$emailEnviado) {
                error_log("[Empréstimo #{$idEmprestimo}] Aviso: Email não enviado para {$dadosEmprestimo['aluno_email']}");
            }
            
        } catch (Exception $e) {
            // Se houver erro ao montar/enviar, registra mas continua
            error_log("Erro ao enviar email de confirmação: " . $e->getMessage());
        }
    }


    enviarResposta("sucesso", "Empréstimo realizado!", [
        "id_emprestimo" => $idEmprestimo, 
        "data_prevista" => $dataPrevista
    ], 201);

} catch (PDOException $e) {
    $pdo->rollBack();
    enviarResposta("erro", "Erro ao realizar empréstimo: " . $e->getMessage(), null, 500);
}
?>