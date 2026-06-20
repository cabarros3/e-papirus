<?php
header('Content-Type: application/json');
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';
require_once '../../api/auth/validar_token.php';

// 1. Validação de Acesso e Identidade
$usuarioLogado = validarAcesso();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    enviarResposta("erro", "Método inválido. Use POST.", null, 405);
    exit;
}

$data = json_decode(file_get_contents("php://input"));

if (empty($data->id_livro)) {
    enviarResposta("erro", "O ID do livro é obrigatório.", null, 400);
    exit;
}

// --- LÓGICA DE IDENTIDADE ---
// $idFinalPessoa = $data->id_pessoa ?? null;

// if ($usuarioLogado->tipo !== 'adm' && $usuarioLogado->tipo !== 'staff') {
//     $idFinalPessoa = $usuarioLogado->id_pessoa;
// }



// Se o usuário é um funcionário com cargo de bibliotecário/auxiliar, 
// ele pode fazer reservas para outras pessoas
$isStaff = ($usuarioLogado->tipo === 'funcionario' && 
            in_array($usuarioLogado->cargo, ['bibliotecario', 'auxiliar']));

if ($isStaff) {
    // Se é staff, usa o id_pessoa que veio do frontend
    $idFinalPessoa = $data->id_pessoa ?? null;
} else {
    // Se não é staff, usa sempre seu próprio id_pessoa
    $idFinalPessoa = $usuarioLogado->id_pessoa;
}

if (!$idFinalPessoa) {
    enviarResposta("erro", "ID da pessoa não identificado.", null, 400);
    exit;
}

try {
    $pdo->beginTransaction();

    // 2. VERIFICAR SE EXISTE UM EXEMPLAR DISPONÍVEL
    $sqlExemplar = "SELECT id_exemplar FROM exemplar 
                    WHERE id_livro = ? AND disponibilidade = 'disponivel' 
                    LIMIT 1 FOR UPDATE";
    
    $stmtExemplar = $pdo->prepare($sqlExemplar);
    $stmtExemplar->execute([$data->id_livro]);
    $exemplar = $stmtExemplar->fetch(PDO::FETCH_ASSOC);

    if (!$exemplar) {
        $pdo->rollBack();
        enviarResposta("erro", "Não há exemplares disponíveis para este livro.", null, 404);
        exit;
    }

    $idExemplar = $exemplar['id_exemplar'];

    // --- LÓGICA DE PRAZOS DIFERENCIADOS ---
    $prazo = '+3 days';
    if ($usuarioLogado->tipo === 'professor') {
        $prazo = '+7 days';
    }
    $dataExpiracao = date('Y-m-d', strtotime($prazo));

    // 3. INSERIR NA TABELA DE RESERVA
    $sqlReserva = "INSERT INTO reserva (id_livro, id_pessoa, id_exemplar, data_expiracao, status) 
                   VALUES (?, ?, ?, ?, 'ativa')";
    
    $stmtReserva = $pdo->prepare($sqlReserva);
    $stmtReserva->execute([
        $data->id_livro,
        $idFinalPessoa,
        $idExemplar,
        $dataExpiracao
    ]);

    $idReserva = $pdo->lastInsertId();

    // Limpa qualquer lixo ou espaço que possa ter vindo de outros arquivos
    if (ob_get_length()) ob_clean();

    // 4. ATUALIZAR STATUS DO EXEMPLAR
    $sqlAtuExemplar = "UPDATE exemplar SET disponibilidade = 'reservado' WHERE id_exemplar = ?";
    $stmtAtuExemplar = $pdo->prepare($sqlAtuExemplar);
    $stmtAtuExemplar->execute([$idExemplar]);

    $pdo->commit();

    enviarResposta("sucesso", "Reserva realizada! Expira em: " . date('d/m/Y', strtotime($dataExpiracao)), [
        "id_reserva" => $idReserva,
        "id_pessoa" => $idFinalPessoa,
        "id_exemplar" => $idExemplar,
        "data_expiracao" => $dataExpiracao
    ], 201);
    exit;

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    enviarResposta("erro", "Erro no banco: " . $e->getMessage(), null, 500);
    exit;
} catch (Exception $e) {
    enviarResposta("erro", "Erro geral: " . $e->getMessage(), null, 500);
    exit;
}


