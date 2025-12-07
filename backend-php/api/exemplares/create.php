<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    enviarResposta("erro", "Método inválido. Use POST.", null, 405);
}

$data = json_decode(file_get_contents("php://input"));

// O id_livro é obrigatório para saber de qual obra é este exemplar
if (!isset($data->id_livro)) {
    enviarResposta("erro", "Informe o ID do livro.", null, 400);
}

try {
    // Passo opcional: Verificar se o livro realmente existe antes de tentar criar
    // Isso ajuda a dar uma mensagem de erro mais clara que a do SQL puro
    $check = $pdo->prepare("SELECT id_livro FROM livro WHERE id_livro = ?");
    $check->execute([$data->id_livro]);
    
    if ($check->rowCount() === 0) {
        enviarResposta("erro", "Livro não encontrado. Verifique o ID.", null, 404);
        exit;
    }

    // Inserir o exemplar
    // Note que não precisamos passar 'disponibilidade', o banco já coloca 'disponivel' por padrão (DEFAULT)
    $sql = "INSERT INTO exemplar (id_livro, localizacao, disponibilidade) VALUES (?, ?, 'disponivel')";
    $stmt = $pdo->prepare($sql);
    
    // Se a localização não for informada, colocamos um valor padrão
    $localizacao = isset($data->localizacao) ? $data->localizacao : 'Acervo Geral';

    $stmt->execute([$data->id_livro, $localizacao]);

    enviarResposta("sucesso", "Exemplar cadastrado com sucesso!", ["id_exemplar" => $pdo->lastInsertId()], 201);

} catch (PDOException $e) {
    enviarResposta("erro", "Erro no banco: " . $e->getMessage(), null, 500);
}
?>