<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    enviarResposta("erro", "Método inválido. Use POST.", null, 405);
}

$data = json_decode(file_get_contents("php://input"));

// Validação
if(!isset($data->nome_assunto)) {
    enviarResposta("erro", "Informe o nome do assunto.", null, 400);
}

try {
    $stmt = $pdo->prepare("INSERT INTO assunto (nome_assunto) VALUES (?)");
    if($stmt->execute([$data->nome_assunto])) {
        enviarResposta("sucesso", "Assunto cadastrado!", ["id" => $pdo->lastInsertId()], 201);
    } else {
        enviarResposta("erro", "Falha ao cadastrar.", null, 503);
    }
} catch (PDOException $e) {
    enviarResposta("erro", "Erro no banco: " . $e->getMessage(), null, 500);
}

?>