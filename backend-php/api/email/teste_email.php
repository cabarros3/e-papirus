<?php

// Carrega dependencias (padrão do projeto)
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/utils.php';
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../../config/auth_config.php';

use App\Services\EmailService;

// Validar POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    enviarResposta("erro", "Método inválido. Use POST.", null, 405);
}

// Capturar o e-mail do corpo da requisição
$data = json_decode(file_get_contents("php://input"));

// Valida se o e-mail foi enviado
if (!isset($data->email) || empty($data->email)) {
    enviarResposta("erro", "Informe um email para teste.", null, 400);
}

try {
    // Instancia o EmailService
    $emailService = new EmailService();
    
    // Define dados do e-mail de teste
    $assunto = "Teste de E-mail — e-Papirus";
    $corpo = "<h1>Teste de E-mail</h1><p>Se você recebeu isso, a API conseguiu enviar e-mail corretamente!</p>";
    
    // Tenta enviar
    $sucesso = $emailService->enviar($data->email, $assunto, $corpo);
    
    // Retorna resposta apropriada
    if ($sucesso) {
        enviarResposta("sucesso", "E-mail de teste enviado com sucesso!", ["email" => $data->email], 200);
    } else {
        enviarResposta("erro", "Falha ao enviar e-mail.", null, 500);
    }
    
} catch (Exception $e) {
    enviarResposta("erro", "Erro no processamento: " . $e->getMessage(), null, 500);
}
?>