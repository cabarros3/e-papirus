<?php
header('Content-Type: application/json');
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';
require_once '../../api/auth/validar_token.php';
require_once '../../config.php';
require_once '../../vendor/autoload.php';

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

// Se o usuário é um funcionário, ele pode fazer reservas para outras pessoas
$isStaff = ($usuarioLogado->tipo === 'funcionario' &&
            in_array($usuarioLogado->cargo, ['bibliotecario', 'auxiliar']));

if ($isStaff) {
    $idFinalPessoa = $data->id_pessoa ?? null;
} else {
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

    // Limpa qualquer lixo ou espaço
    if (ob_get_length()) ob_clean();

    // 4. ATUALIZAR STATUS DO EXEMPLAR
    $sqlAtuExemplar = "UPDATE exemplar SET disponibilidade = 'reservado' WHERE id_exemplar = ?";
    $stmtAtuExemplar = $pdo->prepare($sqlAtuExemplar);
    $stmtAtuExemplar->execute([$idExemplar]);

    // 5. BUSCAR DADOS DO LIVRO E DO USUÁRIO PARA O E-MAIL
    $sqlInfo = "SELECT l.titulo, p.nome AS aluno_nome, p.email AS aluno_email, a.nome_autor
                FROM livro l
                JOIN pessoa p ON p.id_pessoa = ?
                LEFT JOIN livro_autor la ON la.id_livro = l.id_livro
                LEFT JOIN autor a ON a.id_autor = la.id_autor
                WHERE l.id_livro = ? LIMIT 1";
    $stmtInfo = $pdo->prepare($sqlInfo);
    $stmtInfo->execute([$idFinalPessoa, $data->id_livro]);
    $info = $stmtInfo->fetch(PDO::FETCH_ASSOC);

    $pdo->commit();

    // 6. ENVIAR NOTIFICAÇÃO DE RESERVA FEITA
    $emailValido = !empty($info['aluno_email']) && filter_var($info['aluno_email'], FILTER_VALIDATE_EMAIL);
    if ($emailValido) {
        try {
            $emailService = new \App\Services\EmailService();
            $enviou = $emailService->enviarNotificacao(
                $info['aluno_email'],
                'reserva_feita',
                [
                    'nome'  => $info['aluno_nome'],
                    'livro' => $info['titulo'],
                    'autor' => $info['nome_autor'] ?? 'Autor não informado',
                    'data'  => date('d/m/Y', strtotime($dataExpiracao))
                ]
            );

            if ($enviou) {
                $insertNotif = $pdo->prepare("INSERT INTO notificacao (id_pessoa, tipo_notificacao, assunto, status) VALUES (?, 'reserva_feita', 'Reserva Confirmada', 'enviado')");
                $insertNotif->execute([$idFinalPessoa]);
            } else {
                $insertNotif = $pdo->prepare("INSERT INTO notificacao (id_pessoa, tipo_notificacao, assunto, status, mensagem_erro) VALUES (?, 'reserva_feita', 'Reserva Confirmada', 'erro', 'Falha no envio')");
                $insertNotif->execute([$idFinalPessoa]);
            }
        } catch (\Throwable $e) {
            error_log("Falha ao enviar e-mail de reserva feita: " . $e->getMessage());
        }
    }

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
