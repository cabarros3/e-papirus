<?php

declare(strict_types=1);

namespace Tests\Support;

use PDO;
use Psr\Http\Message\ResponseInterface;

/**
 * Chamadas e fixtures dos dashboards (api/dashboards/admin.php e user.php).
 *
 * Use em classes que estendem Tests\Support\TestCase e que também usam
 * AssuntoHelpers, AutorHelpers, ExemplarHelpers e LivroHelpers
 * (e TokenHelpers, para os testes do admin.php).
 */
trait DashboardHelpers
{
    // ---------- Chamadas ----------

    protected function tokenDeFuncionario(): string
    {
        return $this->tokenComDados(['tipo' => 'funcionario', 'cargo' => 'bibliotecario']);
    }

    /** GET em /api/dashboards/admin.php; o token é opcional para permitir testar o acesso sem login. */
    protected function buscarDashboardAdmin(?string $token = null): ResponseInterface
    {
        $opcoes = [];

        if ($token !== null) {
            $opcoes['headers'] = ['Authorization' => 'Bearer ' . $token];
        }

        return $this->http->get('/api/dashboards/admin.php', $opcoes);
    }

    /** Chama o dashboard do admin como funcionário, confere o 200 e devolve o campo "dados". */
    protected function dadosDoDashboardAdmin(): array
    {
        $resposta = $this->buscarDashboardAdmin($this->tokenDeFuncionario());

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());

