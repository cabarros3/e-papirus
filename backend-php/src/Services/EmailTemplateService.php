<?php

namespace App\Services;

class EmailTemplateService
{
    public static function render($tipo, array $variaveis = []): array
    {
        $textos = EmailTexts::get($tipo);

        if (empty($textos)) {
            throw new \InvalidArgumentException("Tipo de notificação não encontrado: {$tipo}");
        }

        $bannerUrl = $_ENV['MAIL_BANNER_URL'] ?? 'https://raw.githubusercontent.com/cabarros3/e-papirus/notificacao/frontend/public/img/banner-email.jpeg';
        $logoUrl = $_ENV['MAIL_LOGO_URL'] ?? 'https://raw.githubusercontent.com/cabarros3/e-papirus/notificacao/frontend/public/img/logo.png';

        $baseImgUrl = 'https://raw.githubusercontent.com/cabarros3/e-papirus/notificacao/frontend/public/img/';
        $imagens = [
            'atraso'             => 'ep-atraso.png',
            'lembrete'           => 'ep-atraso.png',
            'reserva_expirada'   => 'ep-atraso.png',
            'devolucao'          => 'ep-sucesso.png',
            'boas_vindas'        => 'ep-sucesso.png',
            'emprestimo'         => 'ep-livro.png',
            'renovacao'          => 'ep-livro.png',
            'reserva_feita'      => 'ep-livro.png',
            'reserva_confirmada' => 'ep-livro.png',
            'reserva_disponivel' => 'ep-livro.png',
        ];

        $nomeImagem = $imagens[$tipo] ?? 'ep-livro.png';
        $imgEpUrl = $baseImgUrl . $nomeImagem;

        $cor = $textos['cor'] ?? '#00b4d8';

        $assunto    = self::substituir($textos['titulo'], $variaveis);
        $saudacao   = self::substituir($textos['saudacao'], $variaveis);
        $corpo      = self::substituir($textos['corpo'], $variaveis);
        $despedida  = self::substituir($textos['despedida'], $variaveis);

        // --- CARD DE DETALHES DO LIVRO ---
        $cardDetalhes = '';
        if (!empty($variaveis['livro'])) {
            $autor = $variaveis['autor'] ?? 'Autor não informado';
            $dataDevolucao = $variaveis['data'] ?? '--/--/----';

            $cardDetalhes = "
                <div style='margin-top: 20px;'>
                    <h3 style='font-size: 13px; font-weight: 800; color: #03045e; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;'>Detalhes do livro</h3>
                    <div style='background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px;'>
                        <div style='font-size: 14px; color: #334155; line-height: 1.8;'>
                            <div style='margin-bottom: 6px;'>
                                📘 <strong style='color: #0f172a;'>Título:</strong> {$variaveis['livro']}
                            </div>
                            <div style='margin-bottom: 6px;'>
                                ✍️ <strong style='color: #0077b6;'>Autor:</strong> {$autor}
                            </div>
                            <div>
                                📅 <strong style='color: {$cor};'>Devolução até:</strong> {$dataDevolucao}
                            </div>
                        </div>
                    </div>
                </div>
            ";
        }

        $html = "
        <!DOCTYPE html>
        <html lang='pt-BR'>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>{$assunto}</title>
            <style>
                /* FUNDO E CONTAINER */
                body { margin: 0; padding: 0; background: #f1f5f9; font-family: 'Segoe UI', Arial, Helvetica, sans-serif; color: #334155; }
                .container { max-width: 640px; margin: 30px auto; padding: 0 20px; }
                .card { background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08); border: 1px solid #e2e8f0; }

                /* CABEÇALHO */
                .header { position: relative; background-image: url('{$bannerUrl}'); background-size: cover; background-position: center; padding: 45px 20px; text-align: center; overflow: hidden; }
                .header::before { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0, 0, 0, 0.4) 100%); z-index: 1; }
                .header-content { position: relative; z-index: 2; }
                .header img { width: 110px; height: 110px; border-radius: 50%; background: #ffffff; padding: 8px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4); object-fit: cover; }
                .header h1 { color: #ffffff; font-size: 26px; margin: 15px 0 4px 0; font-weight: 800; text-shadow: 0 2px 6px rgba(0, 0, 0, 0.7); letter-spacing: 1px; }
                .header h2 { color: #ffffff; font-size: 13px; margin: 0; font-weight: 600; text-shadow: 0 1px 4px rgba(0, 0, 0, 0.7); text-transform: uppercase; letter-spacing: 2px; }

                /* CORPO DO E-MAIL */
                .body { padding: 35px; background: #ffffff; }
                .content-table { width: 100%; border-collapse: collapse; }

                /* TÍTULO EM BALÃO */
                .titulo { display: inline-block; background-color: {$cor}; color: #ffffff; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 8px 16px; border-radius: 20px; margin-bottom: 25px; }

                .content-text { width: 55%; vertical-align: top; padding-right: 15px; }
                .content-img { width: 45%; vertical-align: top; text-align: right; }
                .content-img img { width: 100%; height: auto; display: block; margin-left: auto; margin-top: 5px; }

                .saudacao { font-size: 16px; font-weight: bold; color: #03045e; margin-bottom: 12px; }
                .corpo { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 20px; }
                .corpo strong { color: #1e293b; }
                .despedida { font-size: 13px; color: #64748b; font-style: italic; margin-top: 25px; padding-top: 15px; border-top: 1px dashed #cbd5e1; }

                /* RODAPÉ */
                .footer { background: #f1f5f9; padding: 25px 20px; text-align: center; border-top: 1px solid #e2e8f0; }
                .footer-content { display: inline-flex; align-items: center; gap: 8px; color: #475569; font-size: 13px; margin-bottom: 8px; }
                .footer-content span { display: flex; align-items: center; }
                .footer .copyright { font-size: 12px; color: #475569; margin: 0; }

                /* RESPONSIVIDADE */
                @media only screen and (max-width: 600px) {
                    .container { padding: 10px; }
                    .body { padding: 20px; }
                    .content-text { display: block; width: 100%; padding-right: 0; padding-bottom: 20px; }
                    .content-img { display: block; width: 100%; text-align: center; }
                    .content-img img { margin: 0 auto; max-width: 200px; }
                    .header img { width: 90px; height: 90px; }
                    .header h1 { font-size: 22px; }
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
                        <div class='titulo'>{$assunto}</div>

                        <table class='content-table' cellpadding='0' cellspacing='0'>
                            <tr>
                                <td class='content-text'>
                                    <div class='saudacao'>{$saudacao}</div>
                                    <div class='corpo'>{$corpo}</div>

                                    <!-- CARD DE DETALHES -->
                                    {$cardDetalhes}

                                    <!-- DESPEDIDA MOVIDA PARA CÁ (ABAIXO DO CARD) -->
                                    <div class='despedida'>{$despedida}</div>
                                </td>
                                <td class='content-img'>
                                    <img src='{$imgEpUrl}' alt='Mascote E-P'>
                                </td>
                            </tr>
                        </table>
                    </div>
                    <div class='footer'>
                        <div class='footer-content'>
                            <span>📧</span>
                            <span>Este e-mail foi enviado automaticamente pelo sistema e-Papirus.</span>
                        </div>
                        <p class='copyright'>© 2026 e-Papirus - Todos os direitos reservados</p>
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

    private static function substituir($texto, array $variaveis): string
    {
        foreach ($variaveis as $chave => $valor) {
            $texto = str_replace('{' . $chave . '}', $valor, $texto);
        }
        return $texto;
    }
}
