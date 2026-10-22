<?php

declare(strict_types=1);

namespace Tests\Support;

use Psr\Http\Message\ResponseInterface;

/**
 * Auxiliares para testes que precisam de assuntos cadastrados.
 * Use dentro de classes que estendem Tests\Support\TestCase (precisam de $this->http).
 */
trait AssuntoHelpers
{
    protected function criarAssunto(string $nome): ResponseInterface
    {
        return $this->http->post('/api/assuntos/create.php', [
            'json' => ['nome_assunto' => $nome],
        ]);
    }

    /** Pré-condição: cria o assunto, falha o teste se não der 201 e devolve o id. */
    protected function garantirAssuntoCriado(string $nome): int
    {
        $resposta = $this->criarAssunto($nome);

        $this->assertSame(
            201,
            $resposta->getStatusCode(),
            'Criação do assunto (pré-condição) falhou: ' . (string) $resposta->getBody()
        );

        return (int) $this->corpo($resposta)['dados']['id'];
    }
}