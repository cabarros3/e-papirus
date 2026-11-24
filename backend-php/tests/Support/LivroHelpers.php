<?php

declare(strict_types=1);

namespace Tests\Support;

use Psr\Http\Message\ResponseInterface;

/**
 * Auxiliares para testes do módulo livros.
 * Use dentro de classes que estendem Tests\Support\TestCase (precisam de $this->http).
 */
trait LivroHelpers
{
    // Ids e nomes vindos do seed (db/seed.sql). O banco é recriado antes de cada teste,
    // então esses valores são estáveis. Se o seed mudar, ajuste só aqui.
    protected const ID_ASSUNTO_SEED = 1;
    protected const ID_AUTOR_SEED_UM = 1;
    protected const NOME_AUTOR_SEED_UM = 'Robert C. Martin';
    protected const ID_AUTOR_SEED_DOIS = 2;
    protected const NOME_AUTOR_SEED_DOIS = 'Abraham Silberschatz';

    /** Dados mínimos válidos para cadastrar um livro; $sobrescrever troca ou acrescenta campos. */
    protected function dadosLivro(array $sobrescrever = []): array
    {
        return array_merge([
            'id_assunto'      => self::ID_ASSUNTO_SEED,
            'titulo'          => 'Livro de Teste',
            'editora'         => 'Editora de Teste',
            'ano_publicacao'  => 2024,
            'autores'         => [self::ID_AUTOR_SEED_UM],
        ], $sobrescrever);
    }

    protected function cadastrarLivro(array $sobrescrever = []): ResponseInterface
    {
        return $this->http->post('/api/livros/create.php', [
            'json' => $this->dadosLivro($sobrescrever),
        ]);
    }

    /** Pré-condição: cadastra um livro, falha o teste se não der 201 e devolve o id. */
    protected function criarLivro(array $sobrescrever = []): int
    {
        $resposta = $this->cadastrarLivro($sobrescrever);

        $this->assertSame(
            201,
            $resposta->getStatusCode(),
            'Cadastro de livro (pré-condição) falhou: ' . (string) $resposta->getBody()
        );

        return (int) $this->corpo($resposta)['dados']['id_livro'];
    }

    protected function buscarLivro(int $id): ResponseInterface
    {
        return $this->http->get('/api/livros/index.php', ['query' => ['id' => $id]]);
    }

    protected function contarLivros(): int
    {
        $corpo = $this->corpo($this->http->get('/api/livros/index.php'));

        $this->assertIsArray($corpo['dados'], 'A listagem deveria devolver uma lista.');

        return count($corpo['dados']);
    }

    
    protected function buscarExemplares(array $query = []): ResponseInterface
    {
        return $this->http->get('/api/exemplares/index.php', ['query' => $query]);
    }

    /** Devolve os exemplares de um livro (lista vazia se não tiver), falhando o teste se a listagem não der 200. */
    protected function exemplaresDoLivro(int $idLivro): array
    {
        $resposta = $this->buscarExemplares(['id_livro' => $idLivro]);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());

        $livros = $this->corpo($resposta)['dados'];
        $this->assertCount(1, $livros, 'O filtro por livro deveria devolver exatamente um livro.');

        return $livros[0]['exemplares'];
    }
}
