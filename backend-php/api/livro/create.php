<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    enviarResposta("erro", "Método inválido. Use POST.", null, 405);
}

$data = json_decode(file_get_contents("php://input"));



// Validação dos campos obrigatórios
if(!isset($data->id_assunto) || !isset($data->titulo) || !isset($data->editora) || !isset($data->ano)) {
    enviarResposta("erro", "Dados incompletos. Informe id_assunto, titulo, editora e ano.", null, 400);
}

try {
    $sql = "INSERT INTO livro (id_assunto, titulo, editora, ano) VALUES (?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    
    if($stmt->execute([
        $data->id_assunto, 
        $data->titulo, 
        $data->editora, 
        $data->ano
    ])) {
        // Retornamos o ID para que o front-end possa usar (ex: para vincular autores logo em seguida)
        enviarResposta("sucesso", "Livro cadastrado com sucesso!", [
            "id_livro" => $pdo->lastInsertId(),
            "titulo" => $data->titulo
        ], 201);
    } else {
        enviarResposta("erro", "Falha ao cadastrar livro.", null, 503);
    }

} catch (PDOException $e) {
    // Código 23000 indica violação de integridade (geralmente chave estrangeira inválida)
    if ($e->getCode() == '23000') {
         enviarResposta("erro", "O id_assunto informado não existe.", null, 400);
    } else {
         enviarResposta("erro", "Erro no banco: " . $e->getMessage(), null, 500);
    }
}

?>