<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    enviarResposta("erro", "Método inválido. Use POST.", null, 405);
}

$data = json_decode(file_get_contents("php://input"));

// Validação
if(!isset($data->id_exemplar) || !isset($data->id_pessoa) || !isset($data->id_funcionario) || !isset($data->data_devolucao)) {
    enviarResposta("erro", "Dados de empréstimo incompletos.", null, 400);
}

// Se não enviar data do empréstimo, usa a data atual
$data_emprestimo = $data->data_emprestimo ?? date('Y-m-d');

try {
    $sql = "INSERT INTO emprestimo (id_exemplar, id_pessoa, id_funcionario, data_emprestimo, data_devolucao) VALUES (?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    
    if($stmt->execute([
        $data->id_exemplar, 
        $data->id_pessoa, 
        $data->id_funcionario, 
        $data_emprestimo, 
        $data->data_devolucao
    ])) {
        // Dica: Aqui você também poderia fazer um UPDATE na tabela exemplar para mudar disponibilidade = 0
        enviarResposta("sucesso", "Empréstimo realizado!", ["id" => $pdo->lastInsertId()], 201);
    } else {
        enviarResposta("erro", "Falha ao registrar empréstimo.", null, 503);
    }
} catch (PDOException $e) {
    enviarResposta("erro", "Erro no banco: " . $e->getMessage(), null, 500);
}

?>