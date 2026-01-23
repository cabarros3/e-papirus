<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    enviarResposta("erro", "Método inválido. Use POST.", null, 405);
}

$dados = json_decode(file_get_contents("php://input"), true);

$id_livro = $dados['id_livro'] ?? null;
$localizacao = $dados['localizacao'] ?? null;
$disponibilidade = $dados['disponibilidade'] ?? 'disponivel';

if (!$id_livro || !$localizacao) {
    enviarResposta("erro", "Campos obrigatórios: id_livro, localizacao", null, 400);
}

try {
    // Buscar o próximo numero_exemplar para este livro
    $sqlCount = "SELECT COALESCE(MAX(numero_exemplar), 0) + 1 as proximo_numero 
                 FROM exemplar 
                 WHERE id_livro = ?";
    $stmtCount = $pdo->prepare($sqlCount);
    $stmtCount->execute([$id_livro]);
    $resultado = $stmtCount->fetch(PDO::FETCH_ASSOC);
    $numero_exemplar = $resultado['proximo_numero'];
    
    // Inserir o novo exemplar
    $sql = "INSERT INTO exemplar (id_livro, numero_exemplar, localizacao, disponibilidade) 
            VALUES (?, ?, ?, ?)";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$id_livro, $numero_exemplar, $localizacao, $disponibilidade]);
    
    $id_exemplar = $pdo->lastInsertId();
    
    enviarResposta("sucesso", "Exemplar criado com sucesso!", [
        'id_exemplar' => $id_exemplar,
        'numero_exemplar' => $numero_exemplar
    ], 201);
    
} catch (PDOException $e) {
    enviarResposta("erro", "Erro ao criar exemplar: " . $e->getMessage(), null, 500);
}
?>