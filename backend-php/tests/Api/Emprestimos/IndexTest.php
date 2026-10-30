<?php

declare(strict_types=1);

namespace Tests\Api\Emprestimos;

use Psr\Http\Message\ResponseInterface;
use Tests\Support\AuthHelpers;
use Tests\Support\EmprestimoHelpers;
use Tests\Support\ExemplarHelpers;
use Tests\Support\LivroHelpers;
use Tests\Support\PessoaHelpers;
use Tests\Support\TestCase;

/**
 * api/emprestimos/index.php
 *
 * Filtros: status (todos, pendente, devolvido, atrasado, em_dia), id_pessoa e id_exemplar.
 * Um status desconhecido se comporta como "todos". Sem resultado: 200 com lista vazia.
 * Ordem: sem devolucao primeiro (por data de emprestimo, do mais novo ao mais antigo), depois os devolvidos.
 * Cada registro traz "situacao" (Finalizado, Atrasado ou Em dia) e "cor".
 * O seed nao tem emprestimos, entao o banco de teste comeca com a tabela vazia.
 */
final class IndexTest extends TestCase
{
    use AuthHelpers; // fornece corpo()
    use PessoaHelpers;
    use LivroHelpers;
    use ExemplarHelpers;
    use EmprestimoHelpers;

    private const CAMPOS_DO_EMPRESTIMO = [
        'id_emprestimo', 'data_emprestimo', 'data_prevista', 'data_devolucao',
        'titulo', 'id_livro', 'id_exemplar', 'nome_pessoa', 'tipo_pessoa', 'email_pessoa',
        'situacao', 'cor',
    ];

    /** @return int[] ids dos emprestimos, na ordem em que a API devolveu */
    private function idsDaLista(ResponseInterface $resposta): array
    {
        $dados = $this->corpo($resposta)['dados'];

        $this->assertIsArray($dados, 'A resposta deveria trazer uma lista: ' . (string) $resposta->getBody());

        return array_map('intval', array_column($dados, 'id_emprestimo'));
    }

    /**
     * Monta tres emprestimos de pessoas diferentes: um em dia, um atrasado (inserido direto no
     * banco de teste) e um devolvido. Cada item: ['id_emprestimo', 'id_exemplar', 'id_pessoa'].
     */
    private function montarEmprestimosDeTodosOsTipos(): array
    {
        // Em dia (via API, prazo de 7 dias).
        $idPessoaEmDia = $this->criarPessoa($this->dadosOutraPessoa(1));
        $idExemplarEmDia = $this->criarExemplarDisponivel();
        $respostaEmDia = $this->emprestarExemplar($idExemplarEmDia, $idPessoaEmDia);
        $this->assertSame(201, $respostaEmDia->getStatusCode(), (string) $respostaEmDia->getBody());

        // Atrasado (inserido direto no banco de teste).
        $idPessoaAtrasado = $this->criarPessoa($this->dadosOutraPessoa(2));
        $idExemplarAtrasado = $this->criarExemplarDisponivel();
        $idEmprestimoAtrasado = $this->inserirEmprestimo(
            $idExemplarAtrasado,
            $idPessoaAtrasado,
            $this->dataEmDias(-10),
            $this->dataEmDias(-3)
        );

        // Devolvido (via API).
        $idPessoaDevolvido = $this->criarPessoa($this->dadosOutraPessoa(3));
        $idExemplarDevolvido = $this->criarExemplarDisponivel();
        $respostaDevolvido = $this->emprestarExemplar($idExemplarDevolvido, $idPessoaDevolvido);
        $this->assertSame(201, $respostaDevolvido->getStatusCode(), (string) $respostaDevolvido->getBody());
        $idEmprestimoDevolvido = (int) $this->corpo($respostaDevolvido)['dados']['id_emprestimo'];
        $devolucao = $this->devolverEmprestimo($idEmprestimoDevolvido);
        $this->assertSame(200, $devolucao->getStatusCode(), (string) $devolucao->getBody());

        return [
            'em_dia' => [
                'id_emprestimo' => (int) $this->corpo($respostaEmDia)['dados']['id_emprestimo'],
                'id_exemplar'   => $idExemplarEmDia,
                'id_pessoa'     => $idPessoaEmDia,
            ],
            'atrasado' => [
                'id_emprestimo' => $idEmprestimoAtrasado,
                'id_exemplar'   => $idExemplarAtrasado,
                'id_pessoa'     => $idPessoaAtrasado,
            ],
            'devolvido' => [
                'id_emprestimo' => $idEmprestimoDevolvido,
                'id_exemplar'   => $idExemplarDevolvido,
                'id_pessoa'     => $idPessoaDevolvido,
            ],
        ];
    }

