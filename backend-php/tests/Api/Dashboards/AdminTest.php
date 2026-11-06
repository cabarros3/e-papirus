<?php

declare(strict_types=1);

namespace Tests\Api\Dashboards;

use PHPUnit\Framework\Attributes\DataProvider;
use Psr\Http\Message\ResponseInterface;
use Tests\Support\AssuntoHelpers;
use Tests\Support\AutorHelpers;
use Tests\Support\DashboardHelpers;
use Tests\Support\ExemplarHelpers;
use Tests\Support\LivroHelpers;
use Tests\Support\TestCase;
use Tests\Support\TokenHelpers;

final class AdminTest extends TestCase
{
    use AssuntoHelpers;
    use AutorHelpers;
    use DashboardHelpers;
    use ExemplarHelpers;
    use LivroHelpers;
    use TokenHelpers;

    private const ROTA = '/api/dashboards/admin.php';

    // ---------- Acesso (validarTokenJWT) ----------

    public function testSemTokenRetorna401(): void
    {
        $this->assertAcessoNegado(
            $this->buscarDashboardAdmin(),
            401,
            'Acesso negado. Faça login para continuar.'
        );
    }

    public function testTokenInvalidoRetorna401(): void
    {
        $this->assertAcessoNegado(
            $this->buscarDashboardAdmin('isto-nao-e-um-jwt'),
            401,
            'Sessão inválida ou expirada.'
        );
    }

    public function testTokenExpiradoRetorna401(): void
    {
        $token = $this->gerarToken([
            'exp'  => time() - 60,
            'data' => $this->dadosDoToken(['tipo' => 'funcionario']),
        ]);

        $this->assertAcessoNegado(
            $this->buscarDashboardAdmin($token),
            401,
            'Sessão inválida ou expirada.'
        );
    }

    #[DataProvider('perfisSemAcesso')]
    public function testPerfilQueNaoEFuncionarioRetorna403(string $tipo): void
    {
        $token = $this->tokenComDados(['tipo' => $tipo, 'cargo' => null]);

        $this->assertAcessoNegado(
            $this->buscarDashboardAdmin($token),
            403,
            'Acesso negado. Apenas funcionários podem acessar.'
        );
    }

    public static function perfisSemAcesso(): array
    {
        return [
            'aluno'     => ['aluno'],
            'professor' => ['professor'],
        ];
    }

    #[DataProvider('cargosDeFuncionario')]
    public function testFuncionarioDeQualquerCargoTemAcesso(?string $cargo): void
    {
        $token = $this->tokenComDados(['tipo' => 'funcionario', 'cargo' => $cargo]);

        $resposta = $this->buscarDashboardAdmin($token);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('sucesso', $this->corpo($resposta)['status']);
    }

    public static function cargosDeFuncionario(): array
    {
        return [
            'bibliotecario' => ['bibliotecario'],
            'auxiliar'      => ['auxiliar'],
            'sem cargo'     => [null],
        ];
    }

    public function testMetodoPostComTokenRetorna405(): void
    {
        $resposta = $this->http->post(self::ROTA, [
            'headers' => ['Authorization' => 'Bearer ' . $this->tokenDeFuncionario()],
        ]);

        $this->assertSame(405, $resposta->getStatusCode(), (string) $resposta->getBody());
    }

    // ---------- Estrutura da resposta ----------

    public function testRespostaTemTodasAsSecoes(): void
    {
        $dados = $this->dadosDoDashboardAdmin();

        foreach ([
            'total_livros', 'total_exemplares', 'total_usuarios',
            'emprestimos_ativos', 'emprestimos_atrasados',
            'atividade_recente', 'top_livros',
        ] as $chave) {
            $this->assertArrayHasKey($chave, $dados);
        }
    }

    // ---------- Inventário ----------

    public function testTotaisDeInventario(): void
    {
        $this->montarCenarioDeCirculacao();

        $dados = $this->dadosDoDashboardAdmin();

        $this->assertEquals(3, $dados['total_livros']);
        $this->assertEquals(5, $dados['total_exemplares']);
        $this->assertEquals(3, $dados['total_usuarios']);
    }

    // ---------- Circulação ----------

