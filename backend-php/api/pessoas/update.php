<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    enviarResposta("erro", "Método inválido. Use PUT.", null, 405);
}

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->id_pessoa)) {
    enviarResposta("erro", "ID da pessoa é obrigatório.", null, 400);
}

try {
    // Montagem dinâmica da query
    $campos = [];
    $params = [];

    // Lista de campos permitidos para alteração
    $possiveis = ['nome', 'matricula', 'cpf', 'email', 'telefone', 'tipo'];

    foreach ($possiveis as $campo) {
        if (isset($data->$campo)) {
            $campos[] = "$campo = ?";
            $params[] = $data->$campo;
        }
    }

    if (empty($campos)) {
        enviarResposta("erro", "Nenhum dado informado para atualização.", null, 400);
    }

    // Adiciona o ID no final para o WHERE
    $params[] = $data->id_pessoa;

    $sql = "UPDATE pessoa SET " . implode(", ", $campos) . " WHERE id_pessoa = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    enviarResposta("sucesso", "Dados atualizados com sucesso.", null, 200);

} catch (PDOException $e) {
    if ($e->getCode() == '23000') {
        enviarResposta("erro", "Os novos dados (CPF/Email/Matrícula) já pertencem a outra pessoa.", null, 409);
    } else {
        enviarResposta("erro", "Erro ao atualizar: " . $e->getMessage(), null, 500);
    }
}
?>