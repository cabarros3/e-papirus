<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

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
    
    // Se a data prevista vier do frontend, usa ela; senão, calcula 7 dias
    if (isset($data->data_prevista) && !empty($data->data_prevista)) {
        $dataPrevista = $data->data_prevista;
    } else {
        $diasEmprestimo = 7; // Regra fixa: 7 dias (fallback)
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
    enviarResposta("sucesso", "Empréstimo realizado!", [
        "id_emprestimo" => $idEmprestimo, 
        "data_prevista" => $dataPrevista
    ], 201);

} catch (PDOException $e) {
    $pdo->rollBack();
    enviarResposta("erro", "Erro ao realizar empréstimo: " . $e->getMessage(), null, 500);
}
?>