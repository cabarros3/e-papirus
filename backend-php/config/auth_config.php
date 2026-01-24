<?php
require_once __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->safeLoad();

if (!defined('SECRET_KEY')) {
    // Busca a chave do .env ou usa um fallback (opcional)
    define('SECRET_KEY', $_ENV['JWT_SECRET'] ?? 'chave_padrao_local');
}

if (!defined('JWT_EXPIRATION')) {
    define('JWT_EXPIRATION', $_ENV['JWT_EXPIRATION'] ?? 3600); 
}
?>