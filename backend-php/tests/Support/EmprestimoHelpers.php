<?php

declare(strict_types=1);

namespace Tests\Support;

use Psr\Http\Message\ResponseInterface;

/**
 * Auxiliares para testes dos modulos emprestimos e renovacoes.
 * A classe de teste tambem precisa usar AuthHelpers (corpo), PessoaHelpers, LivroHelpers
 * e ExemplarHelpers, porque estes metodos montam pessoa, livro e exemplar antes de emprestar.
 */
trait EmprestimoHelpers
{
    /** Data (Y-m-d) $dias a partir de hoje; use valores negativos para o passado. */
    protected function dataEmDias(int $dias): string
    {
        return (new \DateTimeImmutable('today'))->modify(sprintf('%+d days', $dias))->format('Y-m-d');
    }

    // ---------- Via API ----------

    /** Cria um livro novo com um exemplar disponivel e devolve o id do exemplar. */
    protected function criarExemplarDisponivel(): int
    {
        return $this->criarExemplar($this->criarLivro())['id_exemplar'];
    }

    /** Corpo valido para emprestar.php (prazo padrao: 7 dias); $sobrescrever troca ou acrescenta campos. */
    protected function dadosEmprestimo(int $idExemplar, int $idPessoa, array $sobrescrever = []): array
    {
        return array_merge([
            'id_exemplar'   => $idExemplar,
            'id_pessoa'     => $idPessoa,
            'data_prevista' => $this->dataEmDias(7),
        ], $sobrescrever);
    }

    protected function emprestarExemplar(int $idExemplar, int $idPessoa, array $sobrescrever = []): ResponseInterface
    {
        return $this->http->post('/api/emprestimos/emprestar.php', [
            'json' => $this->dadosEmprestimo($idExemplar, $idPessoa, $sobrescrever),
        ]);
    }

    /**
     * Pre-condicao: cria pessoa, livro e exemplar disponivel, faz o emprestimo e falha o teste
     * se nao der 201. Devolve ['id_emprestimo' => int, 'id_exemplar' => int, 'id_pessoa' => int].
     */
    protected function criarEmprestimo(array $sobrescrever = []): array
    {
        $idPessoa = $this->criarPessoa();
        $idExemplar = $this->criarExemplarDisponivel();

        $resposta = $this->emprestarExemplar($idExemplar, $idPessoa, $sobrescrever);

        $this->assertSame(
            201,
            $resposta->getStatusCode(),
            'Emprestimo (pre-condicao) falhou: ' . (string) $resposta->getBody()
        );

        return [
            'id_emprestimo' => (int) $this->corpo($resposta)['dados']['id_emprestimo'],
            'id_exemplar'   => $idExemplar,
            'id_pessoa'     => $idPessoa,
        ];
    }

    protected function devolverEmprestimo(int $idEmprestimo): ResponseInterface
    {
        return $this->http->put('/api/emprestimos/devolver.php', [
            'json' => ['id_emprestimo' => $idEmprestimo],
        ]);
    }

    protected function listarEmprestimos(array $query = []): ResponseInterface
    {
        return $this->http->get('/api/emprestimos/index.php', ['query' => $query]);
    }

    // ---------- Direto no banco de TESTE (estados que a API nao cria e conferencias) ----------

    /**
     * Insere direto no banco de teste um emprestimo com datas arbitrarias (ex.: vencido). Se nao
     * houver data de devolucao, marca o exemplar como emprestado, como o emprestar.php faria.
     */
    protected function inserirEmprestimo(
        int $idExemplar,
        int $idPessoa,
        string $dataEmprestimo,
        string $dataPrevista,
        ?string $dataDevolucao = null
    ): int {
        $pdo = $this->conexaoBancoDeTeste();

        $pdo->prepare(
            'INSERT INTO emprestimo (id_exemplar, id_pessoa, data_emprestimo, data_prevista, data_devolucao)
             VALUES (?, ?, ?, ?, ?)'
        )->execute([$idExemplar, $idPessoa, $dataEmprestimo, $dataPrevista, $dataDevolucao]);

        $idEmprestimo = (int) $pdo->lastInsertId();

        if ($dataDevolucao === null) {
            $this->definirDisponibilidadeDoExemplar($idExemplar, 'emprestado');
        }

        return $idEmprestimo;
    }

    /**
     * Cria pessoa, livro e exemplar e insere um emprestimo ja vencido ha $diasDeAtraso dias,
     * sem devolucao. Devolve o mesmo formato de criarEmprestimo().
     */
    protected function criarEmprestimoAtrasado(int $diasDeAtraso = 3): array
    {
        $idPessoa = $this->criarPessoa();
        $idExemplar = $this->criarExemplarDisponivel();

        $idEmprestimo = $this->inserirEmprestimo(
            $idExemplar,
            $idPessoa,
            $this->dataEmDias(-($diasDeAtraso + 7)),
            $this->dataEmDias(-$diasDeAtraso)
        );

        return ['id_emprestimo' => $idEmprestimo, 'id_exemplar' => $idExemplar, 'id_pessoa' => $idPessoa];
    }

    /** Linha da tabela emprestimo, lida direto do banco de teste. */
    protected function emprestimoNoBanco(int $idEmprestimo): array
    {
        $stmt = $this->conexaoBancoDeTeste()->prepare('SELECT * FROM emprestimo WHERE id_emprestimo = ?');
        $stmt->execute([$idEmprestimo]);
        $linha = $stmt->fetch(\PDO::FETCH_ASSOC);

        $this->assertIsArray($linha, "Emprestimo $idEmprestimo nao encontrado no banco de teste.");

        return $linha;
    }

    protected function disponibilidadeDoExemplar(int $idExemplar): string
    {
        $stmt = $this->conexaoBancoDeTeste()->prepare('SELECT disponibilidade FROM exemplar WHERE id_exemplar = ?');
        $stmt->execute([$idExemplar]);

        return (string) $stmt->fetchColumn();
    }

    protected function definirDisponibilidadeDoExemplar(int $idExemplar, string $disponibilidade): void
    {
        $this->conexaoBancoDeTeste()
            ->prepare('UPDATE exemplar SET disponibilidade = ? WHERE id_exemplar = ?')
            ->execute([$disponibilidade, $idExemplar]);
    }

    /** Registros da tabela notificacao ligados ao emprestimo. */
    protected function notificacoesDoEmprestimo(int $idEmprestimo): array
    {
        $stmt = $this->conexaoBancoDeTeste()->prepare('SELECT * FROM notificacao WHERE id_emprestimo = ?');
        $stmt->execute([$idEmprestimo]);

        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
}