// código original:
// <?php
// require_once '../../config/cors.php';
// require_once '../../config/utils.php';
// require_once '../../db/db.php';
// require_once '../../api/auth/validar_token.php'; // Arquivo que criamos no passo anterior

// // 1. Validação de Acesso e Identidade
// // O validarAcesso() deve retornar o objeto "data" do payload do seu JWT
// $usuarioLogado = validarAcesso(); 

// if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
//     enviarResposta("erro", "Método inválido. Use POST.", null, 405);
// }

// $data = json_decode(file_get_contents("php://input"));

// if (empty($data->id_livro)) {
//     enviarResposta("erro", "O ID do livro é obrigatório.", null, 400);
// }

// // --- LÓGICA DE IDENTIDADE (O PONTO CHAVE) ---
// // Se for staff/adm, ele pode reservar para qualquer id_pessoa vindo do JSON.
// // Se for aluno/professor, forçamos o ID dele que veio do Token (Segurança).
// $idFinalPessoa = $data->id_pessoa ?? null;

// if ($usuarioLogado->tipo !== 'adm' && $usuarioLogado->tipo !== 'staff') {
//     $idFinalPessoa = $usuarioLogado->id_pessoa;
// }

// if (!$idFinalPessoa) {
//     enviarResposta("erro", "ID da pessoa não identificado.", null, 400);
// }

// try {
//     $pdo->beginTransaction();

//     // 2. VERIFICAR SE EXISTE UM EXEMPLAR DISPONÍVEL
//     // Mantemos o 'FOR UPDATE' para evitar concorrência (Race Condition)
//     $sqlExemplar = "SELECT id_exemplar FROM exemplar 
//                     WHERE id_livro = ? AND disponibilidade = 'disponivel' 
//                     LIMIT 1 FOR UPDATE";
    
//     $stmtExemplar = $pdo->prepare($sqlExemplar);
//     $stmtExemplar->execute([$data->id_livro]);
//     $exemplar = $stmtExemplar->fetch(PDO::FETCH_ASSOC);

//     if (!$exemplar) {
//         $pdo->rollBack();
//         enviarResposta("erro", "Não há exemplares disponíveis para este livro.", null, 404);
//         exit;
//     }

//     $idExemplar = $exemplar['id_exemplar'];

//     // --- LÓGICA DE PRAZOS DIFERENCIADOS ---
//     // Alunos: 3 dias | Professores: 7 dias | Staff: 5 dias (ou o que preferir)
//     $prazo = '+3 days';
//     if ($usuarioLogado->tipo === 'professor') {
//         $prazo = '+7 days';
//     }
//     $dataExpiracao = date('Y-m-d', strtotime($prazo));

//     // 3. INSERIR NA TABELA DE RESERVA
//     $sqlReserva = "INSERT INTO reserva (id_livro, id_pessoa, id_exemplar, data_expiracao, status) 
//                    VALUES (?, ?, ?, ?, 'ativa')";
    
//     $stmtReserva = $pdo->prepare($sqlReserva);
//     $stmtReserva->execute([
//         $data->id_livro,
//         $idFinalPessoa,
//         $idExemplar,
//         $dataExpiracao
//     ]);

//     $idReserva = $pdo->lastInsertId();

//     // 4. ATUALIZAR STATUS DO EXEMPLAR
//     $sqlAtuExemplar = "UPDATE exemplar SET disponibilidade = 'reservado' WHERE id_exemplar = ?";
//     $stmtAtuExemplar = $pdo->prepare($sqlAtuExemplar);
//     $stmtAtuExemplar->execute([$idExemplar]);

//     $pdo->commit();

//     enviarResposta("sucesso", "Reserva realizada! Expira em: " . date('d/m/Y', strtotime($dataExpiracao)), [
//         "id_reserva" => $idReserva,
//         "id_pessoa" => $idFinalPessoa,
//         "data_expiracao" => $dataExpiracao
//     ], 201);

// } catch (PDOException $e) {
//     if ($pdo->inTransaction()) {
//         $pdo->rollBack();
//     }
//     enviarResposta("erro", "Erro no banco: " . $e->getMessage(), null, 500);
// }