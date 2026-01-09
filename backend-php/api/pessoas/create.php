<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    enviarResposta("erro", "Método inválido. Use POST.", null, 405);
}

$data = json_decode(file_get_contents("php://input"));


if(
    empty($data->nome) || 
    empty($data->matricula) || 
    empty($data->cpf) || 
    empty($data->email) ||
    empty($data->tipo)
) {
    enviarResposta("erro", "Dados incompletos. Nome, matrícula, cpf, email e tipo são obrigatórios.", null, 400);
}

try {
    
    $sql = "INSERT INTO pessoa (nome, matricula, cpf, email, telefone, tipo, cargo) 
            VALUES (?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $pdo->prepare($sql);
    
 
    $telefone = isset($data->telefone) ? $data->telefone : null;
    $tipo = $data->tipo; 
    
    // Lógica para o Cargo
    // Se não for funcionário, o cargo deve ser null
    $cargo = ($tipo === 'funcionario' && isset($data->cargo)) ? $data->cargo : null;

    $stmt->execute([
        $data->nome, 
        $data->matricula, 
        $data->cpf, 
        $data->email, 
        $telefone,
        $tipo,
        $cargo
    ]);

    enviarResposta("sucesso", "Cadastro realizado com sucesso!", ["id_pessoa" => $pdo->lastInsertId()], 201);

} catch (PDOException $e) {
    
    if ($e->getCode() == '23000') {
        enviarResposta("erro", "Já existe uma pessoa com este CPF, Matrícula ou Email cadastrado.", null, 409);
    } else {
        
        enviarResposta("erro", "Erro no banco de dados: " . $e->getMessage(), null, 500);
    }
}
?>