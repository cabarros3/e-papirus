<?php

declare(strict_types=1);

namespace Tests\Api\Reservas;

use PHPUnit\Framework\Attributes\DataProvider;
use Tests\Support\AuthHelpers;
use Tests\Support\ExemplarHelpers;
use Tests\Support\LivroHelpers;
use Tests\Support\ReservaHelpers;
use Tests\Support\TestCase;

final class UpdateTest extends TestCase
{
    use AuthHelpers;
    use ExemplarHelpers;
    use LivroHelpers;
    use ReservaHelpers;

    private const ROTA = '/api/reservas/update.php';

    // ---------- Mudança de status (cancelamento e atendimento) ----------

    #[DataProvider('statusDeDestino')]
    public function testAtualizacaoAlteraOStatusDaReserva(string $novoStatus): void
    {
        $ctx = $this->prepararReservaAtiva();

        $resposta = $this->atualizarReserva(
            ['id_reserva' => $ctx['id_reserva'], 'status' => $novoStatus],
            $ctx['token']
        );
        $corpo = $this->corpo($resposta);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('sucesso', $corpo['status']);

        $reserva = $this->acharReserva($ctx['token'], $ctx['id_pessoa'], $ctx['id_reserva']);
        $this->assertNotNull($reserva, 'A reserva deveria continuar na listagem.');
        $this->assertSame($novoStatus, $reserva['status']);
    }

    public static function statusDeDestino(): array
    {
        return [
            'cancelamento'          => ['cancelada'],
            'atendimento (concluida)' => ['concluida'],
        ];
    }

    public function testAtualizacaoAlteraSomenteAReservaInformada(): void
    {
        $usuario = $this->cadastrarELogar();
        $idPessoa = (int) $usuario['usuario']['id_pessoa'];
        $livroA = $this->criarLivro(['titulo' => 'Livro de Teste A']);
        $livroB = $this->criarLivro(['titulo' => 'Livro de Teste B']);
        $this->criarExemplar($livroA);
        $this->criarExemplar($livroB);
        $reservaA = $this->criarReserva($usuario['token'], $livroA);
        $reservaB = $this->criarReserva($usuario['token'], $livroB);

        $this->atualizarReserva(['id_reserva' => $reservaA['id_reserva'], 'status' => 'cancelada'], $usuario['token']);

        $a = $this->acharReserva($usuario['token'], $idPessoa, $reservaA['id_reserva']);
        $b = $this->acharReserva($usuario['token'], $idPessoa, $reservaB['id_reserva']);

        $this->assertSame('cancelada', $a['status']);
        $this->assertSame('ativa', $b['status'], 'As outras reservas não deveriam ser alteradas.');

        // Só o status muda: os demais campos da reserva ficam como estavam.
        $this->assertSame($reservaA['data_expiracao'], $a['data_expiracao']);
        $this->assertEquals($livroA, $a['id_livro']);
        $this->assertEquals($reservaA['id_exemplar'], $a['id_exemplar']);
    }

    // PENDENTE: o update.php só troca o status da reserva; o exemplar continua "reservado" depois do
    // cancelamento. O esperado é que ele volte a "disponivel" (a confirmar com a equipe: pode ser que
    // essa liberação seja feita em outro arquivo do módulo). Quando for definido, apague a linha do
    // markTestIncomplete ou ajuste o teste.

    public function testCancelamentoDevolveOExemplarParaDisponivel(): void
    {
        $this->markTestIncomplete('Pendente (a confirmar): update.php só troca o status e o exemplar continua "reservado" após o cancelamento.');

        $ctx = $this->prepararReservaAtiva();

        $this->atualizarReserva(['id_reserva' => $ctx['id_reserva'], 'status' => 'cancelada'], $ctx['token']);

        $this->assertSame('disponivel', $this->exemplaresDoLivro($ctx['id_livro'])[0]['disponibilidade']);
    }

    // ---------- Reserva inexistente ----------

    public function testReservaInexistenteNaoAlteraNada(): void
    {
        $ctx = $this->prepararReservaAtiva();
        $antes = $this->listarReservas($ctx['token']);

        $resposta = $this->atualizarReserva(['id_reserva' => 999999, 'status' => 'cancelada'], $ctx['token']);

        // Comportamento atual: responde 200 mesmo sem reserva (não confere o rowCount).
        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertEquals($antes, $this->listarReservas($ctx['token']), 'Nenhuma reserva deveria ser alterada.');
    }

