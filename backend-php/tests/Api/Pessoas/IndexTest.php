<?php

declare(strict_types=1);

namespace Tests\Api\Pessoas;

use Psr\Http\Message\ResponseInterface;
use Tests\Support\AuthHelpers;
use Tests\Support\PessoaHelpers;
use Tests\Support\TestCase;

/**
 * api/pessoas/index.php
 *
 * Sem resultado (inclusive id inexistente), o endpoint devolve 200 com status "aviso" e dados [].
 * Filtros existentes: ?id= (uma pessoa) e ?termo= (busca em nome, CPF e matricula).
 * O seed nao tem pessoas, entao o banco de teste comeca com a tabela vazia.
 */
final class IndexTest extends TestCase
{
    use AuthHelpers; // fornece corpo()
    use PessoaHelpers;

    private const CAMPOS_DA_PESSOA = [
        'id_pessoa', 'nome', 'matricula', 'cpf', 'email', 'telefone', 'tipo', 'cargo',
    ];

    private function consultar(array $query = []): ResponseInterface
    {
        return $this->http->get('/api/pessoas/index.php', ['query' => $query]);
    }

    /** @return int[] ids das pessoas da lista devolvida pela API */
    private function idsDaLista(ResponseInterface $resposta): array
    {
        $dados = $this->corpo($resposta)['dados'];

        $this->assertIsArray($dados, 'A resposta deveria trazer uma lista: ' . (string) $resposta->getBody());

        return array_map('intval', array_column($dados, 'id_pessoa'));
    }

    // ---------- Listagem ----------

    public function testListagemComBancoSemPessoasRetorna200ComAvisoEListaVazia(): void
    {
        $resposta = $this->consultar();
        $corpo = $this->corpo($resposta);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('aviso', $corpo['status']);
        $this->assertSame([], $corpo['dados']);
    }

    public function testListagemRetornaAPessoaCadastradaComOsCamposEsemASenha(): void
    {
        $id = $this->criarPessoa();

        $resposta = $this->consultar();
        $corpo = $this->corpo($resposta);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('sucesso', $corpo['status']);
        $this->assertSame([$id], $this->idsDaLista($resposta));

        foreach (self::CAMPOS_DA_PESSOA as $campo) {
            $this->assertArrayHasKey($campo, $corpo['dados'][0]);
        }

        $this->assertArrayNotHasKey('senha', $corpo['dados'][0]);
    }

    public function testListagemVemOrdenadaPorNomeCrescente(): void
    {
        // Criadas fora de ordem de proposito.
        $idZ = $this->criarPessoa(array_merge($this->dadosOutraPessoa(2), ['nome' => 'Zzzz Teste de Ordem']));
        $idA = $this->criarPessoa(array_merge($this->dadosOutraPessoa(3), ['nome' => 'Aaaa Teste de Ordem']));

        $ids = $this->idsDaLista($this->consultar());

        $this->assertContains($idZ, $ids);
        $this->assertContains($idA, $ids);
        $this->assertLessThan(
            array_search($idZ, $ids, true),
            array_search($idA, $ids, true),
            'A pessoa "Aaaa..." deveria vir antes da "Zzzz...".'
        );
    }

    public function testListagemEhLimitadaACinquentaPessoas(): void
    {
        for ($numero = 1; $numero <= 51; $numero++) {
            $this->criarPessoa($this->dadosOutraPessoa($numero));
        }

        $this->assertCount(50, $this->idsDaLista($this->consultar()));
    }

    // ---------- Consulta por id ----------

    public function testConsultaPorIdRetornaUmObjetoComOsCamposDaPessoa(): void
    {
        $id = $this->criarPessoa();

        $resposta = $this->consultar(['id' => $id]);
        $corpo = $this->corpo($resposta);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('sucesso', $corpo['status']);
        $this->assertArrayHasKey('nome', $corpo['dados'], 'Com ?id= a API devolve um objeto, nao uma lista.');
        $this->assertEquals($id, $corpo['dados']['id_pessoa']);
        $this->assertArrayNotHasKey('senha', $corpo['dados']);
    }

    public function testConsultaPorIdInexistenteRetorna200ComAvisoEListaVazia(): void
    {
        // Comportamento atual: diferente de livros e autores, nao ha 404 para id inexistente.
        $resposta = $this->consultar(['id' => 999999]);
        $corpo = $this->corpo($resposta);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('aviso', $corpo['status']);
        $this->assertSame([], $corpo['dados']);
    }

    public function testIdTemPrioridadeSobreOTermo(): void
    {
        $idA = $this->criarPessoa();
        $outra = $this->dadosOutraPessoa(2);
        $this->criarPessoa($outra);

        $resposta = $this->consultar(['id' => $idA, 'termo' => $outra['nome']]);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertEquals($idA, $this->corpo($resposta)['dados']['id_pessoa']);
    }

    // ---------- Busca (?termo=) ----------

    public function testBuscaPorNomeEncontraSoAPessoaCerta(): void
    {
        $id = $this->criarPessoa(['nome' => 'Zzxq Fulano de Tal']);
        $this->criarPessoa($this->dadosOutraPessoa(2));

        $resposta = $this->consultar(['termo' => 'Zzxq']);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame([$id], $this->idsDaLista($resposta));
    }

    public function testBuscaPorCpfEncontraSoAPessoaCerta(): void
    {
        $dados = $this->dadosPessoa();
        $id = $this->criarPessoa();
        $this->criarPessoa($this->dadosOutraPessoa(2));

        $resposta = $this->consultar(['termo' => $dados['cpf']]);

        $this->assertSame([$id], $this->idsDaLista($resposta));
    }

    public function testBuscaPorMatriculaEncontraSoAPessoaCerta(): void
    {
        $dados = $this->dadosPessoa();
        $id = $this->criarPessoa();
        $this->criarPessoa($this->dadosOutraPessoa(2));

        $resposta = $this->consultar(['termo' => $dados['matricula']]);

        $this->assertSame([$id], $this->idsDaLista($resposta));
    }

    public function testBuscaSemResultadoRetorna200ComAvisoEListaVazia(): void
    {
        $this->criarPessoa();

        $resposta = $this->consultar(['termo' => 'termo-que-nao-existe-em-lugar-nenhum']);
        $corpo = $this->corpo($resposta);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('aviso', $corpo['status']);
        $this->assertSame([], $corpo['dados']);
    }

    // ---------- Metodo HTTP errado ----------

    public function testMetodoPostRetorna405(): void
    {
        $resposta = $this->http->post('/api/pessoas/index.php');

        $this->assertSame(405, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $this->corpo($resposta)['status']);
    }
}
