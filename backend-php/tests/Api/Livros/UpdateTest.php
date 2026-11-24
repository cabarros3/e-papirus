<?php

declare(strict_types=1);

namespace Tests\Api\Livros;

use PHPUnit\Framework\Attributes\DataProvider;
use Psr\Http\Message\ResponseInterface;
use Tests\Support\AuthHelpers;
use Tests\Support\LivroHelpers;
use Tests\Support\TestCase;

/**
 * api/livros/update.php
 *
 * Atualizacao parcial nao e suportada: o endpoint exige id_livro e todos os campos obrigatorios.
 */
final class UpdateTest extends TestCase
{
    use AuthHelpers; // fornece corpo()
    use LivroHelpers;

    /** PUT com os dados validos do livro, trocando ou acrescentando campos. */
    private function atualizarLivro(int $id, array $sobrescrever = []): ResponseInterface
    {
        return $this->http->put('/api/livros/update.php', [
            'json' => array_merge($this->dadosLivro(), ['id_livro' => $id], $sobrescrever),
        ]);
    }

    private function dadosDoLivro(int $id): array
    {
        return $this->corpo($this->buscarLivro($id))['dados'];
    }

    // ---------- Atualizacao valida ----------

    public function testAtualizacaoValidaRetorna200ETrocaOsCampos(): void
    {
        $id = $this->criarLivro(['titulo' => 'Titulo Antigo', 'editora' => 'Editora Antiga']);
        $antes = $this->dadosDoLivro($id);

        $resposta = $this->atualizarLivro($id, [
            'id_assunto'        => 2,
            'titulo'            => 'Titulo Novo',
            'editora'           => 'Editora Nova',
            'ano_publicacao'    => 1999,
            'cidade_publicacao' => 'Recife',
            'nota_resumo'       => 'Resumo novo.',
        ]);
        $corpo = $this->corpo($resposta);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('sucesso', $corpo['status']);
        $this->assertNull($corpo['dados']);

        $depois = $this->dadosDoLivro($id);
        $this->assertSame('Titulo Novo', $depois['titulo']);
        $this->assertSame('Editora Nova', $depois['editora']);
        $this->assertEquals(1999, $depois['ano_publicacao']);
        $this->assertSame('Recife', $depois['cidade_publicacao']);
        $this->assertSame('Resumo novo.', $depois['nota_resumo']);
        $this->assertNotSame($antes['nome_assunto'], $depois['nome_assunto']);
    }

    public function testAtualizacaoNaoAfetaOutrosLivros(): void
    {
        $idAlterado = $this->criarLivro(['titulo' => 'Livro Alterado']);
        $idIntacto = $this->criarLivro(['titulo' => 'Livro Intacto']);

        $this->atualizarLivro($idAlterado, ['titulo' => 'Livro Alterado Novo']);

        $this->assertSame('Livro Intacto', $this->dadosDoLivro($idIntacto)['titulo']);
    }

    public function testAtualizacaoSubstituiAListaDeAutores(): void
    {
        $id = $this->criarLivro(['autores' => [self::ID_AUTOR_SEED_UM]]);

        $resposta = $this->atualizarLivro($id, ['autores' => [self::ID_AUTOR_SEED_DOIS]]);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame(self::NOME_AUTOR_SEED_DOIS, $this->dadosDoLivro($id)['nomes_autores']);
    }

    public function testAtualizacaoComListaDeAutoresVaziaRemoveOsAutores(): void
    {
        $id = $this->criarLivro();

        $resposta = $this->atualizarLivro($id, ['autores' => []]);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertNull($this->dadosDoLivro($id)['nomes_autores']);
    }

    public function testCamposOpcionaisOmitidosSaoApagados(): void
    {
        // Comportamento atual: o UPDATE grava os 8 campos, entao o que nao vier vira NULL.
        $id = $this->criarLivro(['cidade_publicacao' => 'Recife', 'nota_resumo' => 'Resumo antigo.']);

        $this->atualizarLivro($id); // dadosLivro() nao traz cidade_publicacao nem nota_resumo

        $livro = $this->dadosDoLivro($id);
        $this->assertNull($livro['cidade_publicacao']);
        $this->assertNull($livro['nota_resumo']);
    }

