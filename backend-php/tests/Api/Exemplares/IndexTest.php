<?php

declare(strict_types=1);

namespace Tests\Api\Exemplares;

use PHPUnit\Framework\Attributes\DataProvider;
use Tests\Support\ExemplarHelpers;
use Tests\Support\LivroHelpers;
use Tests\Support\TestCase;

final class IndexTest extends TestCase
{
    use ExemplarHelpers;
    use LivroHelpers;

    private const ROTA = '/api/exemplares/index.php';

    // ---------- Listagem sem filtro ----------

    public function testListagemSemFiltroRetornaLivrosComSeusExemplares(): void
    {
        $idLivro = $this->criarLivro(['titulo' => 'Livro de Teste']);
        $this->criarExemplar($idLivro);

        $resposta = $this->buscarExemplares();
        $corpo = $this->corpo($resposta);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('sucesso', $corpo['status']);
        $this->assertIsArray($corpo['dados']);

        $livro = $this->acharLivro($corpo['dados'], $idLivro);
        $this->assertNotNull($livro, 'O livro criado deveria aparecer na listagem.');
        $this->assertSame('Livro de Teste', $livro['titulo']);
        $this->assertCount(1, $livro['exemplares']);
    }

    public function testLivroSemExemplaresApareceComListaVazia(): void
    {
        $idLivro = $this->criarLivro();

        $livro = $this->acharLivro($this->listarLivros(), $idLivro);

        $this->assertNotNull($livro, 'Livro sem exemplares também deveria aparecer na listagem.');
        $this->assertSame([], $livro['exemplares']);
    }

    public function testLivrosVemOrdenadosPeloTitulo(): void
    {
        // Criados fora de ordem; títulos só com letras ASCII para não depender da collation do MySQL.
        $idZ = $this->criarLivro(['titulo' => 'ZZ Livro de Teste']);
        $idA = $this->criarLivro(['titulo' => 'AA Livro de Teste']);

        $ids = array_map('intval', array_column($this->listarLivros(), 'id_livro'));

        $this->assertContains($idA, $ids);
        $this->assertContains($idZ, $ids);
        $this->assertLessThan(array_search($idZ, $ids, true), array_search($idA, $ids, true));
    }

    // ---------- Listagem por livro ----------

    public function testFiltroPorLivroRetornaSoOsExemplaresDele(): void
    {
        $livroA = $this->criarLivro(['titulo' => 'Livro de Teste A']);
        $livroB = $this->criarLivro(['titulo' => 'Livro de Teste B']);
        $this->criarExemplar($livroA);
        $this->criarExemplar($livroA);
        $this->criarExemplar($livroB);

        $livros = $this->listarLivros(['id_livro' => $livroA]);

        $this->assertCount(1, $livros);
        $this->assertEquals($livroA, $livros[0]['id_livro']);
        $this->assertSame('Livro de Teste A', $livros[0]['titulo']);
        $this->assertCount(2, $livros[0]['exemplares']);
    }

    public function testExemplaresVemOrdenadosPeloNumero(): void
    {
        $idLivro = $this->criarLivro();
        $this->criarExemplar($idLivro);
        $this->criarExemplar($idLivro);
        $this->criarExemplar($idLivro);

        $numeros = array_map('intval', array_column($this->exemplaresDoLivro($idLivro), 'numero_exemplar'));

        $this->assertSame([1, 2, 3], $numeros);
    }

    public function testCadaExemplarTemOsCamposEsperados(): void
    {
        $idLivro = $this->criarLivro();
        $criado = $this->criarExemplar($idLivro, ['localizacao' => 'Estante Z9']);

        $exemplar = $this->exemplaresDoLivro($idLivro)[0];

        $this->assertEquals($criado['id_exemplar'], $exemplar['id_exemplar']);
        $this->assertEquals($criado['numero_exemplar'], $exemplar['numero_exemplar']);
        $this->assertSame('Estante Z9', $exemplar['localizacao']);
        $this->assertArrayHasKey('disponibilidade', $exemplar);
    }

