<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';
require_once '../../config.php';
require_once '../../vendor/autoload.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    enviarResposta("erro", "Método inválido. Use POST.", null, 405);
}

$data = json_decode(file_get_contents("php://input"));

// Agora a SENHA também é obrigatória no cadastro
if(
    empty($data->nome) ||
    empty($data->matricula) ||
    empty($data->cpf) ||
    empty($data->email) ||
    empty($data->tipo) ||
    empty($data->senha)
) {
    enviarResposta("erro", "Dados incompletos. Nome, matrícula, cpf, email, tipo e senha são obrigatórios.", null, 400);
}

try {
    $pdo->beginTransaction();

    // 1. INSERIR NA TABELA PESSOA
    $sqlPessoa = "INSERT INTO pessoa (nome, matricula, cpf, email, telefone, tipo, cargo)
                  VALUES (?, ?, ?, ?, ?, ?, ?)";

    $stmtPessoa = $pdo->prepare($sqlPessoa);

    $telefone = !empty($data->telefone) ? $data->telefone : null;
    $tipo = $data->tipo;
    $cargo = ($tipo === 'funcionario' && !empty($data->cargo)) ? $data->cargo : null;

    $stmtPessoa->execute([
        $data->nome,
        $data->matricula,
        $data->cpf,
        $data->email,
        $telefone,
        $tipo,
        $cargo
    ]);

    $idPessoa = $pdo->lastInsertId();

    // 2. INSERIR NA TABELA USUARIO_SISTEMA
    $sqlUsuario = "INSERT INTO usuario_sistema (id_pessoa, email, senha) VALUES (?, ?, ?)";
    $stmtUsuario = $pdo->prepare($sqlUsuario);
    $senhaHash = password_hash($data->senha, PASSWORD_DEFAULT);
    $stmtUsuario->execute([$idPessoa, $data->email, $senhaHash]);

    $pdo->commit();

    // 3. ENVIAR NOTIFICAÇÃO DE BOAS-VINDAS (apenas para alunos)
    if ($tipo === 'aluno') {
        $emailValido = !empty($data->email) && filter_var($data->email, FILTER_VALIDATE_EMAIL);
        if ($emailValido) {
            try {
                $emailService = new \App\Services\EmailService();
                $enviou = $emailService->enviarNotificacao(
                    $data->email,
                    'boas_vindas',
                    [
                        'nome' => $data->nome
                    ]
                );

                if ($enviou) {
                    $insertNotif = $pdo->prepare("INSERT INTO notificacao (id_pessoa, tipo_notificacao, assunto, status) VALUES (?, 'boas_vindas', 'Bem-vindo(a) ao e-Papirus!', 'enviado')");
                    $insertNotif->execute([$idPessoa]);
                } else {
                    $insertNotif = $pdo->prepare("INSERT INTO notificacao (id_pessoa, tipo_notificacao, assunto, status, mensagem_erro) VALUES (?, 'boas_vindas', 'Bem-vindo(a) ao e-Papirus!', 'erro', 'Falha no envio do e-mail')");
                    $insertNotif->execute([$idPessoa]);
                }
            } catch (\Throwable $e) {
                error_log("Erro ao enviar boas-vindas: " . $e->getMessage());
                // Não impede o cadastro
            }
        }
    }

    enviarResposta("sucesso", "Cadastro e Login criados com sucesso!", ["id_pessoa" => $idPessoa], 201);

} catch (PDOException $e) {
    $pdo->rollBack();

    if ($e->getCode() == '23000') {
        enviarResposta("erro", "Erro: CPF, Matrícula ou Email já cadastrados.", null, 409);
    } else {
        enviarResposta("erro", "Erro no banco de dados: " . $e->getMessage(), null, 500);
    }
}
?>
