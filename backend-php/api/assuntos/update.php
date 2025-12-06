<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    enviarResposta("erro", "Método inválido. Use PUT.", null, 405);
}

$data = json_decode(file_get_contents("php://input"));

// Validação
if (!isset($data->id_assunto) || !isset($data->nome_assunto)) {
    enviarResposta("erro", "Dados incompletos. Informe id_assunto e nome_assunto.", null, 400);
}

try {
    $sql = "UPDATE assunto SET nome_assunto = ? WHERE id_assunto = ?";
    $stmt = $pdo->prepare($sql);

    if ($stmt->execute([$data->nome_assunto, $data->id_assunto])) {
        // rowCount verifica se alguma linha foi afetada
        if ($stmt->rowCount() > 0) {
            enviarResposta("sucesso", "Assunto atualizado com sucesso!", [], 200);
        } else {
            enviarResposta("sucesso", "Nenhuma alteração realizada (ID não existe ou nome igual).", [], 200);
        }
    } else {
        enviarResposta("erro", "Falha ao atualizar.", null, 503);
    }

} catch (PDOException $e) {
    enviarResposta("erro", "Erro no banco: " . $e->getMessage(), null, 500);
}
?>