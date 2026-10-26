<?php

declare(strict_types=1);

namespace Tests\Support;

use Psr\Http\Message\ResponseInterface;

/**
 * Auxiliares para testes do módulo exemplares.
 * Use dentro de classes que estendem Tests\Support\TestCase (precisam de $this->http).
 */
trait ExemplarHelpers
{
    /** Dados mínimos válidos para cadastrar um exemplar; $sobrescrever troca ou acrescenta campos. */
    protected function dadosExemplar(int $idLivro, array $sobrescrever = []): array
    {
        return array_merge([
            'id_livro'    => $idLivro,
            'localizacao' => 'Estante de Teste A1',
        ], $sobrescrever);
    }

    protected function cadastrarExemplar(int $idLivro, array $sobrescrever = []): ResponseInterface
    {
        return $this->http->post('/api/exemplares/create.php', [
            'json' => $this->dadosExemplar($idLivro, $sobrescrever),
        ]);
    }

    /**
     * Pré-condição: cadastra um exemplar, falha o teste se não der 201
     * e devolve ['id_exemplar' => int, 'numero_exemplar' => int].
     */
    protected function criarExemplar(int $idLivro, array $sobrescrever = []): array
    {
        $resposta = $this->cadastrarExemplar($idLivro, $sobrescrever);

        $this->assertSame(
            201,
            $resposta->getStatusCode(),
            'Cadastro de exemplar (pré-condição) falhou: ' . (string) $resposta->getBody()
        );

        $dados = $this->corpo($resposta)['dados'];

        return [
            'id_exemplar'     => (int) $dados['id_exemplar'],
            'numero_exemplar' => (int) $dados['numero_exemplar'],
        ];
    }
}