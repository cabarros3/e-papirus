<?php

declare(strict_types=1);

namespace Tests\Api\Assuntos;

use PHPUnit\Framework\Attributes\DataProvider;
use Psr\Http\Message\ResponseInterface;
use Tests\Support\AssuntoHelpers;
use Tests\Support\TestCase;
use Tests\Support\LivroHelpers;

final class DeleteTest extends TestCase
{
    use AssuntoHelpers;
    use LivroHelpers;

    private const ROTA = '/api/assuntos/delete.php';

    // ---------- Exclusão com sucesso ----------

    public function testExclusaoValidaRemoveOAssunto(): void
    {
        $id = $this->garantirAssuntoCriado('Assunto Para Excluir');
        $this->garantirAssuntoCriado('Assunto Vizinho');

        $resposta = $this->excluirAssunto($id);
        $corpo = $this->corpo($resposta);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('sucesso', $corpo['status']);
        $this->assertSame('Assunto excluído com sucesso.', $corpo['mensagem']);

        $nomes = array_column($this->listarAssuntos(), 'nome_assunto');
        $this->assertNotContains('Assunto Para Excluir', $nomes);
        $this->assertContains('Assunto Vizinho', $nomes, 'Outros assuntos não deveriam ser removidos.');
    }

    public function testExclusaoPeloIdNaQueryStringFunciona(): void
    {
        $id = $this->garantirAssuntoCriado('Assunto Para Excluir');

        $resposta = $this->http->delete(self::ROTA, ['query' => ['id' => $id]]);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertNotContains('Assunto Para Excluir', array_column($this->listarAssuntos(), 'nome_assunto'));
    }

    // ---------- Assunto inexistente ----------

    public function testAssuntoInexistenteRetorna404(): void
    {
        $antes = $this->listarAssuntos();

        $resposta = $this->excluirAssunto(999999);
        $corpo = $this->corpo($resposta);

        $this->assertSame(404, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertNull($corpo['dados']);
        $this->assertEquals($antes, $this->listarAssuntos(), 'Nenhum assunto deveria ser removido.');
    }

    public function testExcluirDuasVezesORetornaMesmoAssuntoRetorna404NaSegunda(): void
    {
        $id = $this->garantirAssuntoCriado('Assunto Para Excluir');

        $primeira = $this->excluirAssunto($id);
        $segunda = $this->excluirAssunto($id);

        $this->assertSame(200, $primeira->getStatusCode(), (string) $primeira->getBody());
        $this->assertSame(404, $segunda->getStatusCode(), (string) $segunda->getBody());
    }

    // ---------- Validação e método ----------

    #[DataProvider('payloadsSemId')]
    public function testExclusaoSemIdRetorna400(array $payload): void
    {
        $resposta = $this->http->delete(self::ROTA, ['json' => $payload]);
        $corpo = $this->corpo($resposta);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertNull($corpo['dados']);
    }

    public static function payloadsSemId(): array
    {
        return [
            'corpo vazio' => [[]],
            'id nulo'     => [['id_assunto' => null]],
        ];
    }

    public function testExclusaoComMetodoPostRetorna405(): void
    {
        $resposta = $this->http->post(self::ROTA, ['json' => ['id_assunto' => 1]]);

        $this->assertSame(405, $resposta->getStatusCode(), (string) $resposta->getBody());
    }

    // ---------- Auxiliares ----------

    private function excluirAssunto(int $id): ResponseInterface
    {
        return $this->http->delete(self::ROTA, ['json' => ['id_assunto' => $id]]);
    }

    // ---------- Assunto com livros vinculados ----------

    public function testAssuntoComLivrosVinculadosRetorna409(): void
    {
        $idAssunto = $this->garantirAssuntoCriado('Assunto Com Livro');
        $this->criarLivro(['id_assunto' => $idAssunto]);
        $livrosAntes = $this->contarLivros();

        $resposta = $this->excluirAssunto($idAssunto);
        $corpo = $this->corpo($resposta);

        $this->assertSame(409, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertNull($corpo['dados']);
        $this->assertStringContainsString('livros vinculados', $corpo['mensagem']);

        $this->assertContains(
            'Assunto Com Livro',
            array_column($this->listarAssuntos(), 'nome_assunto'),
            'O assunto não deveria ter sido excluído.'
        );
        $this->assertSame($livrosAntes, $this->contarLivros(), 'O livro vinculado não deveria ser afetado.');
    }
}