    public function testEmprestimosAtivosEAtrasados(): void
    {
        $this->montarCenarioDeCirculacao();

        $dados = $this->dadosDoDashboardAdmin();

        // Ativos: #1, #2 e #4. Atrasado: só o #1 (o #4 vence hoje e os devolvidos não contam).
        $this->assertEquals(3, $dados['emprestimos_ativos']);
        $this->assertEquals(1, $dados['emprestimos_atrasados']);
    }

    // ---------- Atividade recente ----------

    public function testAtividadeRecenteTemOsCincoEmprestimosMaisRecentes(): void
    {
        $this->montarCenarioDeCirculacao();

        $atividade = $this->dadosDoDashboardAdmin()['atividade_recente'];

        // Do mais recente para o mais antigo: #4, #2, #1, #3 e #5 (o #6 fica de fora).
        $this->assertCount(5, $atividade);
        $this->assertSame(
            ['Leitor Dois', 'Leitor Um', 'Leitor Um', 'Leitor Dois', 'Leitor Tres'],
            array_column($atividade, 'leitor')
        );
        $this->assertSame(
            ['Livro B', 'Livro B', 'Livro A', 'Livro A', 'Livro C'],
            array_column($atividade, 'titulo')
        );
        $this->assertSame($this->dataRelativa(-1), $atividade[0]['data_emprestimo']);
    }

    // ---------- Livros mais emprestados ----------

    public function testTopLivrosVemOrdenadosPeloTotalDeSaidas(): void
    {
        $this->montarCenarioDeCirculacao();

        $top = $this->dadosDoDashboardAdmin()['top_livros'];

        $this->assertSame(['Livro A', 'Livro B', 'Livro C'], array_column($top, 'titulo'));
        $this->assertSame([3, 2, 1], array_map('intval', array_column($top, 'total_saidas')));
        $this->assertSame($this->capaDoLivro('Livro A'), $top[0]['capa']);
    }

    public function testTopLivrosEAtividadeRecenteSaoLimitadosACinco(): void
    {
        [$idAssunto, $idAutor] = $this->prepararBancoComCatalogoBase();
        $idPessoa = $this->inserirPessoa('Leitor Um', 1);

        for ($i = 1; $i <= 6; $i++) {
            $livro = $this->criarLivroComExemplares("Livro {$i}", $idAssunto, $idAutor, 1);
            $this->inserirEmprestimo($livro['exemplares'][0], $idPessoa, -$i, 5);
        }

        $dados = $this->dadosDoDashboardAdmin();

        $this->assertCount(5, $dados['top_livros']);
        $this->assertCount(5, $dados['atividade_recente']);
    }

    // ---------- Banco vazio ----------

    public function testBancoVazioRetornaTotaisZeradosEListasVazias(): void
    {
        $this->esvaziarBanco();

        $dados = $this->dadosDoDashboardAdmin();

        foreach (['total_livros', 'total_exemplares', 'total_usuarios', 'emprestimos_ativos', 'emprestimos_atrasados'] as $campo) {
            $this->assertEquals(0, $dados[$campo], "{$campo} deveria ser 0.");
        }
        $this->assertSame([], $dados['atividade_recente']);
        $this->assertSame([], $dados['top_livros']);
    }

    public function testSemEmprestimosOsIndicadoresDeCirculacaoSaoZero(): void
    {
        [$idAssunto, $idAutor] = $this->prepararBancoComCatalogoBase();
        $this->criarLivroComExemplares('Livro A', $idAssunto, $idAutor, 2);
        $this->inserirPessoa('Leitor Um', 1);

        $dados = $this->dadosDoDashboardAdmin();

        $this->assertEquals(1, $dados['total_livros']);
        $this->assertEquals(2, $dados['total_exemplares']);
        $this->assertEquals(1, $dados['total_usuarios']);
        $this->assertEquals(0, $dados['emprestimos_ativos']);
        $this->assertEquals(0, $dados['emprestimos_atrasados']);
        $this->assertSame([], $dados['atividade_recente']);
        $this->assertSame([], $dados['top_livros']);
    }

    // ---------- Auxiliares ----------

    private function assertAcessoNegado(ResponseInterface $resposta, int $status, string $mensagem): void
    {
        $corpo = $this->corpo($resposta);

        $this->assertSame($status, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertSame($mensagem, $corpo['mensagem']);
        $this->assertNull($corpo['dados']);
    }
}