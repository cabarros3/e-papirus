<?php

declare(strict_types=1);

namespace Tests\Api\Email;

use Tests\Support\TestCase;
use Tests\Support\AuthHelpers;

/**
 * api/email/teste_email.php
 *
 * Testa o endpoint de envio de e-mail de teste.
 *
 * Nota: o envio com sucesso não é testável neste ambiente porque o PHPMailer
 * exige TLS e autenticação (o SMTP falso ainda não implementa). Apenas as
 * validações e a falha no envio são verificadas.
 */
final class TesteEmailTest extends TestCase
{
    use AuthHelpers;

    private const ROTA = '/api/email/teste_email.php';

    // ---------- Validação de método ----------

    public function testMetodoGetRetorna405(): void
    {
        $resposta = $this->http->get(self::ROTA);
        $corpo = $this->corpo($resposta);

        $this->assertSame(405, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertStringContainsString('POST', $corpo['mensagem']);
    }

    // ---------- Validação de dados ----------

    public function testEmailAusenteRetorna400(): void
    {
        $resposta = $this->http->post(self::ROTA, ['json' => (object) []]);
        $corpo = $this->corpo($resposta);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertStringContainsString('email', strtolower($corpo['mensagem']));
    }

    public function testEmailVazioRetorna400(): void
    {
        $resposta = $this->http->post(self::ROTA, ['json' => ['email' => '']]);
        $corpo = $this->corpo($resposta);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
    }

    // ---------- Falha no envio (esperado no ambiente de teste) ----------

    public function testFalhaNoEnvioRetorna500(): void
    {
        // O SMTP de teste aponta para 127.0.0.1:1025 (inexistente ou sem TLS),
        // então o envio sempre falha e o endpoint retorna 500.
        $resposta = $this->http->post(self::ROTA, [
            'json' => ['email' => 'destinatario@epapirus.local']
        ]);
        $corpo = $this->corpo($resposta);

        $this->assertSame(500, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertStringContainsString('Falha', $corpo['mensagem']);
    }

    // ---------- Envio com sucesso (pendência) ----------

    public function testEnvioComSucessoRetorna200(): void
    {
        $this->markTestIncomplete(
            'O envio com sucesso não é testável neste ambiente porque o PHPMailer exige TLS e autenticação. O SMTP falso precisa ser implementado (ver Issue 12).'
        );
    }
}
