<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    enviarResposta("erro", "Método inválido. Use POST.", null, 405);
}

$data = json_decode(file_get_contents("php://input"));

if(!isset($data->id_emprestimo) || !isset($data->nova_data_devolucao)) {
    enviarResposta("erro", "Informe id_emprestimo e nova data.", null, 400);
}

$data_renovacao = $data->data_renovacao ?? date('Y-m-d');

try {
    $sql = "INSERT INTO renovacao (id_emprestimo, data_renovacao, nova_data_devolucao) VALUES (?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    
    if($stmt->execute([$data->id_emprestimo, $data_renovacao, $data->nova_data_devolucao])) {
        // Dica: Seria ideal fazer um UPDATE na tabela emprestimo atualizando a data final também
        enviarResposta("sucesso", "Renovação registrada!", ["id" => $pdo->lastInsertId()], 201);
    } else {
        enviarResposta("erro", "Falha ao registrar renovação.", null, 503);
    }
} catch (PDOException $e) {
    enviarResposta("erro", "Erro no banco: " . $e->getMessage(), null, 500);
}

?>