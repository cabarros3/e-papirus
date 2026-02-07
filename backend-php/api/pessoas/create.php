<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    enviarResposta("erro", "Método inválido. Use POST.", null, 405);
}

$data = json_decode(file_get_contents("php://input"));

// Agora a SENHA também é obrigatória no cadastro
if(
    empty($data->nome) || 
    empty($data->matricula) || 
    empty($data->cpf) || 
    empty($data->email) ||
    empty($data->tipo) ||
    empty($data->senha) 
) {
    enviarResposta("erro", "Dados incompletos. Nome, matrícula, cpf, email, tipo e senha são obrigatórios.", null, 400);
}

try {
    // Iniciamos a transação para garantir que as duas tabelas sejam salvas juntas
    $pdo->beginTransaction();

    // 1. INSERIR NA TABELA PESSOA
    $sqlPessoa = "INSERT INTO pessoa (nome, matricula, cpf, email, telefone, tipo, cargo) 
                  VALUES (?, ?, ?, ?, ?, ?, ?)";
    
    $stmtPessoa = $pdo->prepare($sqlPessoa);
    
    // No seu create.php, altere estas linhas:
    $telefone = !empty($data->telefone) ? $data->telefone : null;
    $tipo = $data->tipo; 

    // AJUSTE AQUI: Se não for funcionário, o cargo DEVE ser nulo de forma clara
    $cargo = ($tipo === 'funcionario' && !empty($data->cargo)) ? $data->cargo : null;

    $stmtPessoa->execute([
        $data->nome, 
        $data->matricula, 
        $data->cpf, 
        $data->email, 
        $telefone,
        $tipo,
        $cargo
    ]);

    // Pegamos o ID gerado para a pessoa
    $idPessoa = $pdo->lastInsertId();

    // 2. INSERIR NA TABELA USUARIO_SISTEMA (Aqui criamos o Login)
    $sqlUsuario = "INSERT INTO usuario_sistema (id_pessoa, email, senha) VALUES (?, ?, ?)";
    $stmtUsuario = $pdo->prepare($sqlUsuario);
    
    // Criptografamos a senha antes de salvar
    $senhaHash = password_hash($data->senha, PASSWORD_DEFAULT);

    $stmtUsuario->execute([
        $idPessoa,
        $data->email, // Usamos o mesmo email da tabela pessoa
        $senhaHash
    ]);

    // Se tudo deu certo, confirma as alterações no banco
    $pdo->commit();

    enviarResposta("sucesso", "Cadastro e Login criados com sucesso!", ["id_pessoa" => $idPessoa], 201);

} catch (PDOException $e) {
    // Se algo deu errado em qualquer uma das tabelas, desfaz tudo
    $pdo->rollBack();
    
    if ($e->getCode() == '23000') {
        enviarResposta("erro", "Erro: CPF, Matrícula ou Email já cadastrados.", null, 409);
    } else {
        enviarResposta("erro", "Erro no banco de dados: " . $e->getMessage(), null, 500);
    }
}
?>