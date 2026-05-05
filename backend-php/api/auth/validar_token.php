<?php
//   Código original:
// require_once __DIR__ . '/../../vendor/autoload.php';
// require_once __DIR__ . '/../../config/auth_config.php';
// use Firebase\JWT\JWT;
// use Firebase\JWT\Key;

// function validarAcesso() {
//     $headers = getallheaders();
//     $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;

//     if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
//         enviarResposta("erro", "Token não fornecido.", null, 401);
//         exit;
//     }

//     try {
//         $jwt = $matches[1];
//         $decoded = JWT::decode($jwt, new Key(SECRET_KEY, 'HS256'));
//         return $decoded->data; // Retorna os dados que você gravou no payload (id_pessoa, tipo, etc)
//     } catch (Exception $e) {
//         enviarResposta("erro", "Token inválido ou expirado.", null, 401);
//         exit;
//     }
// } 
            // Para testes
require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../../config/auth_config.php';
require_once __DIR__ . '/../../config/utils.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

function validarAcesso() {
    // Garantir que headers HTTP foram enviados
    if (!headers_sent()) {
        header('Content-Type: application/json');
    }
    
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;

    if (!$authHeader) {
        http_response_code(401);
        echo json_encode(["status" => "erro", "mensagem" => "Token não fornecido.", "dados" => null]);
        exit;
    }

    if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        http_response_code(401);
        echo json_encode(["status" => "erro", "mensagem" => "Formato de token inválido.", "dados" => null]);
        exit;
    }

    try {
        $jwt = $matches[1];
        $decoded = JWT::decode($jwt, new Key(SECRET_KEY, 'HS256'));
        
        return $decoded->data;
        
    } catch (\Firebase\JWT\ExpiredException $e) {
        http_response_code(401);
        echo json_encode(["status" => "erro", "mensagem" => "Token expirado.", "dados" => null]);
        exit;
    } catch (\Firebase\JWT\SignatureInvalidException $e) {
        http_response_code(401);
        echo json_encode(["status" => "erro", "mensagem" => "Token inválido.", "dados" => null]);
        exit;
    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode(["status" => "erro", "mensagem" => "Token inválido: " . $e->getMessage(), "dados" => null]);
        exit;
    }
}