    // ---------- Listagem ----------

    public function testListagemSemEmprestimosRetorna200ComListaVazia(): void
    {
        $resposta = $this->listarEmprestimos();
        $corpo = $this->corpo($resposta);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('sucesso', $corpo['status']);
        $this->assertSame([], $corpo['dados']);
        $this->assertSame('Nenhum registro encontrado para este filtro.', $corpo['mensagem']);
    }

    public function testListagemTrazOsCamposDoEmprestimoEDoLeitor(): void
    {
        $emprestimo = $this->criarEmprestimo();

        $resposta = $this->listarEmprestimos();
        $dados = $this->corpo($resposta)['dados'];

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertCount(1, $dados);

        foreach (self::CAMPOS_DO_EMPRESTIMO as $campo) {
            $this->assertArrayHasKey($campo, $dados[0]);
        }

        $this->assertEquals($emprestimo['id_emprestimo'], $dados[0]['id_emprestimo']);
        $this->assertEquals($emprestimo['id_exemplar'], $dados[0]['id_exemplar']);
        $this->assertSame($this->dadosPessoa()['nome'], $dados[0]['nome_pessoa']);
        $this->assertSame('aluno', $dados[0]['tipo_pessoa']);
        $this->assertSame('Livro de Teste', $dados[0]['titulo']);
        $this->assertNull($dados[0]['data_devolucao']);
        $this->assertArrayNotHasKey('senha', $dados[0]);
    }

    public function testListagemSemFiltroTrazTodosNaOrdemEsperada(): void
    {
        $tipos = $this->montarEmprestimosDeTodosOsTipos();

        $resposta = $this->listarEmprestimos();
        $corpo = $this->corpo($resposta);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('3 registros encontrados.', $corpo['mensagem']);

        // Sem devolucao primeiro (do emprestimo mais novo ao mais antigo), devolvidos no fim.
        $this->assertSame(
            [
                $tipos['em_dia']['id_emprestimo'],
                $tipos['atrasado']['id_emprestimo'],
                $tipos['devolvido']['id_emprestimo'],
            ],
            $this->idsDaLista($resposta)
        );
    }

    // ---------- Situacao de cada registro ----------

    public function testEmprestimoEmDiaTemSituacaoEmDiaECorAzul(): void
    {
        $this->criarEmprestimo();

        $registro = $this->corpo($this->listarEmprestimos())['dados'][0];

        $this->assertSame('Em dia', $registro['situacao']);
        $this->assertSame('blue', $registro['cor']);
    }

    public function testEmprestimoAtrasadoTemSituacaoAtrasadoECorVermelha(): void
    {
        $this->criarEmprestimoAtrasado();

        $registro = $this->corpo($this->listarEmprestimos())['dados'][0];

        $this->assertSame('Atrasado', $registro['situacao']);
        $this->assertSame('red', $registro['cor']);
    }

    public function testEmprestimoDevolvidoTemSituacaoFinalizadoECorVerde(): void
    {
        $emprestimo = $this->criarEmprestimo();
        $this->devolverEmprestimo($emprestimo['id_emprestimo']);

        $registro = $this->corpo($this->listarEmprestimos())['dados'][0];

        $this->assertSame('Finalizado', $registro['situacao']);
        $this->assertSame('green', $registro['cor']);
        $this->assertSame($this->dataEmDias(0), $registro['data_devolucao']);
    }

    // ---------- Filtro por status ----------

