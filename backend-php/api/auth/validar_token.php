<?php
require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../../config/auth_config.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

function validarAcesso() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;

    if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        enviarResposta("erro", "Token não fornecido.", null, 401);
        exit;
    }

    try {
        $jwt = $matches[1];
        $decoded = JWT::decode($jwt, new Key(SECRET_KEY, 'HS256'));
        return $decoded->data; // Retorna os dados que você gravou no payload (id_pessoa, tipo, etc)
    } catch (Exception $e) {
        enviarResposta("erro", "Token inválido ou expirado.", null, 401);
        exit;
    }
}