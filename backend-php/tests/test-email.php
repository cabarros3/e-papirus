<?php
// Carrega Composer (pra PHPMailer)
require_once __DIR__ . '/../vendor/autoload.php';

// Carrega config (pra constantes MAIL_*)
require_once __DIR__ . '/../config.php';

// Carrega EmailService DIRETO
require_once __DIR__ . '/../services/EmailService.php';

// Instancia com o namespace
$email = new App\Services\EmailService();

try {
    // Tenta enviar um e-mail de teste
    $resultado = $email->enviar(
        'teste@exemplo.com',              // destinatário
        'Teste E-Papirus',                // assunto
        'Teste de envio do E-Papirus!'    // corpo
    );
    
    // Exibe o resultado
    if ($resultado) {
        echo "E-mail enviado com sucesso!\n";
        echo "Verifique no painel do Ethereal: https://ethereal.email/messages\n";
    } else {
        echo "Falha ao enviar e-mail.\n";
    }
    
} catch (Exception $e) {
    echo "Erro: " . $e->getMessage() . "\n";
}
?>