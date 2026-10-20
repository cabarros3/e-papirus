<?php

declare(strict_types=1);

namespace Tests\Api\Livros;

use Psr\Http\Message\ResponseInterface;
use Tests\Support\AuthHelpers;
use Tests\Support\LivroHelpers;
use Tests\Support\TestCase;

/**
 * api/livros/index.php
 *
 * Paginacao nao e testada: o endpoint nao tem paginacao.
 * Filtros existentes: ?id= (um livro) e ?q= (busca em titulo, editora, ano e autor).
 * Nao ha delete na API, entao "lista vazia" e testada com uma busca sem resultado.
 */
final class IndexTest extends TestCase
{
    use AuthHelpers; // fornece corpo()
    use LivroHelpers;

    private const CAMPOS_DO_LIVRO = [
        'id_livro', 'titulo', 'capa', 'editora', 'ano_publicacao',
        'cidade_publicacao', 'nota_resumo', 'descricao_fisica',
        'nome_assunto', 'nomes_autores',
    ];

    private function consultar(array $query = []): ResponseInterface
    {
        return $this->http->get('/api/livros/index.php', ['query' => $query]);
    }

    /** @return int[] ids dos livros da lista devolvida pela API */
    private function idsDaLista(ResponseInterface $resposta): array
    {
        $dados = $this->corpo($resposta)['dados'];

        $this->assertIsArray($dados, 'A resposta deveria trazer uma lista: ' . (string) $resposta->getBody());

        return array_map('intval', array_column($dados, 'id_livro'));
    }

    // ---------- Listagem ----------

    public function testListagemRetorna200ComOsCamposDoLivro(): void
    {
        $resposta = $this->consultar();
        $corpo = $this->corpo($resposta);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('sucesso', $corpo['status']);
        $this->assertNotEmpty($corpo['dados'], 'O seed deveria trazer livros.');

        foreach (self::CAMPOS_DO_LIVRO as $campo) {
            $this->assertArrayHasKey($campo, $corpo['dados'][0]);
        }
    }

    public function testListagemIncluiLivroRecemCadastrado(): void
    {
        $antes = $this->contarLivros();

        $id = $this->criarLivro();

        $this->assertSame($antes + 1, $this->contarLivros());
        $this->assertContains($id, $this->idsDaLista($this->consultar()));
    }

    public function testListagemVemOrdenadaPorTituloCrescente(): void
    {
        // Criados fora de ordem de proposito.
        $idZ = $this->criarLivro(['titulo' => 'Zzzz Teste de Ordem']);
        $idA = $this->criarLivro(['titulo' => 'Aaaa Teste de Ordem']);

        $ids = $this->idsDaLista($this->consultar());

        $this->assertLessThan(
            array_search($idZ, $ids, true),
            array_search($idA, $ids, true),
            'O livro "Aaaa..." deveria vir antes do "Zzzz...".'
        );
    }

    // ---------- Consulta por id ----------

    public function testConsultaPorIdRetornaUmObjetoComOsCamposDoLivro(): void
    {
        $id = $this->criarLivro(['titulo' => 'Titulo de Consulta']);

        $resposta = $this->buscarLivro($id);
        $corpo = $this->corpo($resposta);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('sucesso', $corpo['status']);

        foreach (self::CAMPOS_DO_LIVRO as $campo) {
            $this->assertArrayHasKey($campo, $corpo['dados']);
        }

        $this->assertEquals($id, $corpo['dados']['id_livro']);
        $this->assertSame('Titulo de Consulta', $corpo['dados']['titulo']);
        $this->assertNotEmpty($corpo['dados']['nome_assunto']);
    }

    public function testConsultaPorIdInexistenteRetorna404(): void
    {
        $resposta = $this->consultar(['id' => 999999]);
        $corpo = $this->corpo($resposta);

        $this->assertSame(404, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertNull($corpo['dados']);
    }

    public function testIdTemPrioridadeSobreABusca(): void
    {
        $id = $this->criarLivro();

        $resposta = $this->consultar(['id' => $id, 'q' => 'termo-que-nao-existe-em-lugar-nenhum']);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertEquals($id, $this->corpo($resposta)['dados']['id_livro']);
    }

    // ---------- Busca (?q=) ----------

    public function testBuscaPorTituloEncontraOLivro(): void
    {
        $id = $this->criarLivro(['titulo' => 'Zzxq Titulo Unico']);

        $resposta = $this->consultar(['q' => 'Zzxq']);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame([$id], $this->idsDaLista($resposta));
    }

    public function testBuscaPorEditoraEncontraOLivro(): void
    {
        $id = $this->criarLivro(['editora' => 'Editora Zzxq Unica']);

        $resposta = $this->consultar(['q' => 'Zzxq']);

        $this->assertSame([$id], $this->idsDaLista($resposta));
    }

    public function testBuscaPorNomeDeAutorEncontraOLivro(): void
    {
        $id = $this->criarLivro(['autores' => [self::ID_AUTOR_SEED_DOIS]]);

        $resposta = $this->consultar(['q' => 'Silberschatz']);
        $dados = $this->corpo($resposta)['dados'];

        $this->assertContains($id, $this->idsDaLista($resposta));

        foreach ($dados as $livro) {
            $this->assertStringContainsString('Silberschatz', $livro['nomes_autores']);
        }
    }

    public function testBuscaSemResultadoRetorna200ComListaVazia(): void
    {
        $resposta = $this->consultar(['q' => 'termo-que-nao-existe-em-lugar-nenhum']);
        $corpo = $this->corpo($resposta);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('sucesso', $corpo['status']);
        $this->assertSame([], $corpo['dados']);
    }

    // ---------- Metodo HTTP errado ----------

    public function testMetodoPostRetorna405(): void
    {
        $resposta = $this->http->post('/api/livros/index.php');

        $this->assertSame(405, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $this->corpo($resposta)['status']);
    }
}
