
<?php
require_once '../../config/config.php';
/*
$data = json_decode(file_get_contents("php://input"), true);

$emprestimoId = $data['emprestimo_id'] ?? null;
$novaData = $data['nova_data_devolucao'] ?? null;
$staffId = $data['staff_id'] ?? null;

//  Validação vem antes de qualquer SQL
if (!$emprestimoId || !$novaData || !$staffId) {
    http_response_code(400);
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Dados incompletos"
    ]);
    exit;
}

try {
    // opcional, mas recomendado
    $pdo->beginTransaction();

    // 1. Atualiza o empréstimo
    $sql = "
        UPDATE emprestimos
        SET data_devolucao = :novaData,
            qtd_renovacoes = qtd_renovacoes + 1
        WHERE id = :emprestimoId
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':novaData' => $novaData,
        ':emprestimoId' => $emprestimoId
    ]);

    // 2. Registra o historico
    $sqlRenovacao = "
        INSERT INTO renovacoes (emprestimo_id, staff_id, data_renovacao)
        VALUES (:emprestimoId, :staffId, NOW())
    ";

    $stmt = $pdo->prepare($sqlRenovacao);
    $stmt->execute([
        ':emprestimoId' => $emprestimoId,
        ':staffId' => $staffId
    ]);

    $pdo->commit();

    echo json_encode([
        "sucesso" => true,
        "mensagem" => "Livro renovado com sucesso"
    ]);
} catch (Exception $e) {
    $pdo->rollBack();

    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Erro ao renovar livro"
    ]);
}
