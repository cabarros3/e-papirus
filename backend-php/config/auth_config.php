<?php
// backend-php/config/auth_config.php

// Definindo o nome como SECRET_KEY para bater com o arquivo de login
if (!defined('SECRET_KEY')) {
    define('SECRET_KEY', 'ge_papirus_sistema_biblioteca_chave_secreta_super_segura_2026_@#!');
}

// Configuração de expiração (24 horas)
if (!defined('JWT_EXPIRATION')) {
    define('JWT_EXPIRATION', 60 * 60 * 24); 
}
?>