    public function testFiltroPeloIdDoExemplarRetornaSoEsseExemplar(): void
    {
        $idLivro = $this->criarLivro();
        $this->criarExemplar($idLivro);
        $segundo = $this->criarExemplar($idLivro);

        $livros = $this->listarLivros(['id' => $segundo['id_exemplar']]);

        $this->assertCount(1, $livros);
        $this->assertCount(1, $livros[0]['exemplares']);
        $this->assertEquals($segundo['id_exemplar'], $livros[0]['exemplares'][0]['id_exemplar']);
    }

    // ---------- Status de disponibilidade ----------

    public function testExemplarSemStatusInformadoFicaDisponivel(): void
    {
        $idLivro = $this->criarLivro();
        $this->criarExemplar($idLivro);

        $exemplar = $this->exemplaresDoLivro($idLivro)[0];

        $this->assertSame('disponivel', $exemplar['disponibilidade']);
    }

    #[DataProvider('statusValidos')]
    public function testListagemMostraOStatusDoExemplar(string $status): void
    {
        $idLivro = $this->criarLivro();
        $this->criarExemplar($idLivro, ['disponibilidade' => $status]);

        $exemplar = $this->exemplaresDoLivro($idLivro)[0];

        $this->assertSame($status, $exemplar['disponibilidade']);
    }

    public static function statusValidos(): array
    {
        return [
            'disponivel' => ['disponivel'],
            'emprestado' => ['emprestado'],
            'reservado'  => ['reservado'],
        ];
    }

    public function testExemplaresDoMesmoLivroPodemTerStatusDiferentes(): void
    {
        $idLivro = $this->criarLivro();
        $this->criarExemplar($idLivro, ['disponibilidade' => 'disponivel']);
        $this->criarExemplar($idLivro, ['disponibilidade' => 'emprestado']);
        $this->criarExemplar($idLivro, ['disponibilidade' => 'reservado']);

        $status = array_column($this->exemplaresDoLivro($idLivro), 'disponibilidade');

        $this->assertSame(['disponivel', 'emprestado', 'reservado'], $status);
    }

    // ---------- Nada encontrado ----------

    public function testLivroInexistenteRetorna404(): void
    {
        $this->assertNaoEncontrado($this->buscarExemplares(['id_livro' => 999999]));
    }

    public function testExemplarInexistenteRetorna404(): void
    {
        $this->assertNaoEncontrado($this->buscarExemplares(['id' => 999999]));
    }

    public function testExemplarDeOutroLivroNaoCombinaComOFiltroDeLivro(): void
    {
        $livroA = $this->criarLivro(['titulo' => 'Livro de Teste A']);
        $livroB = $this->criarLivro(['titulo' => 'Livro de Teste B']);
        $exemplarDoB = $this->criarExemplar($livroB);

        $resposta = $this->buscarExemplares(['id_livro' => $livroA, 'id' => $exemplarDoB['id_exemplar']]);

        $this->assertNaoEncontrado($resposta);
    }

    // ---------- Método ----------

    public function testListagemComMetodoPostRetorna405(): void
    {
        $resposta = $this->http->post(self::ROTA);

        $this->assertSame(405, $resposta->getStatusCode(), (string) $resposta->getBody());
    }

    // ---------- Auxiliares ----------

    /** Chama a listagem, confere o 200 e devolve a lista de livros. */
    private function listarLivros(array $query = []): array
    {
        $resposta = $this->buscarExemplares($query);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());

        return $this->corpo($resposta)['dados'];
    }

    private function acharLivro(array $livros, int $idLivro): ?array
    {
        foreach ($livros as $livro) {
            if ((int) $livro['id_livro'] === $idLivro) {
                return $livro;
            }
        }

        return null;
    }

    private function assertNaoEncontrado(\Psr\Http\Message\ResponseInterface $resposta): void
    {
        $corpo = $this->corpo($resposta);

        $this->assertSame(404, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertNull($corpo['dados']);
    }
}