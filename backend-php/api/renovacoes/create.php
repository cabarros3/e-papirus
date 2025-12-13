<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    enviarResposta("erro", "Método inválido. Use POST.", null, 405);
}

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->id_emprestimo)) {
    enviarResposta("erro", "Informe o ID do empréstimo.", null, 400);
}

try {
    $pdo->beginTransaction();

    // 1. Buscar dados do empréstimo
    // Usamos FOR UPDATE para garantir consistência
    $stmt = $pdo->prepare("SELECT data_prevista, data_devolucao FROM emprestimo WHERE id_emprestimo = ? FOR UPDATE");
    $stmt->execute([$data->id_emprestimo]);
    $emp = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$emp) {
        $pdo->rollBack();
        enviarResposta("erro", "Empréstimo não encontrado.", null, 404);
        exit;
    }

    // 2. Validações de Regra de Negócio

    // A: O livro já foi devolvido?
    if ($emp['data_devolucao'] !== null) {
        $pdo->rollBack();
        enviarResposta("erro", "Não é possível renovar: este livro já foi devolvido.", null, 409);
        exit;
    }

    $dataHoje = date('Y-m-d');
    $dataPrevistaAtual = $emp['data_prevista'];

    // B: O livro está atrasado? (Sua regra: permite antes ou no dia, bloqueia depois)
    if ($dataHoje > $dataPrevistaAtual) {
        $pdo->rollBack();
        enviarResposta("erro", "Renovação negada: O livro está atrasado. Por favor, devolva no balcão.", null, 409);
        exit;
    }

    // 3. Calcular a nova data
    // Lógica: Adiciona 14 dias à data prevista atual
    $novaData = date('Y-m-d', strtotime($dataPrevistaAtual . ' + 7 days'));

    // 4. Inserir registro na tabela RENOVAÇÃO (Histórico)
    $sqlLog = "INSERT INTO renovacao (id_emprestimo, data_renovacao, nova_data_devolucao) VALUES (?, ?, ?)";
    $stmtLog = $pdo->prepare($sqlLog);
    $stmtLog->execute([$data->id_emprestimo, $dataHoje, $novaData]);

    // 5. Atualizar a tabela EMPRESTIMO com a nova data
    // Isso é crucial para que o sistema pare de cobrar o usuário
    $sqlUp = "UPDATE emprestimo SET data_prevista = ? WHERE id_emprestimo = ?";
    $stmtUp = $pdo->prepare($sqlUp);
    $stmtUp->execute([$novaData, $data->id_emprestimo]);

    $pdo->commit();
    enviarResposta("sucesso", "Renovação realizada com sucesso!", [
        "data_anterior" => $dataPrevistaAtual,
        "nova_data_entrega" => $novaData
    ], 201);

} catch (PDOException $e) {
    $pdo->rollBack();
    enviarResposta("erro", "Erro ao renovar: " . $e->getMessage(), null, 500);
}
?>