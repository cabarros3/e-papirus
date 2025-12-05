<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    enviarResposta("erro", "Método inválido. Use POST.", null, 405);
}

$data = json_decode(file_get_contents("php://input"));

// Validação
if(!isset($data->id_livro) || !isset($data->id_autor)) {
    enviarResposta("erro", "Informe id_livro e id_autor.", null, 400);
}

try {
    $stmt = $pdo->prepare("INSERT INTO escreve (id_livro, id_autor) VALUES (?, ?)");
    if($stmt->execute([$data->id_livro, $data->id_autor])) {
        enviarResposta("sucesso", "Autor vinculado ao livro!", [], 201);
    } else {
        enviarResposta("erro", "Falha ao vincular.", null, 503);
    }
} catch (PDOException $e) {
    // Código 23000 geralmente é chave duplicada ou chave estrangeira inválida
    enviarResposta("erro", "Erro no banco: " . $e->getMessage(), null, 500);
}

?>