
<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    enviarResposta("erro", "Método inválido. Use POST.", null, 405);
}

$data = json_decode(file_get_contents("php://input"));

if (
    !isset($data->id_pessoa) ||
    !isset($data->senha_atual) ||
    !isset($data->nova_senha) ||
    $data->id_pessoa === '' ||
    $data->senha_atual === '' ||
    $data->nova_senha === ''
) {
    enviarResposta("erro", "Todos os campos são obrigatórios.", null, 400);
}

if (!is_numeric($data->id_pessoa) || (int) $data->id_pessoa <= 0) {
    enviarResposta("erro", "ID da pessoa inválido.", null, 400);
}

if (strlen($data->nova_senha) < 6) {
    enviarResposta("erro", "A nova senha deve ter pelo menos 6 caracteres.", null, 400);
}

try {
    // Busca o usuário relacionado à pessoa informada.
    $sql = "SELECT id_usuario, senha
            FROM usuario_sistema
            WHERE id_pessoa = ?";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([(int) $data->id_pessoa]);

    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$usuario) {
        enviarResposta("erro", "Usuário não encontrado.", null, 404);
    }

    // Confere a senha atual com o hash armazenado.
    if (!password_verify($data->senha_atual, $usuario['senha'])) {
        enviarResposta("erro", "A senha atual está incorreta.", null, 401);
    }

    // Gera o hash da nova senha.
    $novoHash = password_hash($data->nova_senha, PASSWORD_DEFAULT);

    // Atualiza somente a senha do usuário.
    $sqlUpdate = "UPDATE usuario_sistema
                  SET senha = ?
                  WHERE id_usuario = ?";

    $stmtUpdate = $pdo->prepare($sqlUpdate);
    $stmtUpdate->execute([$novoHash, $usuario['id_usuario']]);

    enviarResposta("sucesso", "Senha alterada com sucesso.", null, 200);

} catch (PDOException $e) {
    error_log("Erro ao alterar senha: " . $e->getMessage());

    enviarResposta("erro", "Não foi possível alterar a senha.", null, 500);
}
