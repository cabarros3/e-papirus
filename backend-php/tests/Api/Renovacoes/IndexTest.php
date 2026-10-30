<?php

declare(strict_types=1);

namespace Tests\Api\Renovacoes;

use Psr\Http\Message\ResponseInterface;
use Tests\Support\AuthHelpers;
use Tests\Support\EmprestimoHelpers;
use Tests\Support\ExemplarHelpers;
use Tests\Support\LivroHelpers;
use Tests\Support\PessoaHelpers;
use Tests\Support\RenovacaoHelpers;
use Tests\Support\TestCase;

/**
 * api/renovacoes/index.php
 *
 * Historico de renovacoes, com filtro opcional ?id_emprestimo=, do mais recente para o mais antigo
 * (por data_renovacao). Sem resultado: 200 com lista vazia.
 * O seed nao tem emprestimos nem renovacoes, entao o banco de teste comeca com o historico vazio.
 */
final class IndexTest extends TestCase
{
    use AuthHelpers; // fornece corpo()
    use PessoaHelpers;
    use LivroHelpers;
    use ExemplarHelpers;
    use EmprestimoHelpers;
    use RenovacaoHelpers;

    private const CAMPOS_DA_RENOVACAO = [
        'id_renovacao', 'data_renovacao', 'nova_data_devolucao', 'titulo', 'nome_leitor',
    ];

    /** @return int[] ids das renovacoes, na ordem em que a API devolveu */
    private function idsDaLista(ResponseInterface $resposta): array
    {
        $dados = $this->corpo($resposta)['dados'];

        $this->assertIsArray($dados, 'A resposta deveria trazer uma lista: ' . (string) $resposta->getBody());

        return array_map('intval', array_column($dados, 'id_renovacao'));
    }

    /** Cria um emprestimo para uma pessoa de numero $numero (para ter mais de um por teste). */
    private function emprestimoDaPessoa(int $numero): int
    {
        $idPessoa = $this->criarPessoa($this->dadosOutraPessoa($numero));
        $idExemplar = $this->criarExemplarDisponivel();

        $resposta = $this->emprestarExemplar($idExemplar, $idPessoa);
        $this->assertSame(201, $resposta->getStatusCode(), (string) $resposta->getBody());

        return (int) $this->corpo($resposta)['dados']['id_emprestimo'];
    }

    // ---------- Historico ----------

    public function testSemRenovacoesRetorna200ComListaVazia(): void
    {
        $resposta = $this->listarRenovacoes();
        $corpo = $this->corpo($resposta);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('sucesso', $corpo['status']);
        $this->assertSame([], $corpo['dados']);
    }

    public function testRenovacaoAparecePeloIdDoEmprestimoComOsCamposEsperados(): void
    {
        $emprestimo = $this->criarEmprestimo(['data_prevista' => $this->dataEmDias(5)]);
        $this->renovarEmprestimo($emprestimo['id_emprestimo']);

        $resposta = $this->listarRenovacoes(['id_emprestimo' => $emprestimo['id_emprestimo']]);
        $dados = $this->corpo($resposta)['dados'];

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertCount(1, $dados);

        foreach (self::CAMPOS_DA_RENOVACAO as $campo) {
            $this->assertArrayHasKey($campo, $dados[0]);
        }

        $this->assertSame($this->dataEmDias(0), $dados[0]['data_renovacao']);
        $this->assertSame($this->dataEmDias(12), $dados[0]['nova_data_devolucao']);
        $this->assertSame('Livro de Teste', $dados[0]['titulo']);
        $this->assertSame($this->dadosPessoa()['nome'], $dados[0]['nome_leitor']);
    }

    public function testVariasRenovacoesDoMesmoEmprestimoAparecemTodas(): void
    {
        $emprestimo = $this->criarEmprestimo();
        $this->renovarEmprestimo($emprestimo['id_emprestimo']);
        $this->renovarEmprestimo($emprestimo['id_emprestimo']);

        $ids = $this->idsDaLista($this->listarRenovacoes(['id_emprestimo' => $emprestimo['id_emprestimo']]));

        $this->assertCount(2, $ids);
    }

    // ---------- Filtro por emprestimo ----------

    public function testFiltroPorEmprestimoTrazSoAsRenovacoesDele(): void
    {
        $primeiro = $this->emprestimoDaPessoa(1);
        $segundo = $this->emprestimoDaPessoa(2);
        $this->renovarEmprestimo($primeiro);
        $this->renovarEmprestimo($segundo);

        $resposta = $this->listarRenovacoes(['id_emprestimo' => $primeiro]);
        $dados = $this->corpo($resposta)['dados'];

        $this->assertCount(1, $dados);
        $this->assertSame($this->dadosOutraPessoa(1)['nome'], $dados[0]['nome_leitor']);
    }

    public function testSemFiltroTrazAsRenovacoesDeTodosOsEmprestimos(): void
    {
        $primeiro = $this->emprestimoDaPessoa(1);
        $segundo = $this->emprestimoDaPessoa(2);
        $this->renovarEmprestimo($primeiro);
        $this->renovarEmprestimo($segundo);

        $ids = $this->idsDaLista($this->listarRenovacoes());

        $this->assertCount(2, $ids);
    }

    public function testEmprestimoInexistenteRetorna200ComListaVazia(): void
    {
        $this->criarEmprestimo();

        $resposta = $this->listarRenovacoes(['id_emprestimo' => 999999]);
        $corpo = $this->corpo($resposta);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('sucesso', $corpo['status']);
        $this->assertSame([], $corpo['dados']);
    }

    // ---------- Ordem ----------

    public function testHistoricoVemDoMaisRecenteParaOMaisAntigo(): void
    {
        $emprestimo = $this->criarEmprestimo();

        // Datas diferentes, inseridas direto no banco de teste (pela API todas seriam de hoje).
        $meio = $this->inserirRenovacao($emprestimo['id_emprestimo'], $this->dataEmDias(-3), $this->dataEmDias(4));
        $antiga = $this->inserirRenovacao($emprestimo['id_emprestimo'], $this->dataEmDias(-5), $this->dataEmDias(2));
        $recente = $this->inserirRenovacao($emprestimo['id_emprestimo'], $this->dataEmDias(-1), $this->dataEmDias(6));

        $ids = $this->idsDaLista($this->listarRenovacoes(['id_emprestimo' => $emprestimo['id_emprestimo']]));

        $this->assertSame([$recente, $meio, $antiga], $ids);
    }

    // ---------- Metodo HTTP errado ----------

    public function testMetodoPostRetorna405(): void
    {
        $resposta = $this->http->post('/api/renovacoes/index.php');

        $this->assertSame(405, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $this->corpo($resposta)['status']);
    }
}
