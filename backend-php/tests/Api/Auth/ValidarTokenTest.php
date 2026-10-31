<?php

declare(strict_types=1);

namespace Tests\Api\Auth;

use Firebase\JWT\JWT;
use Psr\Http\Message\ResponseInterface;
use Tests\Support\AuthHelpers;
use Tests\Support\TestCase;
use Tests\Support\TokenHelpers;

/**
 * validar_token.php só define a função validarAcesso(), que não tem URL própria.
 * Ela é exercitada pelo endpoint protegido api/reservas/create.php, que a chama
 * logo no início, antes de ler o corpo da requisição.
 */
final class ValidarTokenTest extends TestCase
{
    use AuthHelpers;
    use TokenHelpers;

    private const ROTA_PROTEGIDA = '/api/reservas/create.php';
    // Deve ser igual ao JWT_SECRET definido em tests/subir-api-teste.sh
    // private const CHAVE_DE_TESTE = 'epapirus-chave-jwt-somente-para-testes-2026';

    // ---------- Acesso negado ----------

    public function testSemTokenRetorna401(): void
    {
        $resposta = $this->http->post(self::ROTA_PROTEGIDA);

        $corpo = $this->assertNegado($resposta);

        $this->assertSame('Token não fornecido.', $corpo['mensagem']);
    }

    public function testTokenSemPrefixoBearerRetorna401(): void
    {
        $resposta = $this->postComAuthorization('token-sem-prefixo');

        $corpo = $this->assertNegado($resposta);

        $this->assertSame('Formato de token inválido.', $corpo['mensagem']);
    }

    public function testTokenMalformadoRetorna401(): void
    {
        $resposta = $this->postComAuthorization('Bearer isto-nao-e-um-jwt');

        $corpo = $this->assertNegado($resposta);

        $this->assertStringStartsWith('Token inválido', $corpo['mensagem']);
    }

    public function testTokenAssinadoComOutraChaveRetorna401(): void
    {
        $token = JWT::encode(
            ['iss' => 'e-papirus', 'iat' => time(), 'exp' => time() + 3600, 'data' => ['id_usuario' => 1]],
            'chave-errada-com-mais-de-32-caracteres',
            'HS256'
        );

        $corpo = $this->assertNegado($this->postComAuthorization('Bearer ' . $token));

        $this->assertSame('Token inválido.', $corpo['mensagem']);
    }

    // ---------- Acesso permitido ----------

    public function testTokenValidoPassaPelaValidacao(): void
    {
        $dados = $this->cadastrarELogar();

        $resposta = $this->postComAuthorization('Bearer ' . $dados['token']);

        // O corpo da reserva está vazio, então o endpoint pode responder 400 ou outro erro;
        // o que importa aqui é que o token não seja barrado.
        $this->assertNotSame(401, $resposta->getStatusCode(), (string) $resposta->getBody());
    }

    // ---------- Expiração ----------

    public function testTokenExpiradoRetorna401(): void
    {
        $token = $this->gerarToken(['exp' => time() - 60]);

        $corpo = $this->assertNegado($this->postComAuthorization('Bearer ' . $token));

        $this->assertSame('Token expirado.', $corpo['mensagem']);
    }

    public function testTokenAssinadoComAChaveDeTesteEPassaPelaValidacao(): void
    {
        $token = $this->gerarToken(['exp' => time() + 3600]);

        $resposta = $this->postComAuthorization('Bearer ' . $token);

        $this->assertNotSame(401, $resposta->getStatusCode(), (string) $resposta->getBody());
    }

    // ---------- Auxiliares ----------

    private function postComAuthorization(string $valor): ResponseInterface
    {
        return $this->http->post(self::ROTA_PROTEGIDA, [
            'headers' => ['Authorization' => $valor],
        ]);
    }

        /** Gera um JWT assinado com a chave de teste da API; $sobrescrever troca campos do payload. */
    private function gerarToken(array $sobrescrever = []): string
    {
        $payload = array_merge([
            'iss'  => 'e-papirus',
            'iat'  => time() - 120,
            'exp'  => time() + 3600,
            'data' => [
                'id_usuario' => 1,
                'id_pessoa'  => 1,
                'tipo'       => 'aluno',
                'cargo'      => null,
                'nome'       => 'Usuario de Teste',
            ],
        ], $sobrescrever);

        return JWT::encode($payload, self::CHAVE_DE_TESTE, 'HS256');
    }

    /** Confere o envelope padrão de acesso negado e devolve o corpo para checar a mensagem. */
    private function assertNegado(ResponseInterface $resposta): array
    {
        $corpo = $this->corpo($resposta);

        $this->assertSame(401, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertNull($corpo['dados']);

        return $corpo;
    }
}
