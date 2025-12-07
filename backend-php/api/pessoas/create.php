<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    enviarResposta("erro", "Método inválido. Use POST.", null, 405);
}

$data = json_decode(file_get_contents("php://input"));

// Validação
if(!isset($data->nome) || !isset($data->cpf) || !isset($data->tipo)) {
    enviarResposta("erro", "Dados incompletos (nome, cpf, tipo).", null, 400);
}

// Validar se o tipo é válido (enum)
$tiposValidos = ['usuario', 'professor'];
if (!in_array($data->tipo, $tiposValidos)) {
    enviarResposta("erro", "Tipo inválido. Use 'usuario' ou 'professor'.", null, 400);
}

try {
    $sql = "INSERT INTO pessoa (nome, cpf, email, telefone, tipo) VALUES (?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    
    // Tratando campos opcionais
    $email = $data->email ?? null;
    $telefone = $data->telefone ?? null;

    if($stmt->execute([$data->nome, $data->cpf, $email, $telefone, $data->tipo])) {
        enviarResposta("sucesso", "Pessoa cadastrada!", ["id" => $pdo->lastInsertId()], 201);
    } else {
        enviarResposta("erro", "Falha ao cadastrar.", null, 503);
    }
} catch (PDOException $e) {
    enviarResposta("erro", "Erro no banco: " . $e->getMessage(), null, 500);
}

?>