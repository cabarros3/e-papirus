<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    enviarResposta("erro", "Método inválido. Use POST.", null, 405);
}

$data = json_decode(file_get_contents("php://input"));

// Validação dos campos NOT NULL do banco
if(
    !isset($data->nome) || 
    !isset($data->matricula) || 
    !isset($data->cpf) || 
    !isset($data->email)
) {
    enviarResposta("erro", "Dados incompletos. Informe nome, matricula, cpf e email.", null, 400);
}

try {
    $sql = "INSERT INTO pessoa (nome, matricula, cpf, email, telefone, tipo) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    
    // Telefone e Tipo são opcionais no JSON, mas Tipo tem ENUM no banco
    $telefone = isset($data->telefone) ? $data->telefone : null;
    $tipo = isset($data->tipo) ? $data->tipo : 'aluno'; // Default para aluno

    $stmt->execute([
        $data->nome, 
        $data->matricula, 
        $data->cpf, 
        $data->email, 
        $telefone, 
        $tipo
    ]);

    enviarResposta("sucesso", "Pessoa cadastrada com sucesso!", ["id_pessoa" => $pdo->lastInsertId()], 201);

} catch (PDOException $e) {
    // Erro 23000 = Violação de Unique (CPF, Email ou Matrícula repetidos)
    if ($e->getCode() == '23000') {
        enviarResposta("erro", "Já existe uma pessoa cadastrada com esse CPF, Matrícula ou Email.", null, 409);
    } else {
        enviarResposta("erro", "Erro no banco: " . $e->getMessage(), null, 500);
    }
}
?>