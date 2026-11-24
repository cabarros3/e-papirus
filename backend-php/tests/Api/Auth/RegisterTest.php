<?php

declare(strict_types=1);

namespace Tests\Api\Auth;

use PHPUnit\Framework\Attributes\DataProvider;
use Tests\Support\AuthHelpers;
use Tests\Support\TestCase;

final class RegisterTest extends TestCase
{
    use AuthHelpers;

    // ---------- Cadastro válido ----------

    public function testCadastroValidoRetorna201EOIdDaPessoa(): void
    {
        $resposta = $this->cadastrarUsuario();
        $corpo = $this->corpo($resposta);

        $this->assertSame(201, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('sucesso', $corpo['status']);
        $this->assertGreaterThan(0, (int) $corpo['dados']['id_pessoa']);
    }

    public function testCadastroSemTelefoneFunciona(): void
    {
        $dados = $this->dadosUsuario();
        unset($dados['telefone']);

        $resposta = $this->http->post('/api/auth/register.php', ['json' => $dados]);

        $this->assertSame(201, $resposta->getStatusCode(), (string) $resposta->getBody());
    }

    public function testUsuarioCadastradoConsegueFazerLogin(): void
    {
        $this->garantirUsuarioCadastrado();
        $usuario = $this->dadosUsuario();

        $resposta = $this->login($usuario['email'], $usuario['senha']);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
    }

    // ---------- Campos obrigatórios ----------

    #[DataProvider('camposObrigatorios')]
    public function testCadastroSemCampoObrigatorioRetorna400(string $campo): void
    {
        $dados = $this->dadosUsuario();
        unset($dados[$campo]);

        $resposta = $this->http->post('/api/auth/register.php', ['json' => $dados]);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $this->corpo($resposta)['status']);
    }

    public static function camposObrigatorios(): array
    {
        return [
            'nome'      => ['nome'],
            'matricula' => ['matricula'],
            'cpf'       => ['cpf'],
            'email'     => ['email'],
            'senha'     => ['senha'],
            'tipo'      => ['tipo'],
        ];
    }

    // ---------- Duplicidade ----------

    #[DataProvider('camposUnicos')]
    public function testCadastroDuplicadoRetorna409(string $campo): void
    {
        $this->garantirUsuarioCadastrado();

        // Segunda pessoa, igual à primeira apenas no campo testado.
        $resposta = $this->cadastrarUsuario([
            'email'     => 'outro@epapirus.local',
            'cpf'       => '11144477735',
            'matricula' => '20260002',
            $campo      => $this->dadosUsuario()[$campo],
        ]);

        $this->assertSame(409, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $this->corpo($resposta)['status']);
    }

    public static function camposUnicos(): array
    {
        return [
            'email'     => ['email'],
            'cpf'       => ['cpf'],
            'matricula' => ['matricula'],
        ];
    }

    public function testFalhaNoCadastroDesfazOInsertDaPessoa(): void
    {
        $this->garantirUsuarioCadastrado();

        // E-mail repetido: a transação falha e deve ser desfeita por completo.
        $falha = $this->cadastrarUsuario(['cpf' => '11144477735', 'matricula' => '20260002']);
        $this->assertSame(409, $falha->getStatusCode(), (string) $falha->getBody());

        // Mesmo CPF e matrícula, agora com e-mail novo: só passa se nada da tentativa anterior ficou gravado.
        $retentativa = $this->cadastrarUsuario([
            'email'     => 'novo@epapirus.local',
            'cpf'       => '11144477735',
            'matricula' => '20260002',
        ]);
        $this->assertSame(201, $retentativa->getStatusCode(), (string) $retentativa->getBody());
    }

    // ---------- Método ----------

    public function testCadastroComMetodoGetRetorna405(): void
    {
        $resposta = $this->http->get('/api/auth/register.php');

        $this->assertSame(405, $resposta->getStatusCode(), (string) $resposta->getBody());
    }
}
