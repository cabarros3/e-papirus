<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    enviarResposta("erro", "Método inválido. Use POST.", null, 405);
}

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->nome_autor) || empty($data->nome_autor)) {
    enviarResposta("erro", "O nome do autor é obrigatório.", null, 400);
}

try {
    $sql = "INSERT INTO autor (nome_autor) VALUES (?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$data->nome_autor]);

    enviarResposta("sucesso", "Autor cadastrado com sucesso!", ["id" => $pdo->lastInsertId()], 201);

} catch (PDOException $e) {
    // Tratamento para duplicidade (caso o nome fosse UNIQUE, mas seu schema não pede unique no autor, mas é bom prevenir erros gerais)
    enviarResposta("erro", "Erro ao cadastrar autor: " . $e->getMessage(), null, 500);
}
?>