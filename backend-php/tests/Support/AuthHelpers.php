<?php

declare(strict_types=1);

namespace Tests\Support;

use Psr\Http\Message\ResponseInterface;

/**
 * Auxiliares para testes que precisam de usuário cadastrado/logado.
 * Use dentro de classes que estendem Tests\Support\TestCase (precisam de $this->http).
 */
trait AuthHelpers
{
    /** Dados de cadastro válidos; $sobrescrever troca ou acrescenta campos. */
    protected function dadosUsuario(array $sobrescrever = []): array
    {
        return array_merge([
            'nome'      => 'Usuario de Teste',
            'matricula' => '20260001',
            'cpf'       => '52998224725',
            'email'     => 'teste@epapirus.local',
            'senha'     => 'senha-de-teste-123',
            'tipo'      => 'aluno',
            'telefone'  => '81999990000',
        ], $sobrescrever);
    }

    protected function cadastrarUsuario(array $sobrescrever = []): ResponseInterface
    {
        return $this->http->post('/api/auth/register.php', [
            'json' => $this->dadosUsuario($sobrescrever),
        ]);
    }

    /** Pré-condição: cadastra o usuário padrão e falha o teste se o cadastro não der 201. */
    protected function garantirUsuarioCadastrado(): void
    {
        $cadastro = $this->cadastrarUsuario();

        $this->assertSame(
            201,
            $cadastro->getStatusCode(),
            'Cadastro (pré-condição) falhou: ' . (string) $cadastro->getBody()
        );
    }

    protected function login(string $email, string $senha): ResponseInterface
    {
        return $this->http->post('/api/auth/login.php', [
            'json' => ['email' => $email, 'senha' => $senha],
        ]);
    }

    /** Cadastra o usuário padrão, faz login e devolve o campo "dados" (token + usuario). */
    protected function cadastrarELogar(): array
    {
        $this->garantirUsuarioCadastrado();

        $usuario = $this->dadosUsuario();
        $dados = $this->corpo($this->login($usuario['email'], $usuario['senha']))['dados'] ?? null;

        $this->assertIsArray($dados, 'Login (pré-condição) não devolveu dados.');

        return $dados;
    }

    
    /**
     * Cadastra e loga o usuário de teste número $n (1 a 3) e devolve o campo "dados" do login.
     * O 1 é o usuário padrão; os demais têm e-mail, CPF e matrícula próprios, para permitir
     * vários usuários no mesmo teste (ex.: fila de reservas).
     */
    protected function cadastrarELogarUsuario(int $n): array
    {
        $cpfs = [1 => '52998224725', 2 => '11144477735', 3 => '39053344705'];
        $this->assertArrayHasKey($n, $cpfs, 'Só há dados de teste para os usuários 1 a 3.');

        $sobrescrever = $n === 1 ? [] : [
            'email'     => "usuario{$n}@epapirus.local",
            'cpf'       => $cpfs[$n],
            'matricula' => '2026000' . $n,
        ];

        $cadastro = $this->cadastrarUsuario($sobrescrever);
        $this->assertSame(
            201,
            $cadastro->getStatusCode(),
            'Cadastro (pré-condição) falhou: ' . (string) $cadastro->getBody()
        );

        $usuario = $this->dadosUsuario($sobrescrever);
        $dados = $this->corpo($this->login($usuario['email'], $usuario['senha']))['dados'] ?? null;
        $this->assertIsArray($dados, 'Login (pré-condição) não devolveu dados.');

        return $dados;
    }
}

