<?php

declare(strict_types=1);

namespace Tests\Api\Auth;

use Tests\Support\AuthHelpers;
use Tests\Support\TestCase;
use PHPUnit\Framework\Attributes\DataProvider;

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

    
    // ---------- Login com credenciais inválidas ----------

    public function testLoginComSenhaIncorretaRetorna401(): void
    {
        $this->garantirUsuarioCadastrado();

        $resposta = $this->login($this->dadosUsuario()['email'], 'senha-errada');
        $corpo = $this->corpo($resposta);

        $this->assertSame(401, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertNull($corpo['dados']);
    }

    public function testLoginComUsuarioInexistenteRetorna401(): void
    {
        $resposta = $this->login('naoexiste@epapirus.local', 'qualquer-senha');
        $corpo = $this->corpo($resposta);

        $this->assertSame(401, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertNull($corpo['dados']);
    }

    public function testMensagemDeErroNaoRevelaSeOEmailExiste(): void
    {
        $this->garantirUsuarioCadastrado();

        $senhaErrada = $this->corpo($this->login($this->dadosUsuario()['email'], 'senha-errada'));
        $inexistente = $this->corpo($this->login('naoexiste@epapirus.local', 'senha-errada'));

        $this->assertSame($senhaErrada['mensagem'], $inexistente['mensagem']);
    }

    #[DataProvider('payloadsIncompletos')]
    public function testLoginComCamposFaltandoRetorna400(array $payload): void
    {
        $resposta = $this->http->post('/api/auth/login.php', ['json' => $payload]);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $this->corpo($resposta)['status']);
    }

    public static function payloadsIncompletos(): array
    {
        return [
            'sem senha'   => [['email' => 'teste@epapirus.local']],
            'sem email'   => [['senha' => 'senha-de-teste-123']],
            'corpo vazio' => [[]],
        ];
    }

    public function testLoginComMetodoGetRetorna405(): void
    {
        $resposta = $this->http->get('/api/auth/login.php');

        $this->assertSame(405, $resposta->getStatusCode(), (string) $resposta->getBody());
    }
}
