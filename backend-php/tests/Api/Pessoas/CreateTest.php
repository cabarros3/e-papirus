<?php

declare(strict_types=1);

namespace Tests\Api\Pessoas;

use PHPUnit\Framework\Attributes\DataProvider;
use Tests\Support\AuthHelpers;
use Tests\Support\PessoaHelpers;
use Tests\Support\TestCase;

/**
 * api/pessoas/create.php
 *
 * O endpoint cria a pessoa e o login (usuario_sistema) na mesma transacao.
 * So valida a presenca dos campos obrigatorios, nao o formato deles.
 */
final class CreateTest extends TestCase
{
    use AuthHelpers; // fornece corpo() e login()
    use PessoaHelpers;

    // ---------- Cadastro valido ----------

    public function testCadastroValidoRetorna201EOIdDaPessoa(): void
    {
        $resposta = $this->cadastrarPessoa();
        $corpo = $this->corpo($resposta);

        $this->assertSame(201, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('sucesso', $corpo['status']);
        $this->assertGreaterThan(0, (int) $corpo['dados']['id_pessoa']);
        $this->assertArrayNotHasKey('senha', $corpo['dados']);
    }

    public function testPessoaCadastradaApareceNaConsultaPorId(): void
    {
        $dados = $this->dadosPessoa();
        $id = $this->criarPessoa();

        $resposta = $this->buscarPessoa($id);
        $pessoa = $this->corpo($resposta)['dados'];

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertEquals($id, $pessoa['id_pessoa']);
        $this->assertSame($dados['nome'], $pessoa['nome']);
        $this->assertSame($dados['matricula'], $pessoa['matricula']);
        $this->assertSame($dados['cpf'], $pessoa['cpf']);
        $this->assertSame($dados['email'], $pessoa['email']);
        $this->assertSame($dados['telefone'], $pessoa['telefone']);
        $this->assertSame($dados['tipo'], $pessoa['tipo']);
        $this->assertArrayNotHasKey('senha', $pessoa);
    }

    public function testCadastroSemTelefoneGravaNulo(): void
    {
        $dados = $this->dadosPessoa();
        unset($dados['telefone']);

        $resposta = $this->http->post('/api/pessoas/create.php', ['json' => $dados]);

        $this->assertSame(201, $resposta->getStatusCode(), (string) $resposta->getBody());

        $id = (int) $this->corpo($resposta)['dados']['id_pessoa'];
        $this->assertNull($this->corpo($this->buscarPessoa($id))['dados']['telefone']);
    }

    public function testCadastroDeFuncionarioGravaOCargo(): void
    {
        $id = $this->criarPessoa(['tipo' => 'funcionario', 'cargo' => 'bibliotecario']);

        $pessoa = $this->corpo($this->buscarPessoa($id))['dados'];

        $this->assertSame('funcionario', $pessoa['tipo']);
        $this->assertSame('bibliotecario', $pessoa['cargo']);
    }

    public function testCargoEIgnoradoParaQuemNaoEFuncionario(): void
    {
        $id = $this->criarPessoa(['tipo' => 'aluno', 'cargo' => 'bibliotecario']);

        $pessoa = $this->corpo($this->buscarPessoa($id))['dados'];

        $this->assertNull($pessoa['cargo']);
    }

    public function testCadastroCriaOLoginDaPessoa(): void
    {
        $dados = $this->dadosPessoa();
        $this->criarPessoa();

        $resposta = $this->login($dados['email'], $dados['senha']);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
    }

    // ---------- Campos obrigatorios ----------

    #[DataProvider('camposObrigatorios')]
    public function testCadastroSemCampoObrigatorioRetorna400(string $campo): void
    {
        $dados = $this->dadosPessoa();
        unset($dados[$campo]);

        $resposta = $this->http->post('/api/pessoas/create.php', ['json' => $dados]);
        $corpo = $this->corpo($resposta);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertNull($corpo['dados']);
    }

    public static function camposObrigatorios(): array
    {
        return [
            'nome'      => ['nome'],
            'matricula' => ['matricula'],
            'cpf'       => ['cpf'],
            'email'     => ['email'],
            'tipo'      => ['tipo'],
            'senha'     => ['senha'],
        ];
    }

    public function testCadastroComNomeVazioRetorna400(): void
    {
        $resposta = $this->cadastrarPessoa(['nome' => '']);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $this->corpo($resposta)['status']);
    }

    // ---------- Duplicidade ----------

    #[DataProvider('camposUnicos')]
    public function testCadastroComCampoUnicoRepetidoRetorna409(string $campo): void
    {
        $existente = $this->dadosPessoa();
        $this->criarPessoa();

        // Outra pessoa, igual a primeira apenas no campo testado.
        $outra = $this->dadosOutraPessoa(2);
        $outra[$campo] = $existente[$campo];

        $resposta = $this->http->post('/api/pessoas/create.php', ['json' => $outra]);
        $corpo = $this->corpo($resposta);

        $this->assertSame(409, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertNull($corpo['dados']);

        // Rollback: a segunda pessoa nao pode ter ficado gravada.
        $busca = $this->http->get('/api/pessoas/index.php', ['query' => ['termo' => $outra['nome']]]);
        $this->assertSame([], $this->corpo($busca)['dados']);
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
        $resposta = $this->http->get('/api/pessoas/create.php');

        $this->assertSame(405, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $this->corpo($resposta)['status']);
    }

    // ---------- Falhas conhecidas (pendentes) ----------

    public function testEmailMalFormadoRetorna400(): void
    {
        $this->markTestIncomplete(
            'create.php nao valida o formato do e-mail: um valor como "isto-nao-e-email" e aceito e '
            . 'cadastrado. O esperado e 400. Corrigir em issue futura.'
        );

        $resposta = $this->cadastrarPessoa(['email' => 'isto-nao-e-email']);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
    }

    public function testCpfComFormatoInvalidoRetorna400(): void
    {
        $this->markTestIncomplete(
            'create.php nao valida o CPF: um valor com letras ou com menos de 11 digitos e aceito. '
            . 'O esperado e 400. Corrigir em issue futura.'
        );

        $resposta = $this->cadastrarPessoa(['cpf' => 'abc']);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
    }

    public function testTipoForaDaListaRetorna400(): void
    {
        $this->markTestIncomplete(
            'create.php nao valida o valor de tipo (aluno, professor ou funcionario): um valor fora da '
            . 'lista chega ao banco e, em modo estrito, vira erro 500 com a mensagem do MySQL. '
            . 'O esperado e 400. Corrigir em issue futura.'
        );

        $resposta = $this->cadastrarPessoa(['tipo' => 'visitante']);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
    }
}
