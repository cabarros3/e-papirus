<?php

declare(strict_types=1);

namespace Tests\Api\Auth;

use Tests\Support\AuthHelpers;
use Tests\Support\TestCase;

final class LoginTest extends TestCase
{
    use AuthHelpers;

    // ---------- Login com credenciais válidas ----------

    public function testLoginComCredenciaisValidasRetornaToken(): void
    {
        $this->garantirUsuarioCadastrado();
        $usuario = $this->dadosUsuario();

        $resposta = $this->login($usuario['email'], $usuario['senha']);
        $corpo = $this->corpo($resposta);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('sucesso', $corpo['status']);

        $token = $corpo['dados']['token'] ?? null;
        $this->assertIsString($token, 'A resposta deveria conter o token.');
        $this->assertMatchesRegularExpression('/^[\w-]+\.[\w-]+\.[\w-]+$/', $token);
    }

    public function testTokenDoLoginTemOsDadosDoUsuario(): void
    {
        $dados = $this->cadastrarELogar();

        $partes = explode('.', $dados['token']);
        $payload = json_decode(base64_decode(strtr($partes[1], '-_', '+/')), true);

        $this->assertSame('e-papirus', $payload['iss']);
        $this->assertGreaterThan(time(), $payload['exp']);
        $this->assertSame('Usuario de Teste', $payload['data']['nome']);
        $this->assertSame('aluno', $payload['data']['tipo']);
    }

    public function testLoginRetornaOsDadosDoUsuarioSemOHashDaSenha(): void
    {
        $dados = $this->cadastrarELogar();

        $this->assertSame('Usuario de Teste', $dados['usuario']['nome']);
        $this->assertArrayNotHasKey('senha', $dados['usuario']);
    }
}
