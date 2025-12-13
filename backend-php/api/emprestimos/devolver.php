<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    enviarResposta("erro", "Método inválido. Use PUT.", null, 405);
}

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->id_emprestimo)) {
    enviarResposta("erro", "ID do empréstimo obrigatório.", null, 400);
}

try {
    $pdo->beginTransaction();

    // 1. Buscar dados do empréstimo (para saber qual é o exemplar)
    $stmtGet = $pdo->prepare("SELECT id_exemplar, data_prevista, data_devolucao FROM emprestimo WHERE id_emprestimo = ?");
    $stmtGet->execute([$data->id_emprestimo]);
    $emp = $stmtGet->fetch(PDO::FETCH_ASSOC);

    if (!$emp) {
        $pdo->rollBack();
        enviarResposta("erro", "Empréstimo não encontrado.", null, 404);
        exit;
    }

    if ($emp['data_devolucao'] !== null) {
        $pdo->rollBack();
        enviarResposta("erro", "Este empréstimo já foi devolvido.", null, 409);
        exit;
    }

    $dataHoje = date('Y-m-d');

    // 2. Atualizar tabela EMPRESTIMO (setar data_devolucao)
    $stmtUpEmp = $pdo->prepare("UPDATE emprestimo SET data_devolucao = ? WHERE id_emprestimo = ?");
    $stmtUpEmp->execute([$dataHoje, $data->id_emprestimo]);

    // 3. Atualizar tabela EXEMPLAR (liberar para 'disponivel')
    $stmtUpEx = $pdo->prepare("UPDATE exemplar SET disponibilidade = 'disponivel' WHERE id_exemplar = ?");
    $stmtUpEx->execute([$emp['id_exemplar']]);

    $pdo->commit();

    // Verificação simples de atraso para mensagem
    $mensagem = "Devolução realizada com sucesso.";
    if ($dataHoje > $emp['data_prevista']) {
        $mensagem .= " (ATENÇÃO: Devolvido com atraso!)";
    }

    enviarResposta("sucesso", $mensagem, null, 200);

} catch (PDOException $e) {
    $pdo->rollBack();
    enviarResposta("erro", "Erro na devolução: " . $e->getMessage(), null, 500);
}
?>