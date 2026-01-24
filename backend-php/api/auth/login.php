<?php
// backend-php/api/auth/login.php

// Usando caminhos absolutos baseados no diretório atual (__DIR__)
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/utils.php';
require_once __DIR__ . '/../../db/db.php';
require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../../config/auth_config.php';

use Firebase\JWT\JWT;

// Garante que a requisição seja POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    enviarResposta("erro", "Método inválido. Use POST.", null, 405);
}

// Captura os dados enviados no corpo da requisição (JSON)
$data = json_decode(file_get_contents("php://input"));

// Validação de entrada
if (!isset($data->email) || !isset($data->senha)) {
    enviarResposta("erro", "Informe email e senha.", null, 400);
}

try {
    // Busca o usuário e os dados da pessoa vinculada
    $sql = "SELECT u.id_usuario, u.senha, p.id_pessoa, p.nome, p.tipo 
            FROM usuario_sistema u 
            JOIN pessoa p ON u.id_pessoa = p.id_pessoa 
            WHERE u.email = ?";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$data->email]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    // Verifica senha
    if ($usuario && password_verify($data->senha, $usuario['senha'])) {
        
        // Remove o hash da senha antes de gerar o token
        unset($usuario['senha']);

        // --- GERAÇÃO DO TOKEN JWT ---
        $payload = [
            "iss" => "e-papirus",
            "iat" => time(),
            "exp" => time() + JWT_EXPIRATION, // Usando a expiração do config
            "data" => [
                "id_usuario" => (int)$usuario['id_usuario'],
                "id_pessoa"  => (int)$usuario['id_pessoa'],
                "tipo"       => $usuario['tipo'],
                "nome"       => $usuario['nome']
            ]
        ];

        // IMPORTANTE: Aqui usamos SECRET_KEY que vem do auth_config.php
        $jwt = JWT::encode($payload, SECRET_KEY, 'HS256');

        enviarResposta("sucesso", "Login realizado!", [
            "token" => $jwt,
            "usuario" => $usuario
        ], 200);

    } else {
        enviarResposta("erro", "Email ou senha incorretos.", null, 401);
    }

} catch (Exception $e) {
    enviarResposta("erro", "Erro no processamento interno: " . $e->getMessage(), null, 500);
}