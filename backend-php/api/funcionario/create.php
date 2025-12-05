<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    enviarResposta("erro", "Método inválido. Use POST.", null, 405);
}

$data = json_decode(file_get_contents("php://input"));

// Validação
if(!isset($data->nome_funcionario) || !isset($data->cpf_funcionario) || !isset($data->email_funcionario)) {
    enviarResposta("erro", "Informe nome, CPF e email do funcionário.", null, 400);
}

try {
    $sql = "INSERT INTO funcionario (nome_funcionario, cpf_funcionario, email_funcionario) VALUES (?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    if($stmt->execute([$data->nome_funcionario, $data->cpf_funcionario, $data->email_funcionario])) {
        enviarResposta("sucesso", "Funcionário cadastrado!", ["id" => $pdo->lastInsertId()], 201);
    } else {
        enviarResposta("erro", "Falha ao cadastrar.", null, 503);
    }
} catch (PDOException $e) {
    enviarResposta("erro", "Erro no banco: " . $e->getMessage(), null, 500);
}

?>