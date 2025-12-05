<?php
// 1. IMPORTANTE: Puxa o arquivo com as senhas
// O __DIR__ garante que o PHP ache o caminho correto saindo da pasta 'db' e voltando para 'backend'
require_once __DIR__ . '/../config.php';

try {
    // 2. Cria a conexão usando as CONSTANTES (DB_HOST, DB_USER...) que definimos no config.php
    // Note que não usamos mais $variavel, e sim o nome da constante direto
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS);
    
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
} catch (PDOException $e) {
    // Dica de Ouro: Como estamos numa API, não dê apenas 'echo'.
    // Se der erro no banco, retornamos um JSON de erro e paramos tudo.
    header("Content-Type: application/json");
    http_response_code(500);
    echo json_encode(["status" => "erro", "mensagem" => "Erro ao conectar no banco: " . $e->getMessage()]);
    exit;
}
?>