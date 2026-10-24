<?php

namespace App\Services;

/**
 * Serviço de template padronizado dos e-mails do e-Papirus
 *
 * Todas as notificações passam por aqui, garantindo a identidade
 * visual única (cores do E-P, cabeçalho com mascote, rodapé institucional).
 */
class EmailTemplateService
{
    /**
     * Monta o HTML completo do e-mail
     *
     * @param string $tipo Tipo da notificação (emprestimo, devolucao, etc.)
     * @param array $variaveis Variáveis para substituir nos textos
     * @return array ['assunto' => string, 'html' => string]
     */
    public static function render($tipo, array $variaveis = []): array
    {
        $textos = EmailTexts::get($tipo);

        if (empty($textos)) {
            throw new \InvalidArgumentException("Tipo de notificação não encontrado: {$tipo}");
        }

        // URLs das imagens (vêm do .env ou usam fallback local)
        $logoUrl = $_ENV['MAIL_LOGO_URL'] ?? 'http://localhost:3000/img/logo.png';
        $bannerUrl = $_ENV['MAIL_BANNER_URL'] ?? 'https://raw.githubusercontent.com/cabarros3/e-papirus/notificacao/frontend/public/img/banner-email.jpeg';

        $cor = $textos['cor'] ?? '#00b4d8';

        // Substituir variáveis nos textos
        $assunto    = self::substituir($textos['titulo'], $variaveis);
        $saudacao   = self::substituir($textos['saudacao'], $variaveis);
        $corpo      = self::substituir($textos['corpo'], $variaveis);
        $despedida  = self::substituir($textos['despedida'], $variaveis);

        $html = "
        <!DOCTYPE html>
        <html lang='pt-BR'>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>{$assunto}</title>
            <style>
                body { margin: 0; padding: 0; background: #f4f6f9; font-family: Arial, Helvetica, sans-serif; color: #2b2d42; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .card { background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); }

                /* CABEÇALHO COM BANNER E OVERLAY */
                .header { position: relative; background-image: url('{$bannerUrl}'); background-size: cover; background-position: center; padding: 40px 20px; text-align: center; overflow: hidden; }
                .header::before { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(3, 4, 94, 0.65) 0%, rgba(0, 119, 182, 0.75) 100%); z-index: 1; }
                .header-content { position: relative; z-index: 2; }
                .header img { width: 110px; height: 110px; border-radius: 50%; background: #ffffff; padding: 8px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4), 0 0 0 3px rgba(0, 180, 216, 0.6); }
                .header h1 { color: #ffffff; font-size: 24px; margin: 15px 0 4px 0; font-weight: bold; text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6); letter-spacing: 0.5px; }
                .header h2 { color: #caf0f8; font-size: 13px; margin: 0; font-weight: normal; text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6); text-transform: uppercase; letter-spacing: 1.5px; }

                /* CORPO DO E-MAIL */
                .body { padding: 30px; }
                .saudacao { font-size: 18px; font-weight: bold; color: #03045e; margin-bottom: 15px; }
                .titulo { font-size: 20px; font-weight: bold; color: {$cor}; margin: 0 0 20px 0; border-left: 4px solid {$cor}; padding-left: 12px; }
                .corpo { font-size: 15px; line-height: 1.6; color: #2b2d42; margin-bottom: 25px; }
                .corpo strong { color: #03045e; }
                .despedida { font-size: 14px; color: #6c757d; font-style: italic; margin-top: 20px; padding-top: 20px; border-top: 1px dashed #dee2e6; }

                /* RODAPÉ */
                .footer { background: #f4f6f9; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; }
                .footer p { margin: 4px 0; }

                /* RESPONSIVIDADE PARA CELULAR */
                @media only screen and (max-width: 600px) {
                    .container { padding: 10px; }
                    .body { padding: 20px; }
                    .header img { width: 90px; height: 90px; }
                    .header h1 { font-size: 20px; }
                    .header h2 { font-size: 11px; }
                }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='card'>
                    <div class='header'>
                        <div class='header-content'>
                            <img src='{$logoUrl}' alt='E-P - Mascote do e-Papirus'>
                            <h1>e-Papirus</h1>
                            <h2>Sua biblioteca digital</h2>
                        </div>
                    </div>
                    <div class='body'>
                        <div class='saudacao'>{$saudacao}</div>
                        <div class='titulo'>{$assunto}</div>
                        <div class='corpo'>{$corpo}</div>
                        <div class='despedida'>{$despedida}</div>
                    </div>
                    <div class='footer'>
                        <p>📧 Este e-mail foi enviado automaticamente pelo sistema e-Papirus.</p>
                        <p>© 2026 e-Papirus - Todos os direitos reservados</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        ";

        return [
            'assunto' => $assunto,
            'html'    => $html,
        ];
    }

    /**
     * Substitui {variaveis} no texto
     */
    private static function substituir($texto, array $variaveis): string
    {
        foreach ($variaveis as $chave => $valor) {
            $texto = str_replace('{' . $chave . '}', $valor, $texto);
        }
        return $texto;
    }
}
