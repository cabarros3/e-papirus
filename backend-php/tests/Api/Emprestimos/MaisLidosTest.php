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
 * api/emprestimos/mais-lidos.php
 *
 * Ranking de livros por total de emprestimos (contam tambem os ja devolvidos), com ?limite= (padrao 10).
 * So aparecem livros que ja tiveram ao menos um emprestimo. Sem nenhum: 200 com lista vazia.
 * O seed nao tem emprestimos, entao o banco de teste comeca sem ranking.
 */
final class MaisLidosTest extends TestCase
{
    use AuthHelpers; // fornece corpo()
    use PessoaHelpers;
    use LivroHelpers;
    use ExemplarHelpers;
    use EmprestimoHelpers;

    private const CAMPOS_DO_RANKING = [
        'id_livro', 'titulo', 'capa', 'editora', 'ano_publicacao', 'nota_resumo',
        'nome_assunto', 'nomes_autores', 'total_emprestimos',
    ];

    private function consultarRanking(array $query = []): ResponseInterface
    {
        return $this->http->get('/api/emprestimos/mais-lidos.php', ['query' => $query]);
    }

    /** Faz um emprestimo pela API, falha o teste se nao der 201 e devolve o id do emprestimo. */
    private function emprestar(int $idExemplar, int $idPessoa): int
    {
        $resposta = $this->emprestarExemplar($idExemplar, $idPessoa);

        $this->assertSame(201, $resposta->getStatusCode(), (string) $resposta->getBody());

        return (int) $this->corpo($resposta)['dados']['id_emprestimo'];
    }

    /**
     * Monta tres livros: um com 2 emprestimos (um deles ja devolvido), um com 1 e um sem nenhum.
     * Devolve os ids no formato ['mais' => int, 'menos' => int, 'nunca' => int].
     */
    private function montarRanking(): array
    {
        $idPessoaA = $this->criarPessoa();
        $idPessoaB = $this->criarPessoa($this->dadosOutraPessoa(2));

        $livroMais = $this->criarLivro(['titulo' => 'Livro Mais Emprestado']);
        $livroMenos = $this->criarLivro(['titulo' => 'Livro Menos Emprestado']);
        $livroNunca = $this->criarLivro(['titulo' => 'Livro Nunca Emprestado']);

        $exemplarMais1 = $this->criarExemplar($livroMais)['id_exemplar'];
        $exemplarMais2 = $this->criarExemplar($livroMais)['id_exemplar'];
        $exemplarMenos = $this->criarExemplar($livroMenos)['id_exemplar'];
        $this->criarExemplar($livroNunca);

        $primeiroEmprestimo = $this->emprestar($exemplarMais1, $idPessoaA);
        $this->emprestar($exemplarMais2, $idPessoaB);
        $this->emprestar($exemplarMenos, $idPessoaA);

        // Emprestimo ja devolvido continua contando no ranking.
        $devolucao = $this->devolverEmprestimo($primeiroEmprestimo);
        $this->assertSame(200, $devolucao->getStatusCode(), (string) $devolucao->getBody());

        return ['mais' => $livroMais, 'menos' => $livroMenos, 'nunca' => $livroNunca];
    }

    // ---------- Ranking ----------

    public function testSemEmprestimosRetorna200ComListaVazia(): void
    {
        $resposta = $this->consultarRanking();
        $corpo = $this->corpo($resposta);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('sucesso', $corpo['status']);
        $this->assertSame([], $corpo['dados']);
    }

    public function testRankingVemOrdenadoPeloTotalDeEmprestimos(): void
    {
        $livros = $this->montarRanking();

        $resposta = $this->consultarRanking();
        $dados = $this->corpo($resposta)['dados'];

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertCount(2, $dados);

        $this->assertEquals($livros['mais'], $dados[0]['id_livro']);
        $this->assertEquals(2, $dados[0]['total_emprestimos']);
        $this->assertEquals($livros['menos'], $dados[1]['id_livro']);
        $this->assertEquals(1, $dados[1]['total_emprestimos']);
    }

    public function testLivroSemEmprestimoNaoApareceNoRanking(): void
    {
        $livros = $this->montarRanking();

        $ids = array_map('intval', array_column($this->corpo($this->consultarRanking())['dados'], 'id_livro'));

        $this->assertNotContains($livros['nunca'], $ids);
    }

    public function testLimiteReduzOTamanhoDoRanking(): void
    {
        $livros = $this->montarRanking();

        $resposta = $this->consultarRanking(['limite' => 1]);
        $dados = $this->corpo($resposta)['dados'];

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertCount(1, $dados);
        $this->assertEquals($livros['mais'], $dados[0]['id_livro']);
    }

    public function testRankingTrazOsCamposDoLivro(): void
    {
        $this->montarRanking();

        $livro = $this->corpo($this->consultarRanking())['dados'][0];

        foreach (self::CAMPOS_DO_RANKING as $campo) {
            $this->assertArrayHasKey($campo, $livro);
        }

        $this->assertSame('Livro Mais Emprestado', $livro['titulo']);
        $this->assertNotEmpty($livro['nome_assunto']);
        $this->assertSame(self::NOME_AUTOR_SEED_UM, $livro['nomes_autores']);
    }

    // ---------- Metodo HTTP errado ----------

    public function testMetodoPostRetorna405(): void
    {
        $resposta = $this->http->post('/api/emprestimos/mais-lidos.php');

        $this->assertSame(405, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $this->corpo($resposta)['status']);
    }

    // ---------- Falha conhecida (pendente) ----------

    public function testLimiteInvalidoRetorna400(): void
    {
        $this->markTestIncomplete(
            'mais-lidos.php nao valida o parametro limite: o valor e convertido com (int) e usado direto '
            . 'no LIMIT. Zero ou texto devolvem uma lista vazia com a mensagem "Nenhum livro foi emprestado '
            . 'ainda.", e um valor negativo provavelmente vira 500 com a mensagem do MySQL. O esperado e 400 '
            . 'para limite invalido. Corrigir em issue futura.'
        );

        $this->montarRanking();

        $resposta = $this->consultarRanking(['limite' => -1]);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
    }
}
