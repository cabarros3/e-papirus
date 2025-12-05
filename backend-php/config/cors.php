<?php
// backend/config/cors.php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");

// AQUI ESTÁ O SEGREDO:
// Liberamos todos os verbos que sua API usa de uma vez só.
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

// Headers permitidos (útil quando o front envia JSON)
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Tratamento especial para o "Pre-flight" (OPTIONS)
// Se o navegador estiver apenas perguntando "posso?", a gente diz "sim" e encerra aqui.
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}
?>