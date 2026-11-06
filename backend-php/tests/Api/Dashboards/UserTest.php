<?php

declare(strict_types=1);

namespace Tests\Api\Dashboards;

use PHPUnit\Framework\Attributes\DataProvider;
use Tests\Support\AssuntoHelpers;
use Tests\Support\AutorHelpers;
use Tests\Support\DashboardHelpers;
use Tests\Support\ExemplarHelpers;
use Tests\Support\LivroHelpers;
use Tests\Support\TestCase;

final class UserTest extends TestCase
{
    use AssuntoHelpers;
    use AutorHelpers;
    use DashboardHelpers;
    use ExemplarHelpers;
    use LivroHelpers;

    private const ROTA = '/api/dashboards/user.php';

    // ---------- Métricas ----------

    #[DataProvider('metricasPorPessoa')]
    public function testMetricasDeCadaPessoa(int $n, int $ativos, int $atrasados, int $historico): void
    {
        $pessoas = $this->montarCenarioDeCirculacao()['pessoas'];

        $dados = $this->dadosDoDashboardUsuario($pessoas[$n]);

        $this->assertEquals($ativos, $dados['ativos']);
        $this->assertEquals($atrasados, $dados['atrasados']);
        $this->assertEquals($historico, $dados['historico_lidos']);
    }

    public static function metricasPorPessoa(): array
    {
        return [
            'pessoa 1 (1 atrasado e 1 no prazo)'    => [1, 2, 1, 0],
            'pessoa 2 (vence hoje e 1 devolvido)'   => [2, 1, 0, 1],
            'pessoa 3 (só empréstimos devolvidos)'  => [3, 0, 0, 2],
        ];
    }

    // ---------- Livros atuais (meus_livros) ----------

    public function testLivrosEmAbertoVemOrdenadosPeloVencimentoComStatusVisual(): void
    {
        $pessoas = $this->montarCenarioDeCirculacao()['pessoas'];

        $livros = $this->dadosDoDashboardUsuario($pessoas[1])['meus_livros'];

        $this->assertCount(2, $livros);
        $this->assertSame(['Livro A', 'Livro B'], array_column($livros, 'titulo'));
        $this->assertSame([$this->dataRelativa(-3), $this->dataRelativa(5)], array_column($livros, 'data_prevista'));
        $this->assertSame(['Atrasado!', 'Vence em 5 dias'], array_column($livros, 'status_texto'));
        $this->assertSame(['red', 'blue'], array_column($livros, 'cor'));
        $this->assertSame($this->dataRelativa(-10), $livros[0]['data_emprestimo']);
        $this->assertSame($this->capaDoLivro('Livro A'), $livros[0]['capa']);
        $this->assertArrayHasKey('id_emprestimo', $livros[0]);
    }

    public function testLivroQueVenceHojeTemStatusLaranja(): void
    {
        $pessoas = $this->montarCenarioDeCirculacao()['pessoas'];

        $livros = $this->dadosDoDashboardUsuario($pessoas[2])['meus_livros'];

        $this->assertCount(1, $livros);
        $this->assertSame('Livro B', $livros[0]['titulo']);
        $this->assertSame('Vence Hoje!', $livros[0]['status_texto']);
        $this->assertSame('orange', $livros[0]['cor']);
    }

    public function testSoComEmprestimosDevolvidosAListaFicaVazia(): void
    {
        $pessoas = $this->montarCenarioDeCirculacao()['pessoas'];

        $this->assertSame([], $this->dadosDoDashboardUsuario($pessoas[3])['meus_livros']);
    }

    public function testPessoaInexistenteRetornaDashboardZerado(): void
    {
        // Comportamento atual: não há 404 para pessoa inexistente; a resposta é um dashboard zerado.
        $dados = $this->dadosDoDashboardUsuario(999999);

        $this->assertEquals(0, $dados['ativos']);
        $this->assertEquals(0, $dados['atrasados']);
        $this->assertEquals(0, $dados['historico_lidos']);
        $this->assertSame([], $dados['meus_livros']);
    }

    // ---------- Banco vazio ----------

    public function testBancoVazioRetornaDashboardZerado(): void
    {
        $this->esvaziarBanco();

        $dados = $this->dadosDoDashboardUsuario(1);

        $this->assertEquals(0, $dados['ativos']);
        $this->assertEquals(0, $dados['atrasados']);
        $this->assertEquals(0, $dados['historico_lidos']);
        $this->assertSame([], $dados['meus_livros']);
    }


    // ---------- Validação e método ----------

    #[DataProvider('queriesSemId')]
    public function testSemIdDaPessoaRetorna400(array $query): void
    {
        $resposta = $this->buscarDashboardUsuario($query);
        $corpo = $this->corpo($resposta);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertNull($corpo['dados']);
    }

    public static function queriesSemId(): array
    {
        return [
            'sem id'    => [[]],
            'id vazio'  => [['id_pessoa' => '']],
            'id zero'   => [['id_pessoa' => '0']],
        ];
    }

    public function testMetodoPostRetorna405(): void
    {
        $resposta = $this->http->post(self::ROTA, ['query' => ['id_pessoa' => 1]]);

        $this->assertSame(405, $resposta->getStatusCode(), (string) $resposta->getBody());
    }

    // ---------- Proteção por token (PENDENTE) ----------
    // O user.php não valida o JWT e aceita qualquer id_pessoa: qualquer pessoa, logada ou não, vê os
    // empréstimos de qualquer outra. O esperado é 401 sem token (e restringir o usuário comum ao próprio id).
    // Quando for corrigido, apague a linha do markTestIncomplete.

    public function testSemTokenRetorna401(): void
    {
        $this->markTestIncomplete('Pendente: user.php ainda não valida o JWT e responde 200 sem token.');

        $resposta = $this->buscarDashboardUsuario(['id_pessoa' => 1]);

        $this->assertSame(401, $resposta->getStatusCode(), (string) $resposta->getBody());
    }
}