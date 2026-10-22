<?php

declare(strict_types=1);

namespace Tests\Api\Assuntos;

use PHPUnit\Framework\Attributes\DataProvider;
use Psr\Http\Message\ResponseInterface;
use Tests\Support\TestCase;

final class CreateTest extends TestCase
{
    // A pasta do módulo é "assuntos" (o endpoints.txt cita "assunto", no singular).
    private const ROTA = '/api/assuntos/create.php';

    // ---------- Cadastro com sucesso ----------

    public function testCadastroValidoRetorna201EOIdDoAssunto(): void
    {
        $resposta = $this->criarAssunto('Assunto de Teste');
        $corpo = $this->corpo($resposta);

        $this->assertSame(201, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('sucesso', $corpo['status']);
        $this->assertGreaterThan(0, (int) $corpo['dados']['id']);
    }

    public function testAssuntosDistintosRecebemIdsDiferentes(): void
    {
        $primeiro = $this->criarAssunto('Assunto de Teste A');
        $segundo = $this->criarAssunto('Assunto de Teste B');

        $this->assertSame(201, $primeiro->getStatusCode(), (string) $primeiro->getBody());
        $this->assertSame(201, $segundo->getStatusCode(), (string) $segundo->getBody());
        $this->assertNotEquals(
            $this->corpo($primeiro)['dados']['id'],
            $this->corpo($segundo)['dados']['id']
        );
    }

    // ---------- Duplicidade (PENDENTE) ----------
    // O create.php não trata duplicidade (não há resposta 409 como no register.php).
    // Se o banco tiver UNIQUE em nome_assunto, o erro cai no catch e a API responde 500;
    // se não tiver, o assunto duplicado é gravado e a API responde 201.
    // Quando for corrigido, apague a linha do markTestIncomplete.

    public function testAssuntoDuplicadoRetorna409(): void
    {
        $this->markTestIncomplete('Pendente: create.php não trata duplicidade (hoje responde 500 ou aceita o duplicado, conforme o schema).');

        $primeiro = $this->criarAssunto('Assunto Duplicado');
        $this->assertSame(201, $primeiro->getStatusCode(), (string) $primeiro->getBody());

        $segundo = $this->criarAssunto('Assunto Duplicado');
        $corpo = $this->corpo($segundo);

        $this->assertSame(409, $segundo->getStatusCode(), (string) $segundo->getBody());
        $this->assertSame('erro', $corpo['status']);
    }

    // ---------- Validação e método ----------

    #[DataProvider('payloadsSemNome')]
    public function testCadastroSemNomeRetorna400(array $payload): void
    {
        $resposta = $this->http->post(self::ROTA, ['json' => $payload]);
        $corpo = $this->corpo($resposta);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertNull($corpo['dados']);
    }

    public static function payloadsSemNome(): array
    {
        return [
            'corpo vazio' => [[]],
            'nome nulo'   => [['nome_assunto' => null]],
        ];
    }

    public function testCadastroComMetodoGetRetorna405(): void
    {
        $resposta = $this->http->get(self::ROTA);

        $this->assertSame(405, $resposta->getStatusCode(), (string) $resposta->getBody());
    }

    // ---------- Auxiliares ----------

    private function criarAssunto(string $nome): ResponseInterface
    {
        return $this->http->post(self::ROTA, ['json' => ['nome_assunto' => $nome]]);
    }
}