    // PENDENTE: o correto seria 404. Quando for corrigido, apague a linha do markTestIncomplete
    // (e ajuste ou remova o teste acima, que documenta o comportamento atual).

    public function testReservaInexistenteRetorna404(): void
    {
        $this->markTestIncomplete('Pendente: update.php responde 200 "atualizado" para reserva inexistente (não confere o rowCount).');

        $ctx = $this->prepararReservaAtiva();

        $resposta = $this->atualizarReserva(['id_reserva' => 999999, 'status' => 'cancelada'], $ctx['token']);

        $this->assertSame(404, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $this->corpo($resposta)['status']);
    }

    // ---------- Status inválido / expiração (PENDENTE) ----------
    // O ENUM de status só tem ativa, concluida e cancelada (não existe "expirada") e o update.php
    // não valida o valor: o banco recusa e a API responde 500. O correto seria 400.
    // Quando for corrigido, apague a linha do markTestIncomplete.

    public function testStatusForaDaListaRetorna400(): void
    {
        $this->markTestIncomplete('Pendente: update.php não valida o status (hoje o banco recusa o valor e a API responde 500).');

        $ctx = $this->prepararReservaAtiva();

        $resposta = $this->atualizarReserva(['id_reserva' => $ctx['id_reserva'], 'status' => 'expirada'], $ctx['token']);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $this->corpo($resposta)['status']);
    }

    // ---------- Validação e método ----------

    #[DataProvider('payloadsInvalidos')]
    public function testAtualizacaoComDadosInvalidosRetorna400(array $payload): void
    {
        $usuario = $this->cadastrarELogar();

        $resposta = $this->atualizarReserva($payload, $usuario['token']);
        $corpo = $this->corpo($resposta);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertNull($corpo['dados']);
    }

    public static function payloadsInvalidos(): array
    {
        return [
            'corpo vazio'     => [[]],
            'sem id_reserva'  => [['status' => 'cancelada']],
            'sem status'      => [['id_reserva' => 1]],
            'id_reserva nulo' => [['id_reserva' => null, 'status' => 'cancelada']],
            'id_reserva zero' => [['id_reserva' => 0, 'status' => 'cancelada']],
            'status vazio'    => [['id_reserva' => 1, 'status' => '']],
        ];
    }

    public function testMetodoPostRetorna405(): void
    {
        $usuario = $this->cadastrarELogar();

        $resposta = $this->http->post(self::ROTA, [
            'json'    => ['id_reserva' => 1, 'status' => 'cancelada'],
            'headers' => ['Authorization' => 'Bearer ' . $usuario['token']],
        ]);

        $this->assertSame(405, $resposta->getStatusCode(), (string) $resposta->getBody());
    }

    // ---------- Proteção por token (PENDENTE) ----------
    // O update.php não valida o JWT: qualquer pessoa altera o status de qualquer reserva sem login.
    // Quando for corrigido, apague a linha do markTestIncomplete.

    public function testSemTokenRetorna401(): void
    {
        $this->markTestIncomplete('Pendente: update.php ainda não valida o JWT e responde 200 sem token.');

        $ctx = $this->prepararReservaAtiva();

        $resposta = $this->atualizarReserva(['id_reserva' => $ctx['id_reserva'], 'status' => 'cancelada']);

        $this->assertSame(401, $resposta->getStatusCode(), (string) $resposta->getBody());
    }

    // ---------- Auxiliares ----------

    /** Cadastra e loga um usuário, cria livro e exemplar e reserva o livro; devolve os ids e o token. */
    private function prepararReservaAtiva(): array
    {
        $usuario = $this->cadastrarELogar();
        $idLivro = $this->criarLivro();
        $exemplar = $this->criarExemplar($idLivro);
        $reserva = $this->criarReserva($usuario['token'], $idLivro);

        return [
            'token'       => $usuario['token'],
            'id_pessoa'   => (int) $usuario['usuario']['id_pessoa'],
            'id_livro'    => $idLivro,
            'id_exemplar' => $exemplar['id_exemplar'],
            'id_reserva'  => $reserva['id_reserva'],
        ];
    }
}