<?php
// backend/config/utils.php

require_once __DIR__ . '/../vendor/autoload.php'; 
require_once __DIR__ . '/../config/auth_config.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

/**
 * Função padrão para enviar respostas JSON
 */
function enviarResposta($status, $mensagem, $dados = null, $httpCode = 200) {
    header("Content-Type: application/json; charset=UTF-8");
    http_response_code($httpCode);

    $resposta = [
        "status" => $status,
        "mensagem" => $mensagem, // Ajustado para bater com seu login.php
        "dados" => $dados        // Ajustado para bater com seu login.php
    ];

    echo json_encode($resposta);
    exit;
}

/**
 * PROTEÇÃO: Valida o Token JWT enviado no Header
 */
function validarTokenJWT() {
    // Captura todos os headers da requisição
    $headers = getallheaders();
    
    // Procura pelo header Authorization (Bearer <token>)
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;

    if (!$authHeader) {
        enviarResposta("erro", "Acesso negado. Faça login para continuar.", null, 401);
    }

    // O header geralmente vem como "Bearer [TOKEN]", precisamos apenas do código
    $token = str_replace("Bearer ", "", $authHeader);

    try {
        // Decodifica o token usando a sua chave secreta centralizada
        $decoded = JWT::decode($token, new Key(SECRET_KEY, 'HS256'));
        
        // Retorna os dados do usuário (id, nome, tipo) que estão dentro do payload
        return $decoded->data; 
        
    } catch (Exception $e) {
        // Se o token for falso, expirado ou alterado, ele cai aqui
        enviarResposta("erro", "Sessão inválida ou expirada.", null, 401);
    }
}