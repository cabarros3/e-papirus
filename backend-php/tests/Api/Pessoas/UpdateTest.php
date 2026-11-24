<?php

declare(strict_types=1);

namespace Tests\Api\Pessoas;

use PHPUnit\Framework\Attributes\DataProvider;
use Psr\Http\Message\ResponseInterface;
use Tests\Support\AuthHelpers;
use Tests\Support\PessoaHelpers;
use Tests\Support\TestCase;

/**
 * api/pessoas/update.php
 *
 * Atualizacao parcial: so os campos enviados entre nome, matricula, cpf, email, telefone e tipo
 * sao alterados. cargo e senha nao sao atualizaveis por este endpoint ("campos protegidos").
 */
final class UpdateTest extends TestCase
{
    use AuthHelpers; // fornece corpo() e login()
    use PessoaHelpers;

    private function atualizarPessoa(int $id, array $campos): ResponseInterface
    {
        return $this->http->put('/api/pessoas/update.php', [
            'json' => array_merge(['id_pessoa' => $id], $campos),
        ]);
    }

    private function dadosDaPessoa(int $id): array
    {
        return $this->corpo($this->buscarPessoa($id))['dados'];
    }

    // ---------- Atualizacao valida ----------

    public function testAtualizacaoValidaRetorna200ETrocaOsCampos(): void
    {
        $id = $this->criarPessoa();

        $resposta = $this->atualizarPessoa($id, [
            'nome'      => 'Nome Novo',
            'matricula' => '20269999',
            'cpf'       => '11122233344',
            'email'     => 'novo@epapirus.local',
            'telefone'  => '81988887777',
            'tipo'      => 'professor',
        ]);
        $corpo = $this->corpo($resposta);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('sucesso', $corpo['status']);
        $this->assertNull($corpo['dados']);

        $pessoa = $this->dadosDaPessoa($id);
        $this->assertSame('Nome Novo', $pessoa['nome']);
        $this->assertSame('20269999', $pessoa['matricula']);
        $this->assertSame('11122233344', $pessoa['cpf']);
        $this->assertSame('novo@epapirus.local', $pessoa['email']);
        $this->assertSame('81988887777', $pessoa['telefone']);
        $this->assertSame('professor', $pessoa['tipo']);
    }

    public function testAtualizacaoParcialAlteraSoOsCamposEnviados(): void
    {
        $original = $this->dadosPessoa();
        $id = $this->criarPessoa();

        $resposta = $this->atualizarPessoa($id, ['telefone' => '81955554444']);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());

