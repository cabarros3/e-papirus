<?php
// backend/config/utils.php

function enviarResposta($status, $mensagem, $dados = null, $httpCode = 200) {
    // Define o código HTTP (200, 201, 404, 500, etc.)
    http_response_code($httpCode);

    // Monta o array padrão (o envelope)
    $resposta = [
        "status" => $status,      // "sucesso" ou "erro"
        "message" => $mensagem,  // Texto explicativo
        "data" => $dados         // O que veio do banco (ou null se for só msg)
    ];

    // Transforma em JSON e imprime
    echo json_encode($resposta);
    
    // Mata a execução do script aqui para garantir que nada mais seja enviado
    exit;
}
?>