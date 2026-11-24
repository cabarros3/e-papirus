<?php

declare(strict_types=1);

namespace Tests\Support;

use Psr\Http\Message\ResponseInterface;

/**
 * Auxiliares para testes do modulo autores.
 * Use dentro de classes que estendem Tests\Support\TestCase (precisam de $this->http).
 */
trait AutorHelpers
{
    // Vindos do seed (db/seed.sql). O banco e recriado antes de cada teste.
    protected const ID_AUTOR_DO_SEED = 1;
    protected const NOME_AUTOR_DO_SEED = 'Robert C. Martin';

    protected function cadastrarAutor(string $nome = 'Autor de Teste'): ResponseInterface
    {
        return $this->http->post('/api/autores/create.php', [
            'json' => ['nome_autor' => $nome],
        ]);
    }

    /** Pre-condicao: cadastra um autor, falha o teste se nao der 201 e devolve o id. */
    protected function criarAutor(string $nome = 'Autor de Teste'): int
    {
        $resposta = $this->cadastrarAutor($nome);

        $this->assertSame(
            201,
            $resposta->getStatusCode(),
            'Cadastro de autor (pre-condicao) falhou: ' . (string) $resposta->getBody()
        );

        // O create.php devolve o id na chave "id" (nao "id_autor").
        return (int) $this->corpo($resposta)['dados']['id'];
    }

    protected function buscarAutor(int $id): ResponseInterface
    {
        return $this->http->get('/api/autores/index.php', ['query' => ['id' => $id]]);
    }
}
