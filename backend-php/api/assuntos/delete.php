<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    enviarResposta("erro", "Método inválido. Use DELETE.", null, 405);
}

$data = json_decode(file_get_contents("php://input"));

// Validação do ID no corpo da requisição
if (!isset($data->id_assunto)) {
    // Opção extra: pegar ID via URL (?id=1) se não vier no JSON
    if (isset($_GET['id'])) {
        $id = $_GET['id'];
    } else {
        enviarResposta("erro", "ID do assunto não informado.", null, 400);
        exit;
    }
} else {
    $id = $data->id_assunto;
}

try {
    $stmt = $pdo->prepare("DELETE FROM assunto WHERE id_assunto = ?");
    
    if ($stmt->execute([$id])) {
        if ($stmt->rowCount() > 0) {
            enviarResposta("sucesso", "Assunto excluído com sucesso.", [], 200);
        } else {
            enviarResposta("erro", "ID não encontrado.", null, 404);
        }
    } else {
        enviarResposta("erro", "Falha ao excluir.", null, 503);
    }

} catch (PDOException $e) {
    // Código 23000 = Violação de integridade (Foreign Key)
    if ($e->getCode() == '23000') {
        enviarResposta("erro", "Não é possível excluir este assunto pois existem livros vinculados a ele.", null, 409);
    } else {
        enviarResposta("erro", "Erro no banco: " . $e->getMessage(), null, 500);
    }
}
?>