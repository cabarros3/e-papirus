<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    enviarResposta("erro", "Método inválido. Use PUT.", null, 405);
}

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->id_autor) || !isset($data->nome_autor)) {
    enviarResposta("erro", "Informe o ID e o novo nome do autor.", null, 400);
}

try {
    $sql = "UPDATE autor SET nome_autor = ? WHERE id_autor = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$data->nome_autor, $data->id_autor]);

    if ($stmt->rowCount() > 0) {
        enviarResposta("sucesso", "Autor atualizado com sucesso!", null, 200);
    } else {
        // Pode acontecer se o ID não existir ou se o nome for igual ao anterior
        enviarResposta("aviso", "Nenhuma alteração realizada (verifique o ID ou se o nome é igual).", null, 200);
    }

} catch (PDOException $e) {
    enviarResposta("erro", "Erro ao atualizar: " . $e->getMessage(), null, 500);
}
?>