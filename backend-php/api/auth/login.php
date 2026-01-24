<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';
require_once '../../vendor/autoload.php';

use Firebase\JWT\JWT;

// Defina uma chave secreta forte. Em produção, use variáveis de ambiente (.env)
define('SECRET_KEY', 'sua_chave_secreta_super_segura_123');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    enviarResposta("erro", "Método inválido. Use POST.", null, 405);
}

$data = json_decode(file_get_contents("php://input"));

if(!isset($data->email) || !isset($data->senha)) {
    enviarResposta("erro", "Informe email e senha.", null, 400);
}

try {
    $sql = "SELECT u.id_usuario, u.senha, p.id_pessoa, p.nome, p.tipo 
            FROM usuario_sistema u 
            JOIN pessoa p ON u.id_pessoa = p.id_pessoa 
            WHERE u.email = ?";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$data->email]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($usuario && password_verify($data->senha, $usuario['senha'])) {
        // Remove a senha por segurança
        unset($usuario['senha']);

        // --- GERAÇÃO DO TOKEN JWT ---
        $payload = [
            "iss" => "e-papirus",    // Emissor (Issuer)
            "iat" => time(),                  // Gerado em (Issued At)
            "exp" => time() + (60 * 60 * 24), // Expira em 24 horas
            "data" => [                       // Dados úteis para o Front
                "id_usuario" => $usuario['id_usuario'],
                "id_pessoa"  => $usuario['id_pessoa'],
                "tipo"       => $usuario['tipo'],
                "nome"       => $usuario['nome']
            ]
        ];

        // Gera o token assinado
        $jwt = JWT::encode($payload, SECRET_KEY, 'HS256');

        // Retornamos o token E os dados do usuário para facilitar o Front-end
        enviarResposta("sucesso", "Login realizado!", [
            "token" => $jwt,
            "usuario" => $usuario
        ], 200);

    } else {
        enviarResposta("erro", "Email ou senha incorretos.", null, 401);
    }

} catch (Exception $e) { // Use Exception genérica para pegar erros do JWT também
    enviarResposta("erro", "Erro no processamento: " . $e->getMessage(), null, 500);
}