<?php

declare(strict_types=1);

namespace Tests\Support;

use Psr\Http\Message\ResponseInterface;

/**
 * Auxiliares para testes do modulo pessoas.
 * Use dentro de classes que estendem Tests\Support\TestCase (precisam de $this->http).
 */
trait PessoaHelpers
{
    /** Dados de uma pessoa fficticia; $numero gera matricula, CPF e e-mail diferentes. */
    protected function dadosOutraPessoa(int $numero): array
    {
        $n = str_pad((string) $numero, 4, '0', STR_PAD_LEFT);

        return [
            'nome'      => "Pessoa de Teste $numero",
            'matricula' => "2026$n",
            'cpf'       => "9998887$n",
            'email'     => "pessoa$numero@epapirus.local",
            'telefone'  => '81999990001',
            'tipo'      => 'aluno',
            'senha'     => 'senha-de-teste-123',
        ];
    }

    /** Dados validos da pessoa padrao; $sobrescrever troca ou acrescenta campos. */
    protected function dadosPessoa(array $sobrescrever = []): array
    {
        return array_merge($this->dadosOutraPessoa(1), $sobrescrever);
    }

    protected function cadastrarPessoa(array $sobrescrever = []): ResponseInterface
    {
        return $this->http->post('/api/pessoas/create.php', [
            'json' => $this->dadosPessoa($sobrescrever),
        ]);
    }

    /** Pre-condicao: cadastra uma pessoa, falha o teste se nao der 201 e devolve o id. */
    protected function criarPessoa(array $sobrescrever = []): int
    {
        $resposta = $this->cadastrarPessoa($sobrescrever);

        $this->assertSame(
            201,
            $resposta->getStatusCode(),
            'Cadastro de pessoa (pre-condicao) falhou: ' . (string) $resposta->getBody()
        );

        return (int) $this->corpo($resposta)['dados']['id_pessoa'];
    }

    protected function buscarPessoa(int $id): ResponseInterface
    {
        return $this->http->get('/api/pessoas/index.php', ['query' => ['id' => $id]]);
    }

    /**
     * Insere direto no banco de TESTE uma pessoa sem login (usuario_sistema), que a API nao consegue criar.
     * Usa as mesmas credenciais fixas do TestCase: nunca aponta para o banco de desenvolvimento.
     */
    protected function inserirPessoaSemLogin(): int
    {
        $pdo = new \PDO(
            'mysql:host=127.0.0.1;dbname=epapirus_test;charset=utf8mb4',
            'epapirus_test',
            'epapirus_test',
            [\PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION]
        );

        $pdo->prepare(
            'INSERT INTO pessoa (nome, matricula, cpf, email, tipo) VALUES (?, ?, ?, ?, ?)'
        )->execute(['Pessoa Sem Login', '20260777', '99988870777', 'semlogin@epapirus.local', 'aluno']);

        return (int) $pdo->lastInsertId();
    }
}