    public function testFiltroPendenteTrazOsNaoDevolvidos(): void
    {
        $tipos = $this->montarEmprestimosDeTodosOsTipos();

        $ids = $this->idsDaLista($this->listarEmprestimos(['status' => 'pendente']));

        $this->assertEqualsCanonicalizing(
            [$tipos['em_dia']['id_emprestimo'], $tipos['atrasado']['id_emprestimo']],
            $ids
        );
    }

    public function testFiltroDevolvidoTrazSoOsDevolvidos(): void
    {
        $tipos = $this->montarEmprestimosDeTodosOsTipos();

        $ids = $this->idsDaLista($this->listarEmprestimos(['status' => 'devolvido']));

        $this->assertSame([$tipos['devolvido']['id_emprestimo']], $ids);
    }

    public function testFiltroAtrasadoTrazSoOsAtrasadosNaoDevolvidos(): void
    {
        $tipos = $this->montarEmprestimosDeTodosOsTipos();

        $ids = $this->idsDaLista($this->listarEmprestimos(['status' => 'atrasado']));

        $this->assertSame([$tipos['atrasado']['id_emprestimo']], $ids);
    }

    public function testFiltroEmDiaTrazSoOsNaoDevolvidosDentroDoPrazo(): void
    {
        $tipos = $this->montarEmprestimosDeTodosOsTipos();

        $ids = $this->idsDaLista($this->listarEmprestimos(['status' => 'em_dia']));

        $this->assertSame([$tipos['em_dia']['id_emprestimo']], $ids);
    }

    public function testEmprestimoComPrazoVencendoHojeContaComoEmDiaENaoComoAtrasado(): void
    {
        $emprestimo = $this->criarEmprestimo(['data_prevista' => $this->dataEmDias(0)]);

        $emDia = $this->idsDaLista($this->listarEmprestimos(['status' => 'em_dia']));
        $atrasados = $this->idsDaLista($this->listarEmprestimos(['status' => 'atrasado']));

        $this->assertSame([$emprestimo['id_emprestimo']], $emDia);
        $this->assertSame([], $atrasados);
    }

    public function testStatusTodosEStatusDesconhecidoTrazemTudo(): void
    {
        $this->montarEmprestimosDeTodosOsTipos();

        $this->assertCount(3, $this->idsDaLista($this->listarEmprestimos(['status' => 'todos'])));
        $this->assertCount(3, $this->idsDaLista($this->listarEmprestimos(['status' => 'qualquer-coisa'])));
    }

    // ---------- Filtros por pessoa e por exemplar ----------

    public function testFiltroPorPessoaTrazSoOsEmprestimosDela(): void
    {
        $tipos = $this->montarEmprestimosDeTodosOsTipos();

        $ids = $this->idsDaLista($this->listarEmprestimos(['id_pessoa' => $tipos['atrasado']['id_pessoa']]));

        $this->assertSame([$tipos['atrasado']['id_emprestimo']], $ids);
    }

    public function testFiltroPorExemplarTrazSoOsEmprestimosDele(): void
    {
        $tipos = $this->montarEmprestimosDeTodosOsTipos();

        $ids = $this->idsDaLista($this->listarEmprestimos(['id_exemplar' => $tipos['devolvido']['id_exemplar']]));

        $this->assertSame([$tipos['devolvido']['id_emprestimo']], $ids);
    }

    public function testFiltrosCombinadosSemResultadoRetornam200ComListaVazia(): void
    {
        $tipos = $this->montarEmprestimosDeTodosOsTipos();

        // A pessoa do emprestimo devolvido nao tem nenhum emprestimo pendente.
        $resposta = $this->listarEmprestimos([
            'status'    => 'pendente',
            'id_pessoa' => $tipos['devolvido']['id_pessoa'],
        ]);
        $corpo = $this->corpo($resposta);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('sucesso', $corpo['status']);
        $this->assertSame([], $corpo['dados']);
    }

    // ---------- Metodo HTTP errado ----------

    public function testMetodoPostRetorna405(): void
    {
        $resposta = $this->http->post('/api/emprestimos/index.php');

        $this->assertSame(405, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $this->corpo($resposta)['status']);
    }
}