        $pessoa = $this->dadosDaPessoa($id);
        $this->assertSame('81955554444', $pessoa['telefone']);
        $this->assertSame($original['nome'], $pessoa['nome']);
        $this->assertSame($original['matricula'], $pessoa['matricula']);
        $this->assertSame($original['cpf'], $pessoa['cpf']);
        $this->assertSame($original['email'], $pessoa['email']);
        $this->assertSame($original['tipo'], $pessoa['tipo']);
    }

    public function testAtualizacaoComOsMesmosValoresRetorna200(): void
    {
        $original = $this->dadosPessoa();
        $id = $this->criarPessoa();

        $resposta = $this->atualizarPessoa($id, ['nome' => $original['nome']]);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('sucesso', $this->corpo($resposta)['status']);
        $this->assertSame($original['nome'], $this->dadosDaPessoa($id)['nome']);
    }

    public function testAtualizacaoNaoAfetaOutrasPessoas(): void
    {
        $idAlterada = $this->criarPessoa();
        $outra = $this->dadosOutraPessoa(2);
        $idIntacta = $this->criarPessoa($outra);

        $this->atualizarPessoa($idAlterada, ['nome' => 'Nome Alterado']);

        $this->assertSame($outra['nome'], $this->dadosDaPessoa($idIntacta)['nome']);
    }

    // ---------- Campos protegidos ----------

    public function testCargoNaoPodeSerAtualizado(): void
    {
        $id = $this->criarPessoa(['tipo' => 'funcionario', 'cargo' => 'bibliotecario']);

        $resposta = $this->atualizarPessoa($id, ['nome' => 'Nome Novo', 'cargo' => 'auxiliar']);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());

        $pessoa = $this->dadosDaPessoa($id);
        $this->assertSame('Nome Novo', $pessoa['nome']);
        $this->assertSame('bibliotecario', $pessoa['cargo']);
    }

    public function testSenhaNaoPodeSerAtualizadaPorEsteEndpoint(): void
    {
        $dados = $this->dadosPessoa();
        $id = $this->criarPessoa();

        $resposta = $this->atualizarPessoa($id, ['nome' => 'Nome Novo', 'senha' => 'outra-senha-456']);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());

        $this->assertSame(
            200,
            $this->login($dados['email'], $dados['senha'])->getStatusCode(),
            'A senha original deveria continuar valendo.'
        );
        $this->assertSame(
            401,
            $this->login($dados['email'], 'outra-senha-456')->getStatusCode(),
            'A senha enviada no update nao deveria ter sido gravada.'
        );
    }

    public function testAtualizacaoSoComCampoProtegidoRetorna400(): void
    {
        $id = $this->criarPessoa(['tipo' => 'funcionario', 'cargo' => 'bibliotecario']);

        $resposta = $this->atualizarPessoa($id, ['cargo' => 'auxiliar']);
        $corpo = $this->corpo($resposta);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertNull($corpo['dados']);
        $this->assertSame('bibliotecario', $this->dadosDaPessoa($id)['cargo']);
    }

    // ---------- Campos obrigatorios ----------

    public function testAtualizacaoSemNenhumCampoParaAlterarRetorna400(): void
    {
        $id = $this->criarPessoa();

        $resposta = $this->atualizarPessoa($id, []);
        $corpo = $this->corpo($resposta);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertNull($corpo['dados']);
    }

    #[DataProvider('payloadsSemId')]
    public function testAtualizacaoSemIdRetorna400(array $dados): void
    {
        $resposta = $this->http->put('/api/pessoas/update.php', ['json' => (object) $dados]);
        $corpo = $this->corpo($resposta);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertNull($corpo['dados']);
    }

    public static function payloadsSemId(): array
    {
        return [
            'sem id_pessoa'   => [['nome' => 'Nome Qualquer']],
            'id_pessoa nulo'  => [['id_pessoa' => null, 'nome' => 'Nome Qualquer']],
        ];
    }

    public function testCorpoVazioRetorna400(): void
    {
        $resposta = $this->http->put('/api/pessoas/update.php', [
            'headers' => ['Content-Type' => 'application/json'],
            'body'    => '',
        ]);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $this->corpo($resposta)['status']);
    }

    // ---------- Duplicidade ----------

    #[DataProvider('camposUnicos')]
    public function testAtualizacaoComCampoUnicoDeOutraPessoaRetorna409(string $campo): void
    {
        $primeira = $this->dadosPessoa();
        $this->criarPessoa();
        $idSegunda = $this->criarPessoa($this->dadosOutraPessoa(2));
        $antes = $this->dadosDaPessoa($idSegunda);

        $resposta = $this->atualizarPessoa($idSegunda, [$campo => $primeira[$campo]]);
        $corpo = $this->corpo($resposta);

        $this->assertSame(409, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertNull($corpo['dados']);
        $this->assertSame($antes[$campo], $this->dadosDaPessoa($idSegunda)[$campo]);
    }

    public static function camposUnicos(): array
    {
        return [
            'cpf repetido'       => ['cpf'],
            'matricula repetida' => ['matricula'],
            'email repetido'     => ['email'],
        ];
    }

    // ---------- Metodo HTTP errado ----------

    public function testMetodoGetRetorna405(): void
    {
        $resposta = $this->http->get('/api/pessoas/update.php');

        $this->assertSame(405, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $this->corpo($resposta)['status']);
    }

    // ---------- Falhas conhecidas (pendentes) ----------

    public function testPessoaInexistenteRetorna404(): void
    {
        $this->markTestIncomplete(
            'update.php nao verifica se a pessoa existe: um id inexistente devolve 200 "Dados atualizados '
            . 'com sucesso." O esperado e 404. Corrigir em issue futura.'
        );

        $resposta = $this->atualizarPessoa(999999, ['nome' => 'Nome Qualquer']);

        $this->assertSame(404, $resposta->getStatusCode(), (string) $resposta->getBody());
    }

    public function testNomeVazioRetorna400(): void
    {
        $this->markTestIncomplete(
            'update.php so verifica isset: um nome vazio passa e grava a pessoa com nome em branco, '
            . 'diferente do create.php, que rejeita nome vazio com 400. O esperado e 400. '
            . 'Corrigir em issue futura.'
        );

        $id = $this->criarPessoa();

        $resposta = $this->atualizarPessoa($id, ['nome' => '']);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
    }

    public function testNovoEmailDevePermitirLoginComOEmailNovo(): void
    {
        $this->markTestIncomplete(
            'update.php altera o e-mail so na tabela pessoa; o e-mail do login fica em usuario_sistema '
            . '(ver endpoints.txt) e nao e atualizado, entao o login com o e-mail novo deixa de funcionar. '
            . 'Corrigir em issue futura, atualizando as duas tabelas na mesma transacao.'
        );

        $dados = $this->dadosPessoa();
        $id = $this->criarPessoa();

        $this->atualizarPessoa($id, ['email' => 'novo.email@epapirus.local']);

        $resposta = $this->login('novo.email@epapirus.local', $dados['senha']);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
    }
}
