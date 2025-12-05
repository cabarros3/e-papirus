<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    enviarResposta("erro", "Método inválido. Use POST.", null, 405);
}

$data = json_decode(file_get_contents("php://input"));

if(!isset($data->id_funcionario) || !isset($data->id_emprestimo)) {
    enviarResposta("erro", "Informe id_funcionario e id_emprestimo.", null, 400);
}

try {
    $stmt = $pdo->prepare("INSERT INTO registra (id_funcionario, id_emprestimo) VALUES (?, ?)");
    if($stmt->execute([$data->id_funcionario, $data->id_emprestimo])) {
        enviarResposta("sucesso", "Registro vinculado!", [], 201);
    } else {
        enviarResposta("erro", "Falha ao vincular.", null, 503);
    }
} catch (PDOException $e) {
    enviarResposta("erro", "Erro no banco: " . $e->getMessage(), null, 500);
}

?>