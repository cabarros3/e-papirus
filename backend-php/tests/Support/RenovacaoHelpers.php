<?php

declare(strict_types=1);

namespace Tests\Support;

use Psr\Http\Message\ResponseInterface;

/**
 * Auxiliares para testes do modulo renovacoes.
 * A classe de teste tambem precisa usar AuthHelpers (corpo), PessoaHelpers, LivroHelpers,
 * ExemplarHelpers e EmprestimoHelpers, porque a renovacao depende de um emprestimo existente.
 */
trait RenovacaoHelpers
{
    // ---------- Via API ----------

    /** POST create.php; $sobrescrever acrescenta campos como nova_data_prevista. */
    protected function renovarEmprestimo(int $idEmprestimo, array $sobrescrever = []): ResponseInterface
    {
        return $this->http->post('/api/renovacoes/create.php', [
            'json' => array_merge(['id_emprestimo' => $idEmprestimo], $sobrescrever),
        ]);
    }

    protected function listarRenovacoes(array $query = []): ResponseInterface
    {
        return $this->http->get('/api/renovacoes/index.php', ['query' => $query]);
    }

    // ---------- Direto no banco de TESTE ----------

    /** Linhas da tabela renovacao de um emprestimo, lidas direto do banco de teste, da mais antiga. */
    protected function renovacoesNoBanco(int $idEmprestimo): array
    {
        $stmt = $this->conexaoBancoDeTeste()->prepare(
            'SELECT * FROM renovacao WHERE id_emprestimo = ? ORDER BY id_renovacao'
        );
        $stmt->execute([$idEmprestimo]);

        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /** Insere direto no banco de teste uma renovacao com datas arbitrarias e devolve o id dela. */
    protected function inserirRenovacao(int $idEmprestimo, string $dataRenovacao, string $novaDataDevolucao): int
    {
        $pdo = $this->conexaoBancoDeTeste();

        $pdo->prepare(
            'INSERT INTO renovacao (id_emprestimo, data_renovacao, nova_data_devolucao) VALUES (?, ?, ?)'
        )->execute([$idEmprestimo, $dataRenovacao, $novaDataDevolucao]);

        return (int) $pdo->lastInsertId();
    }
}
