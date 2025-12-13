<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    enviarResposta("erro", "Método inválido. Use POST.", null, 405);
}

$data = json_decode(file_get_contents("php://input"));

// Validação
if(!isset($data->id_livro) || !isset($data->localizacao)) {
    enviarResposta("erro", "Informe id_livro e localização.", null, 400);
}

// Define disponibilidade como true (1) por padrão se não for enviado
$disponibilidade = isset($data->disponibilidade) ? $data->disponibilidade : 1;

try {
    $stmt = $pdo->prepare("INSERT INTO exemplar (id_livro, disponibilidade, localizacao) VALUES (?, ?, ?)");
    if($stmt->execute([$data->id_livro, $disponibilidade, $data->localizacao])) {
        enviarResposta("sucesso", "Exemplar cadastrado!", ["id" => $pdo->lastInsertId()], 201);
    } else {
        enviarResposta("erro", "Falha ao cadastrar.", null, 503);
    }
} catch (PDOException $e) {
    enviarResposta("erro", "Erro no banco: " . $e->getMessage(), null, 500);
}

?>