        return $this->corpo($resposta)['dados'];
    }

    protected function buscarDashboardUsuario(array $query = []): ResponseInterface
    {
        return $this->http->get('/api/dashboards/user.php', ['query' => $query]);
    }

    /** Chama o dashboard do usuário, confere o 200 e devolve o campo "dados". */
    protected function dadosDoDashboardUsuario(int $idPessoa): array
    {
        $resposta = $this->buscarDashboardUsuario(['id_pessoa' => $idPessoa]);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());

        return $this->corpo($resposta)['dados'];
    }

    // ---------- Banco ----------

    /** Apaga todas as linhas de todas as tabelas do banco de TESTE (o schema continua). */
    protected function esvaziarBanco(): void
    {
        $pdo = $this->pdoDeTeste();

        $pdo->exec('SET FOREIGN_KEY_CHECKS = 0');
        foreach ($pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN) as $tabela) {
            $pdo->exec('DELETE FROM `' . $tabela . '`');
        }
        $pdo->exec('SET FOREIGN_KEY_CHECKS = 1');
    }

    /** Esvazia o banco e cria um assunto e um autor (os livros dos cenários precisam deles). */
    protected function prepararBancoComCatalogoBase(): array
    {
        $this->esvaziarBanco();

        return [$this->garantirAssuntoCriado('Assunto de Teste'), $this->criarAutor()];
    }

    /** URL de capa usada nos livros dos cenários (derivada do título). */
    protected function capaDoLivro(string $titulo): string
    {
        return 'https://exemplo.com/' . strtolower(str_replace(' ', '-', $titulo)) . '.jpg';
    }

    /** Cria um livro com $exemplares exemplares; devolve ['id_livro' => int, 'exemplares' => int[]]. */
    protected function criarLivroComExemplares(string $titulo, int $idAssunto, int $idAutor, int $exemplares): array
    {
        $idLivro = $this->criarLivro([
            'titulo'     => $titulo,
            'id_assunto' => $idAssunto,
            'autores'    => [$idAutor],
            'capa'       => $this->capaDoLivro($titulo),
        ]);

        $ids = [];
        for ($i = 0; $i < $exemplares; $i++) {
            $ids[] = $this->criarExemplar($idLivro)['id_exemplar'];
        }

        return ['id_livro' => $idLivro, 'exemplares' => $ids];
    }

    /** Insere uma pessoa direto no banco (sem usuário de login) e devolve o id. $n deve ser único. */
    protected function inserirPessoa(string $nome, int $n): int
    {
        $pdo = $this->pdoDeTeste();

        $pdo->prepare(
            'INSERT INTO pessoa (nome, matricula, cpf, email, telefone, tipo) VALUES (?, ?, ?, ?, ?, ?)'
        )->execute([
            $nome,
            '2026' . sprintf('%04d', $n),
            sprintf('%011d', 1000 + $n),
            "leitor{$n}@epapirus.local",
            '81999990000',
            'aluno',
        ]);

        return (int) $pdo->lastInsertId();
    }

    /** Data (Y-m-d) deslocada $dias dias de hoje; negativo = passado. */
    protected function dataRelativa(int $dias): string
    {
        return date('Y-m-d', strtotime(sprintf('%+d days', $dias)));
    }

    /**
     * Insere um empréstimo direto no banco, com datas em dias relativos a hoje
     * (negativo = passado). Sem $diasDevolucao o empréstimo fica em aberto.
     */
    protected function inserirEmprestimo(
        int $idExemplar,
        int $idPessoa,
        int $diasEmprestimo,
        int $diasPrevista,
        ?int $diasDevolucao = null
    ): int {
        $pdo = $this->pdoDeTeste();

        $pdo->prepare(
            'INSERT INTO emprestimo (id_exemplar, id_pessoa, data_emprestimo, data_prevista, data_devolucao)
             VALUES (?, ?, ?, ?, ?)'
        )->execute([
            $idExemplar,
            $idPessoa,
            $this->dataRelativa($diasEmprestimo),
            $this->dataRelativa($diasPrevista),
            $diasDevolucao === null ? null : $this->dataRelativa($diasDevolucao),
        ]);

        return (int) $pdo->lastInsertId();
    }

    /**
     * Esvazia o banco e monta um cenário conhecido de circulação.
     *
     * Inventário: 3 livros (A, B, C), 5 exemplares (A: 2, B: 2, C: 1) e 3 pessoas.
     * Empréstimos (dias relativos a hoje: emprestado / prevista / devolvido):
     *   #1 pessoa 1, livro A: -10 / -3 / em aberto  (atrasado)
     *   #2 pessoa 1, livro B:  -2 / +5 / em aberto  (no prazo)
     *   #3 pessoa 2, livro A: -20 / -13 / -15       (devolvido)
     *   #4 pessoa 2, livro B:  -1 /  0 / em aberto  (vence hoje)
     *   #5 pessoa 3, livro C: -30 / -23 / -25       (devolvido)
     *   #6 pessoa 3, livro A: -40 / -33 / -35       (devolvido)
     * Saídas por livro: A = 3, B = 2, C = 1.
     *
     * Devolve ['pessoas' => [1 => id, 2 => id, 3 => id], 'livros' => ['A' => id, 'B' => id, 'C' => id]].
     */
    protected function montarCenarioDeCirculacao(): array
    {
        [$idAssunto, $idAutor] = $this->prepararBancoComCatalogoBase();

        $a = $this->criarLivroComExemplares('Livro A', $idAssunto, $idAutor, 2);
        $b = $this->criarLivroComExemplares('Livro B', $idAssunto, $idAutor, 2);
        $c = $this->criarLivroComExemplares('Livro C', $idAssunto, $idAutor, 1);

        $p1 = $this->inserirPessoa('Leitor Um', 1);
        $p2 = $this->inserirPessoa('Leitor Dois', 2);
        $p3 = $this->inserirPessoa('Leitor Tres', 3);

        $this->inserirEmprestimo($a['exemplares'][0], $p1, -10, -3);
        $this->inserirEmprestimo($b['exemplares'][0], $p1, -2, 5);
        $this->inserirEmprestimo($a['exemplares'][1], $p2, -20, -13, -15);
        $this->inserirEmprestimo($b['exemplares'][1], $p2, -1, 0);
        $this->inserirEmprestimo($c['exemplares'][0], $p3, -30, -23, -25);
        $this->inserirEmprestimo($a['exemplares'][0], $p3, -40, -33, -35);

        return [
            'pessoas' => [1 => $p1, 2 => $p2, 3 => $p3],
            'livros'  => ['A' => $a['id_livro'], 'B' => $b['id_livro'], 'C' => $c['id_livro']],
        ];
    }
}