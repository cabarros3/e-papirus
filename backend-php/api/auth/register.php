<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    enviarResposta("erro", "Método inválido. Use POST.", null, 405);
}

$data = json_decode(file_get_contents("php://input"));

// Validação básica dos campos obrigatórios
if(
    !isset($data->nome) || !isset($data->matricula) || 
    !isset($data->cpf) || !isset($data->email) || 
    !isset($data->senha) || !isset($data->tipo)
) {
    enviarResposta("erro", "Dados incompletos. Informe nome, matricula, cpf, email, senha e tipo.", null, 400);
}

// Criptografar a senha (NUNCA salve senha em texto puro)
$senhaHash = password_hash($data->senha, PASSWORD_DEFAULT);

try {
    // Inicia a transação (tudo ou nada)
    $pdo->beginTransaction();

    // 1. Inserir na tabela PESSOA
    $sqlPessoa = "INSERT INTO pessoa (nome, matricula, cpf, email, telefone, tipo) VALUES (?, ?, ?, ?, ?, ?)";
    $stmtPessoa = $pdo->prepare($sqlPessoa);
    
    // Supondo que telefone é opcional, verificamos se veio
    $telefone = isset($data->telefone) ? $data->telefone : null;

    $stmtPessoa->execute([
        $data->nome, 
        $data->matricula, 
        $data->cpf, 
        $data->email, 
        $telefone, 
        $data->tipo
    ]);

    // Recuperar o ID da pessoa criada
    $idPessoa = $pdo->lastInsertId();

    // 2. Inserir na tabela USUARIO_SISTEMA
    $sqlUsuario = "INSERT INTO usuario_sistema (id_pessoa, email, senha) VALUES (?, ?, ?)";
    $stmtUsuario = $pdo->prepare($sqlUsuario);
    $stmtUsuario->execute([$idPessoa, $data->email, $senhaHash]);

    // Se chegou até aqui sem erro, confirma as alterações no banco
    $pdo->commit();

    enviarResposta("sucesso", "Usuário cadastrado com sucesso!", ["id_pessoa" => $idPessoa], 201);

} catch (PDOException $e) {
    // Se deu erro, desfaz tudo o que foi feito dentro do 'try'
    $pdo->rollBack();

    // Verifica se o erro é de duplicidade (CPF, Matricula ou Email já existem)
    if ($e->getCode() == '23000') {
        enviarResposta("erro", "Dados já cadastrados (CPF, Matrícula ou Email).", null, 409);
    } else {
        enviarResposta("erro", "Erro no banco: " . $e->getMessage(), null, 500);
    }
}
?>