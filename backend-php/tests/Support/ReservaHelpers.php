<?php

declare(strict_types=1);

namespace Tests\Support;

use Psr\Http\Message\ResponseInterface;

/**
 * Auxiliares para testes do módulo reservas.
 * Use dentro de classes que estendem Tests\Support\TestCase (precisam de $this->http).
 */
trait ReservaHelpers
{
    /** POST em /api/reservas/create.php autenticado com $token. */
    protected function cadastrarReserva(string $token, array $corpo): ResponseInterface
    {
        return $this->http->post('/api/reservas/create.php', [
            'json'    => $corpo,
            'headers' => ['Authorization' => 'Bearer ' . $token],
        ]);
    }

    /**
     * Pré-condição: reserva o livro, falha o teste se não der 201 e devolve
     * ['id_reserva', 'id_pessoa', 'id_exemplar' (int) e 'data_expiracao' (string)].
     */
    protected function criarReserva(string $token, int $idLivro, array $sobrescrever = []): array
    {
        $resposta = $this->cadastrarReserva($token, array_merge(['id_livro' => $idLivro], $sobrescrever));

        $this->assertSame(
            201,
            $resposta->getStatusCode(),
            'Reserva (pré-condição) falhou: ' . (string) $resposta->getBody()
        );

        $dados = $this->corpo($resposta)['dados'];

        return [
            'id_reserva'     => (int) $dados['id_reserva'],
            'id_pessoa'      => (int) $dados['id_pessoa'],
            'id_exemplar'    => (int) $dados['id_exemplar'],
            'data_expiracao' => $dados['data_expiracao'],
        ];
    }
}