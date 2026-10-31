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
    
    /** GET em /api/reservas/index.php; o token é opcional para permitir testar o acesso sem login. */
    protected function buscarReservas(array $query = [], ?string $token = null): ResponseInterface
    {
        $opcoes = ['query' => $query];

        if ($token !== null) {
            $opcoes['headers'] = ['Authorization' => 'Bearer ' . $token];
        }

        return $this->http->get('/api/reservas/index.php', $opcoes);
    }

    /** Lista as reservas (com ou sem filtro), confere o 200 e devolve a lista. */
    protected function listarReservas(string $token, array $query = []): array
    {
        $resposta = $this->buscarReservas($query, $token);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());

        return $this->corpo($resposta)['dados'];
    }

    
    /** PUT em /api/reservas/update.php; o token é opcional para permitir testar o acesso sem login. */
    protected function atualizarReserva(array $corpo, ?string $token = null): ResponseInterface
    {
        $opcoes = ['json' => $corpo];

        if ($token !== null) {
            $opcoes['headers'] = ['Authorization' => 'Bearer ' . $token];
        }

        return $this->http->put('/api/reservas/update.php', $opcoes);
    }

    /** Procura uma reserva na lista da pessoa; devolve null se ela não estiver lá. */
    protected function acharReserva(string $token, int $idPessoa, int $idReserva): ?array
    {
        foreach ($this->listarReservas($token, ['id_pessoa' => $idPessoa]) as $reserva) {
            if ((int) $reserva['id_reserva'] === $idReserva) {
                return $reserva;
            }
        }

        return null;
    }
}