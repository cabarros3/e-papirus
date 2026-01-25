<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    enviarResposta("erro", "Método inválido. Use POST.", null, 405);
}

$data = json_decode(file_get_contents("php://input"));

// id_livro: O livro que quer reservar
// id_pessoa: Quem está reservando
if (empty($data->id_livro) || empty($data->id_pessoa)) {
    enviarResposta("erro", "Dados incompletos. ID do livro e ID da pessoa são obrigatórios.", null, 400);
}

try {
    $pdo->beginTransaction();

    // 1. VERIFICAR SE EXISTE UM EXEMPLAR DISPONÍVEL
    $sqlExemplar = "SELECT id_exemplar FROM exemplar 
                    WHERE id_livro = ? AND disponibilidade = 'disponivel' 
                    LIMIT 1 FOR UPDATE"; // 'FOR UPDATE' evita que dois usuários reservem o mesmo item ao mesmo tempo
    
    $stmtExemplar = $pdo->prepare($sqlExemplar);
    $stmtExemplar->execute([$data->id_livro]);
    $exemplar = $stmtExemplar->fetch(PDO::FETCH_ASSOC);

    if (!$exemplar) {
        $pdo->rollBack();
        enviarResposta("erro", "Não há exemplares disponíveis para reserva deste livro no momento.", null, 404);
        exit;
    }

    $idExemplar = $exemplar['id_exemplar'];

    // insert na na tabela reserva
    // expiração padrão (ex: 3 dias a partir de hoje)
    $dataExpiracao = date('Y-m-d', strtotime('+3 days'));

    $sqlReserva = "INSERT INTO reserva (id_livro, id_pessoa, data_expiracao, status) 
                   VALUES (?, ?, ?, 'ativa')";
    
    $stmtReserva = $pdo->prepare($sqlReserva);
    $stmtReserva->execute([
        $data->id_livro,
        $data->id_pessoa,
        $dataExpiracao
    ]);

    $idReserva = $pdo->lastInsertId();

    // ATUALIZAR O STATUS DO EXEMPLAR PARA 'RESERVADO'
    $sqlAtuExemplar = "UPDATE exemplar SET disponibilidade = 'reservado' WHERE id_exemplar = ?";
    $stmtAtuExemplar = $pdo->prepare($sqlAtuExemplar);
    $stmtAtuExemplar->execute([$idExemplar]);

    $pdo->commit();

    enviarResposta("sucesso", "Reserva realizada com sucesso! O livro ficará aguardando até $dataExpiracao.", [
        "id_reserva" => $idReserva,
        "id_exemplar_reservado" => $idExemplar
    ], 201);

} catch (PDOException $e) {
    $pdo->rollBack();
    enviarResposta("erro", "Erro no banco de dados: " . $e->getMessage(), null, 500);
}
?>