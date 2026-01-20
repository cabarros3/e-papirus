<?php

namespace App\Services;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class EmailService
{
    /**
     * A instância do PHPMailer aqui:
     * @var PHPMailer
     */
    private PHPMailer $mail;

    /**
     * Construtor: inicializa PHPMailer e configura SMTP
     */
    public function __construct()
    {
        // Cria nova instância do PHPMailer
        $this->mail = new PHPMailer(true);

        // Define o tipo de transporte: SMTP
        $this->mail->isSMTP();

        // Define o host SMTP (vem da constante em config.php)
        $this->mail->Host = \MAIL_HOST;

        // Define a porta (geralmente 587 para SMTP)
        $this->mail->Port = \MAIL_PORT;

        // Habilita autenticação
        $this->mail->SMTPAuth = true;

        // Define credenciais (vêm de config.php, que lê do .env)
        $this->mail->Username = \MAIL_USER;
        $this->mail->Password = \MAIL_PASS;

        // Habilita encriptação TLS
        $this->mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;

        // Define charset para UTF-8 (suporta acentuação)
        $this->mail->CharSet = 'UTF-8';
    }

    /**
     * Método público para enviar e-mail
     * 
     * @param string $destinatario Email do destinatário
     * @param string $assunto Assunto do e-mail
     * @param string $corpo Corpo do e-mail (HTML)
     * @return bool True se enviado com sucesso, False caso contrário
     */
    public function enviar($destinatario, $assunto, $corpo)
    {
        try {
            // Limpa destinatários anteriores (reutilização de instância)
            $this->mail->clearAddresses();

            // Define o remetente
            $this->mail->setFrom(\MAIL_USER, 'E-Papirus Biblioteca');

            // Adiciona o destinatário
            $this->mail->addAddress($destinatario);

            // Define assunto e corpo
            $this->mail->Subject = $assunto;
            $this->mail->Body = $corpo;
            $this->mail->isHTML(true);

            // Envia o e-mail
            $this->mail->send();

            return true;

        } catch (Exception $e) {
            // Se algo der errado, registra o erro
            error_log("Erro ao enviar e-mail: " . $this->mail->ErrorInfo);
            return false;
        }
    }
}
?>