    // ---------- Campos obrigatorios (sem atualizacao parcial) ----------

    #[DataProvider('camposObrigatorios')]
    public function testAtualizacaoSemCampoObrigatorioRetorna400(string $campo): void
    {
        $id = $this->criarLivro();
        $dados = array_merge($this->dadosLivro(), ['id_livro' => $id]);
        unset($dados[$campo]);

        $resposta = $this->http->put('/api/livros/update.php', ['json' => $dados]);
        $corpo = $this->corpo($resposta);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertNull($corpo['dados']);
    }

    public static function camposObrigatorios(): array
    {
        return [
            'id_livro'       => ['id_livro'],
            'id_assunto'     => ['id_assunto'],
            'titulo'         => ['titulo'],
            'editora'        => ['editora'],
            'ano_publicacao' => ['ano_publicacao'],
            'autores'        => ['autores'],
        ];
    }

    public function testAtualizacaoParcialSoComOTituloRetorna400(): void
    {
        $id = $this->criarLivro(['titulo' => 'Titulo Original']);

        $resposta = $this->http->put('/api/livros/update.php', [
            'json' => ['id_livro' => $id, 'titulo' => 'Titulo Parcial'],
        ]);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('Titulo Original', $this->dadosDoLivro($id)['titulo']);
    }

    // ---------- Metodo HTTP errado ----------

    public function testMetodoGetRetorna405(): void
    {
        $resposta = $this->http->get('/api/livros/update.php');

        $this->assertSame(405, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $this->corpo($resposta)['status']);
    }

    // ---------- Referencias inexistentes (rollback) ----------

    public function testAssuntoInexistenteNaoAlteraOLivro(): void
    {
        $id = $this->criarLivro(['titulo' => 'Titulo Original']);

        $resposta = $this->atualizarLivro($id, ['titulo' => 'Titulo Novo', 'id_assunto' => 999999]);

        $this->assertGreaterThanOrEqual(400, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('Titulo Original', $this->dadosDoLivro($id)['titulo']);
    }

    public function testAutorInexistenteDesfazAAtualizacaoInteira(): void
    {
        $id = $this->criarLivro(['titulo' => 'Titulo Original', 'autores' => [self::ID_AUTOR_SEED_UM]]);

        $resposta = $this->atualizarLivro($id, ['titulo' => 'Titulo Novo', 'autores' => [999999]]);

        $this->assertGreaterThanOrEqual(400, $resposta->getStatusCode(), (string) $resposta->getBody());

        $livro = $this->dadosDoLivro($id);
        $this->assertSame('Titulo Original', $livro['titulo']);
        $this->assertSame(self::NOME_AUTOR_SEED_UM, $livro['nomes_autores']);
    }

    // ---------- Falhas conhecidas (pendentes) ----------

    public function testLivroInexistenteComAutoresRetorna404(): void
    {
        $this->markTestIncomplete(
            'update.php nao verifica se o livro existe: com autores na requisicao a chave estrangeira '
            . 'falha e a API devolve 500. O esperado e 404. Corrigir em issue futura.'
        );

        $resposta = $this->atualizarLivro(999999);

        $this->assertSame(404, $resposta->getStatusCode(), (string) $resposta->getBody());
    }

    public function testLivroInexistenteSemAutoresRetorna404(): void
    {
        $this->markTestIncomplete(
            'update.php devolve 200 "Livro atualizado com sucesso!" para um id inexistente quando '
            . 'autores e uma lista vazia. O esperado e 404. Corrigir em issue futura.'
        );

        $resposta = $this->atualizarLivro(999999, ['autores' => []]);

        $this->assertSame(404, $resposta->getStatusCode(), (string) $resposta->getBody());
    }
}
