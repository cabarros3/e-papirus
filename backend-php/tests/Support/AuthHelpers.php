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

    /** Converte o corpo da resposta em array, falhando o teste se não for JSON. */
    protected function corpo(ResponseInterface $resposta): array
    {
        $corpo = json_decode((string) $resposta->getBody(), true);

        $this->assertIsArray($corpo, 'A resposta deveria ser um JSON: ' . (string) $resposta->getBody());

        return $corpo;
    }
}
