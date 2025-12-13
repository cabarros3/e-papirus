<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    enviarResposta("erro", "Método inválido. Use PUT.", null, 405);
}

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->id_exemplar)) {
    enviarResposta("erro", "ID do exemplar é obrigatório.", null, 400);
}

try {
    // Query dinâmica para atualizar apenas o que foi enviado
    $campos = [];
    $params = [];

    if (isset($data->localizacao)) {
        $campos[] = "localizacao = ?";
        $params[] = $data->localizacao;
    }
    
    if (isset($data->disponibilidade)) {
        // Validação de segurança para garantir que o valor é válido no ENUM do banco
        $validos = ['disponivel', 'emprestado', 'reservado'];
        if (!in_array($data->disponibilidade, $validos)) {
            enviarResposta("erro", "Status inválido. Use: disponivel, emprestado ou reservado.", null, 400);
        }
        $campos[] = "disponibilidade = ?";
        $params[] = $data->disponibilidade;
    }

    if (empty($campos)) {
        enviarResposta("erro", "Nenhum dado informado para atualização.", null, 400);
    }

    // Adiciona o ID no final dos parâmetros para o WHERE
    $params[] = $data->id_exemplar;

    $sql = "UPDATE exemplar SET " . implode(", ", $campos) . " WHERE id_exemplar = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    if ($stmt->rowCount() > 0) {
        enviarResposta("sucesso", "Exemplar atualizado com sucesso.", null, 200);
    } else {
        enviarResposta("aviso", "Nenhuma alteração feita (verifique o ID ou se os dados são iguais).", null, 200);
    }

} catch (PDOException $e) {
    enviarResposta("erro", "Erro ao atualizar: " . $e->getMessage(), null, 500);
}
?>