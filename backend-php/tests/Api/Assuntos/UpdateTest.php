<?php
declare(strict_types=1);

namespace Tests\Api\Assuntos;

use PHPUnit\Framework\Attributes\DataProvider;
use Psr\Http\Message\ResponseInterface;
use Tests\Support\AssuntoHelpers;
use Tests\Support\TestCase;

final class UpdateTest extends TestCase
{
    use AssuntoHelpers;

    private const ROTA = '/api/assuntos/update.php';

    // ---------- Atualização com sucesso ----------

    public function testAtualizacaoValidaAlteraONomeDoAssunto(): void
    {
        $id = $this->garantirAssuntoCriado('Assunto Original');
        $this->garantirAssuntoCriado('Assunto Vizinho');

        $resposta = $this->atualizarAssunto($id, 'Assunto Atualizado');
        $corpo = $this->corpo($resposta);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('sucesso', $corpo['status']);
        $this->assertSame('Assunto atualizado com sucesso!', $corpo['mensagem']);

        $nomes = array_column($this->listarAssuntos(), 'nome_assunto');
        $this->assertContains('Assunto Atualizado', $nomes);
        $this->assertNotContains('Assunto Original', $nomes);
        $this->assertContains('Assunto Vizinho', $nomes, 'Outros assuntos não deveriam ser alterados.');
    }

    public function testAtualizarComONomeIgualNaoAlteraNada(): void
    {
        $id = $this->garantirAssuntoCriado('Assunto Igual');

        $resposta = $this->atualizarAssunto($id, 'Assunto Igual');
        $corpo = $this->corpo($resposta);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('sucesso', $corpo['status']);
        $this->assertStringContainsString('Nenhuma alteração', $corpo['mensagem']);
    }

    // ---------- Assunto inexistente ----------

    public function testAssuntoInexistenteNaoAlteraNada(): void
    {
        $antes = $this->listarAssuntos();

        $resposta = $this->atualizarAssunto(999999, 'Assunto Fantasma');
        $corpo = $this->corpo($resposta);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertStringContainsString('Nenhuma alteração', $corpo['mensagem']);
        $this->assertEquals($antes, $this->listarAssuntos(), 'O update de um id inexistente não deve criar nem alterar assuntos.');
    }

    // PENDENTE: o update.php responde 200 "sucesso" para id inexistente, igual ao caso de nome igual.
    // O correto seria 404. Quando for corrigido, apague a linha do markTestIncomplete
    // (e ajuste ou remova o teste acima, que documenta o comportamento atual).
    public function testAssuntoInexistenteRetorna404(): void
    {
        $this->markTestIncomplete('Pendente: update.php responde 200 "sucesso" para id inexistente (não distingue de "nome igual").');

        $resposta = $this->atualizarAssunto(999999, 'Assunto Fantasma');
        $corpo = $this->corpo($resposta);

        $this->assertSame(404, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
    }

    // ---------- Validação e método ----------

    #[DataProvider('payloadsIncompletos')]
    public function testAtualizacaoComDadosIncompletosRetorna400(array $payload): void
    {
        $resposta = $this->http->put(self::ROTA, ['json' => $payload]);
        $corpo = $this->corpo($resposta);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertNull($corpo['dados']);
    }

    public static function payloadsIncompletos(): array
    {
        return [
            'sem id'      => [['nome_assunto' => 'Assunto de Teste']],
            'sem nome'    => [['id_assunto' => 1]],
            'id nulo'     => [['id_assunto' => null, 'nome_assunto' => 'Assunto de Teste']],
            'nome nulo'   => [['id_assunto' => 1, 'nome_assunto' => null]],
            'corpo vazio' => [[]],
        ];
    }

    public function testAtualizacaoComMetodoPostRetorna405(): void
    {
        $resposta = $this->http->post(self::ROTA, [
            'json' => ['id_assunto' => 1, 'nome_assunto' => 'Assunto de Teste'],
        ]);

        $this->assertSame(405, $resposta->getStatusCode(), (string) $resposta->getBody());
    }

    // ---------- Auxiliares ----------

    private function atualizarAssunto(int $id, string $nome): ResponseInterface
    {
        return $this->http->put(self::ROTA, [
            'json' => ['id_assunto' => $id, 'nome_assunto' => $nome],
        ]);
    }
}