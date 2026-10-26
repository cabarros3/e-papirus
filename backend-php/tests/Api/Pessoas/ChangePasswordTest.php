<?php

declare(strict_types=1);

namespace Tests\Api\Pessoas;

use PHPUnit\Framework\Attributes\DataProvider;
use Psr\Http\Message\ResponseInterface;
use Tests\Support\AuthHelpers;
use Tests\Support\PessoaHelpers;
use Tests\Support\TestCase;

/**
 * api/pessoas/change-password.php
 *
 * Campos: id_pessoa, senha_atual, nova_senha. A nova senha precisa ter pelo menos 6 caracteres.
 */
final class ChangePasswordTest extends TestCase
{
    use AuthHelpers; // fornece corpo() e login()
    use PessoaHelpers;

    private const NOVA_SENHA = 'nova-senha-456';

    private function alterarSenha(array $dados): ResponseInterface
    {
        return $this->http->post('/api/pessoas/change-password.php', ['json' => $dados]);
    }

    /** Dados validos de alteracao para a pessoa padrao (senha atual = senha do cadastro). */
    private function dadosAlteracao(int $id): array
    {
        return [
            'id_pessoa'   => $id,
            'senha_atual' => $this->dadosPessoa()['senha'],
            'nova_senha'  => self::NOVA_SENHA,
        ];
    }

    // ---------- Troca valida ----------

    public function testTrocaValidaRetorna200EASenhaNovaPassaAValer(): void
    {
        $dados = $this->dadosPessoa();
        $id = $this->criarPessoa();

        $resposta = $this->alterarSenha($this->dadosAlteracao($id));
        $corpo = $this->corpo($resposta);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('sucesso', $corpo['status']);
        $this->assertNull($corpo['dados']);

        $this->assertSame(
            200,
            $this->login($dados['email'], self::NOVA_SENHA)->getStatusCode(),
            'O login com a senha nova deveria funcionar.'
        );
        $this->assertSame(
            401,
            $this->login($dados['email'], $dados['senha'])->getStatusCode(),
            'A senha antiga nao deveria mais funcionar.'
        );
    }

    public function testSenhaNovaComExatamenteSeisCaracteresEhAceita(): void
    {
        $id = $this->criarPessoa();

        $resposta = $this->alterarSenha(array_merge($this->dadosAlteracao($id), ['nova_senha' => 'abcdef']));

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
    }

    // ---------- Senha atual incorreta ----------

    public function testSenhaAtualIncorretaRetorna401ENaoAlteraASenha(): void
    {
        $dados = $this->dadosPessoa();
        $id = $this->criarPessoa();

        $resposta = $this->alterarSenha(array_merge($this->dadosAlteracao($id), ['senha_atual' => 'senha-errada']));
        $corpo = $this->corpo($resposta);

        $this->assertSame(401, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertNull($corpo['dados']);
        $this->assertSame(
            200,
            $this->login($dados['email'], $dados['senha'])->getStatusCode(),
            'A senha original deveria continuar valendo.'
        );
    }

    // ---------- Validacao dos campos ----------

    #[DataProvider('camposObrigatorios')]
    public function testSemCampoObrigatorioRetorna400(string $campo): void
    {
        $dados = $this->dadosAlteracao(1);
        unset($dados[$campo]);

        $resposta = $this->alterarSenha($dados);
        $corpo = $this->corpo($resposta);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertNull($corpo['dados']);
    }

    #[DataProvider('camposObrigatorios')]
    public function testComCampoVazioRetorna400(string $campo): void
    {
        $dados = $this->dadosAlteracao(1);
        $dados[$campo] = '';

        $resposta = $this->alterarSenha($dados);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $this->corpo($resposta)['status']);
    }

    public static function camposObrigatorios(): array
    {
        return [
            'id_pessoa'   => ['id_pessoa'],
            'senha_atual' => ['senha_atual'],
            'nova_senha'  => ['nova_senha'],
        ];
    }

    #[DataProvider('idsInvalidos')]
    public function testComIdInvalidoRetorna400(mixed $idInvalido): void
    {
        $dados = $this->dadosAlteracao(1);
        $dados['id_pessoa'] = $idInvalido;

        $resposta = $this->alterarSenha($dados);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $this->corpo($resposta)['status']);
    }

    public static function idsInvalidos(): array
    {
        return [
            'texto'    => ['abc'],
            'zero'     => [0],
            'negativo' => [-5],
        ];
    }

    public function testSenhaNovaComMenosDeSeisCaracteresRetorna400ENaoAlteraASenha(): void
    {
        $dados = $this->dadosPessoa();
        $id = $this->criarPessoa();

        $resposta = $this->alterarSenha(array_merge($this->dadosAlteracao($id), ['nova_senha' => 'abcde']));

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $this->corpo($resposta)['status']);
        $this->assertSame(200, $this->login($dados['email'], $dados['senha'])->getStatusCode());
    }

    public function testCorpoVazioRetorna400(): void
    {
        $resposta = $this->http->post('/api/pessoas/change-password.php', [
            'headers' => ['Content-Type' => 'application/json'],
            'body'    => '',
        ]);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $this->corpo($resposta)['status']);
    }

    // ---------- Usuario nao encontrado ----------

    public function testPessoaInexistenteRetorna404(): void
    {
        $resposta = $this->alterarSenha($this->dadosAlteracao(999999));
        $corpo = $this->corpo($resposta);

        $this->assertSame(404, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertNull($corpo['dados']);
    }

    public function testPessoaSemLoginRetorna404(): void
    {
        $id = $this->inserirPessoaSemLogin();

        $resposta = $this->alterarSenha($this->dadosAlteracao($id));

        $this->assertSame(404, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $this->corpo($resposta)['status']);
    }

    // ---------- Metodo HTTP errado ----------

    public function testMetodoGetRetorna405(): void
    {
        $resposta = $this->http->get('/api/pessoas/change-password.php');

        $this->assertSame(405, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $this->corpo($resposta)['status']);
    }
}
