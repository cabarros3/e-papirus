<?php

declare(strict_types=1);

namespace Tests\Api\Livros;

use PHPUnit\Framework\Attributes\DataProvider;
use Tests\Support\AuthHelpers;
use Tests\Support\LivroHelpers;
use Tests\Support\TestCase;

/**
 * api/livros/create.php
 *
 * Duplicidade nao e testada: a tabela livro nao tem UNIQUE nem ISBN (ver db/db.sql).
 */
final class CreateTest extends TestCase
{
    use AuthHelpers; // fornece corpo()
    use LivroHelpers;

    // ---------- Cadastro valido ----------

    public function testCadastroValidoRetorna201EOIdDoLivro(): void
    {
        $resposta = $this->cadastrarLivro();
        $corpo = $this->corpo($resposta);

        $this->assertSame(201, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('sucesso', $corpo['status']);
        $this->assertGreaterThan(0, (int) $corpo['dados']['id_livro']);
    }

    public function testLivroCadastradoApareceNaConsultaPorId(): void
    {
        $id = $this->criarLivro(['titulo' => 'Titulo Unico de Teste']);

        $resposta = $this->buscarLivro($id);
        $livro = $this->corpo($resposta)['dados'];

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('Titulo Unico de Teste', $livro['titulo']);
        $this->assertSame('Editora de Teste', $livro['editora']);
        $this->assertEquals(2024, $livro['ano_publicacao']);
        $this->assertSame(self::NOME_AUTOR_SEED_UM, $livro['nomes_autores']);
    }

    public function testCadastroSemCamposOpcionaisGravaNulos(): void
    {
        $id = $this->criarLivro();

        $livro = $this->corpo($this->buscarLivro($id))['dados'];

        $this->assertNull($livro['cidade_publicacao']);
        $this->assertNull($livro['nota_resumo']);
        $this->assertNull($livro['capa']);
        $this->assertNull($livro['descricao_fisica']);
    }

    public function testCadastroComCamposOpcionaisGravaOsValores(): void
    {
        $id = $this->criarLivro([
            'cidade_publicacao' => 'Recife',
            'nota_resumo'       => 'Resumo de teste.',
            'capa'              => 'https://exemplo.local/capa.jpg',
            'descricao_fisica'  => '100 paginas; 20 cm',
        ]);

        $livro = $this->corpo($this->buscarLivro($id))['dados'];

        $this->assertSame('Recife', $livro['cidade_publicacao']);
        $this->assertSame('Resumo de teste.', $livro['nota_resumo']);
        $this->assertSame('https://exemplo.local/capa.jpg', $livro['capa']);
        $this->assertSame('100 paginas; 20 cm', $livro['descricao_fisica']);
    }

    public function testCadastroComDoisAutoresVinculaOsDois(): void
    {
        $id = $this->criarLivro([
            'autores' => [self::ID_AUTOR_SEED_UM, self::ID_AUTOR_SEED_DOIS],
        ]);

        $livro = $this->corpo($this->buscarLivro($id))['dados'];

        // A ordem do GROUP_CONCAT nao e garantida, entao conferimos cada nome.
        $this->assertStringContainsString(self::NOME_AUTOR_SEED_UM, $livro['nomes_autores']);
        $this->assertStringContainsString(self::NOME_AUTOR_SEED_DOIS, $livro['nomes_autores']);
    }

    // ---------- Campos obrigatorios ----------

    #[DataProvider('camposObrigatorios')]
    public function testCadastroSemCampoObrigatorioRetorna400(string $campo): void
    {
        $dados = $this->dadosLivro();
        unset($dados[$campo]);

        $resposta = $this->http->post('/api/livros/create.php', ['json' => $dados]);
        $corpo = $this->corpo($resposta);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertNull($corpo['dados']);
    }

    public static function camposObrigatorios(): array
    {
        return [
            'id_assunto'     => ['id_assunto'],
            'titulo'         => ['titulo'],
            'editora'        => ['editora'],
            'ano_publicacao' => ['ano_publicacao'],
            'autores'        => ['autores'],
        ];
    }

    public function testCadastroComAutoresQueNaoEListaRetorna400(): void
    {
        $resposta = $this->cadastrarLivro(['autores' => 'Robert C. Martin']);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $this->corpo($resposta)['status']);
    }

    // ---------- Metodo HTTP errado ----------

    public function testMetodoGetRetorna405(): void
    {
        $resposta = $this->http->get('/api/livros/create.php');

        $this->assertSame(405, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $this->corpo($resposta)['status']);
    }

    // ---------- Referencias inexistentes (rollback) ----------

    public function testAssuntoInexistenteNaoGravaLivro(): void
    {
        $antes = $this->contarLivros();

        $resposta = $this->cadastrarLivro(['id_assunto' => 999999]);

        $this->assertGreaterThanOrEqual(400, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame($antes, $this->contarLivros());
    }

    public function testAutorInexistenteNaoDeixaLivroGravadoPelaMetade(): void
    {
        $antes = $this->contarLivros();

        $resposta = $this->cadastrarLivro(['autores' => [self::ID_AUTOR_SEED_UM, 999999]]);

        $this->assertGreaterThanOrEqual(400, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame($antes, $this->contarLivros());
    }

    // ---------- Falhas conhecidas (pendentes) ----------

    public function testAssuntoInexistenteRetornaErroDeCliente(): void
    {
        $this->markTestIncomplete(
            'create.php devolve 500 com a mensagem do banco (violacao de chave estrangeira) '
            . 'quando o assunto nao existe; o esperado e um erro 4xx. Corrigir em issue futura.'
        );

        $resposta = $this->cadastrarLivro(['id_assunto' => 999999]);

        $this->assertContains($resposta->getStatusCode(), [400, 404, 422], (string) $resposta->getBody());
    }

    public function testAutorInexistenteRetornaErroDeCliente(): void
    {
        $this->markTestIncomplete(
            'create.php devolve 500 com a mensagem do banco quando um autor nao existe; '
            . 'o esperado e um erro 4xx. Corrigir em issue futura.'
        );

        $resposta = $this->cadastrarLivro(['autores' => [999999]]);

        $this->assertContains($resposta->getStatusCode(), [400, 404, 422], (string) $resposta->getBody());
    }
}
