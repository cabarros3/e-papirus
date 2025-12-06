<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    enviarResposta("erro", "Método inválido. Use POST.", null, 405);
}

$data = json_decode(file_get_contents("php://input"));

if(!isset($data->email) || !isset($data->senha)) {
    enviarResposta("erro", "Informe email e senha.", null, 400);
}

try {
    // Buscamos o usuário e fazemos JOIN com pessoa para pegar o nome e tipo
    $sql = "SELECT u.id_usuario, u.senha, p.id_pessoa, p.nome, p.tipo 
            FROM usuario_sistema u 
            JOIN pessoa p ON u.id_pessoa = p.id_pessoa 
            WHERE u.email = ?";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$data->email]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    // Verifica se usuário existe e se a senha bate com o hash
    if ($usuario && password_verify($data->senha, $usuario['senha'])) {
        
        // Remove a senha do array antes de enviar para o front (segurança)
        unset($usuario['senha']);

        // AQUI: No futuro, você geraria um Token JWT aqui.
        // Por enquanto, retornamos os dados do usuário.
        
        enviarResposta("sucesso", "Login realizado!", $usuario, 200);
    } else {
        enviarResposta("erro", "Email ou senha incorretos.", null, 401);
    }

} catch (PDOException $e) {
    enviarResposta("erro", "Erro no banco: " . $e->getMessage(), null, 500);
}
?>