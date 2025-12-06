<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    enviarResposta("erro", "Método inválido. Use POST.", null, 405);
}

$data = json_decode(file_get_contents("php://input"));

// 1. Validação dos campos OBRIGATÓRIOS (baseado no seu NOT NULL)
// Nota: 'autores' não está na tabela livro, mas é obrigatório para a lógica do sistema.
if(
    !isset($data->id_assunto) || 
    !isset($data->titulo) || 
    !isset($data->editora) || 
    !isset($data->ano_publicacao) ||
    !isset($data->autores) || !is_array($data->autores)
) {
    enviarResposta("erro", "Dados incompletos. Informe id_assunto, titulo, editora, ano_publicacao e a lista de autores.", null, 400);
}

try {
    $pdo->beginTransaction();

    // 2. Query atualizada com todos os 8 campos da sua tabela
    $sqlLivro = "INSERT INTO livro (
                    id_assunto, 
                    titulo, 
                    editora, 
                    cidade_publicacao, 
                    ano_publicacao, 
                    nota_resumo, 
                    capa, 
                    descricao_fisica
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $pdo->prepare($sqlLivro);
    
    // 3. Execução com tratamento de campos opcionais (NULL)
    // Se o campo não vier no JSON, enviamos null para o banco.
    $stmt->execute([
        $data->id_assunto,                                                  // Obrigatório
        $data->titulo,                                                      // Obrigatório
        $data->editora,                                                     // Obrigatório
        isset($data->cidade_publicacao) ? $data->cidade_publicacao : null,  // Opcional
        $data->ano_publicacao,                                              // Obrigatório
        isset($data->nota_resumo) ? $data->nota_resumo : null,              // Opcional
        isset($data->capa) ? $data->capa : null,                            // Opcional (URL ou nome do arquivo)
        isset($data->descricao_fisica) ? $data->descricao_fisica : null     // Opcional
    ]);

    $idLivro = $pdo->lastInsertId();

    // 4. Inserção na tabela de ligação (LIVRO_AUTOR)
    $sqlAutor = "INSERT INTO livro_autor (id_livro, id_autor) VALUES (?, ?)";
    $stmtAutor = $pdo->prepare($sqlAutor);

    foreach ($data->autores as $idAutor) {
        $stmtAutor->execute([$idLivro, $idAutor]);
    }

    $pdo->commit();
    enviarResposta("sucesso", "Livro cadastrado com sucesso!", ["id_livro" => $idLivro], 201);

} catch (PDOException $e) {
    $pdo->rollBack();
    enviarResposta("erro", "Erro ao salvar livro: " . $e->getMessage(), null, 500);
}
?>