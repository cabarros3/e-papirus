<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    enviarResposta("erro", "Método inválido. Use PUT.", null, 405);
}

$data = json_decode(file_get_contents("php://input"));

// 1. Validação: ID é obrigatório para saber qual atualizar
if (!isset($data->id_livro)) {
    enviarResposta("erro", "ID do livro não informado.", null, 400);
}

// Verifica se os campos obrigatórios (NOT NULL) vieram
if (
    !isset($data->titulo) || 
    !isset($data->id_assunto) || 
    !isset($data->editora) || 
    !isset($data->ano_publicacao) ||
    !isset($data->autores) || !is_array($data->autores)
) {
    enviarResposta("erro", "Dados incompletos. Informe id_livro, titulo, id_assunto, editora, ano e lista de autores.", null, 400);
}

try {
    $pdo->beginTransaction();

    // 2. Atualiza a tabela LIVRO
    $sqlLivro = "UPDATE livro SET 
                 id_assunto = ?, 
                 titulo = ?, 
                 editora = ?, 
                 cidade_publicacao = ?, 
                 ano_publicacao = ?, 
                 nota_resumo = ?, 
                 capa = ?, 
                 descricao_fisica = ? 
                 WHERE id_livro = ?";
    
    $stmt = $pdo->prepare($sqlLivro);
    $stmt->execute([
        $data->id_assunto,
        $data->titulo,
        $data->editora,
        isset($data->cidade_publicacao) ? $data->cidade_publicacao : null,
        $data->ano_publicacao,
        isset($data->nota_resumo) ? $data->nota_resumo : null,
        isset($data->capa) ? $data->capa : null,
        isset($data->descricao_fisica) ? $data->descricao_fisica : null,
        $data->id_livro // O ID vai no final por causa do WHERE
    ]);

    // 3. Atualizar Autores (Estratégia: Apagar todos antigos e recriar os novos)
    
    // A. Remove vínculos antigos
    $stmtDelete = $pdo->prepare("DELETE FROM livro_autor WHERE id_livro = ?");
    $stmtDelete->execute([$data->id_livro]);

    // B. Insere os novos (se houver)
    if (count($data->autores) > 0) {
        $stmtInsert = $pdo->prepare("INSERT INTO livro_autor (id_livro, id_autor) VALUES (?, ?)");
        foreach ($data->autores as $idAutor) {
            $stmtInsert->execute([$data->id_livro, $idAutor]);
        }
    }

    $pdo->commit();
    enviarResposta("sucesso", "Livro atualizado com sucesso!", null, 200);

} catch (PDOException $e) {
    $pdo->rollBack();
    enviarResposta("erro", "Erro ao atualizar livro: " . $e->getMessage(), null, 500);
}
?>