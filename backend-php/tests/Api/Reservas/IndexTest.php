<?php

declare(strict_types=1);

namespace Tests\Api\Reservas;

use Tests\Support\AuthHelpers;
use Tests\Support\ExemplarHelpers;
use Tests\Support\LivroHelpers;
use Tests\Support\ReservaHelpers;
use Tests\Support\TestCase;

final class IndexTest extends TestCase
{
    use AuthHelpers;
    use ExemplarHelpers;
    use LivroHelpers;
    use ReservaHelpers;

    private const ROTA = '/api/reservas/index.php';

    // ---------- Listagem ----------

    public function testListagemMostraOsDadosDaReserva(): void
    {
        $usuario = $this->cadastrarELogar();
        $idPessoa = (int) $usuario['usuario']['id_pessoa'];
        $idLivro = $this->criarLivro(['titulo' => 'Livro de Teste']);
        $exemplar = $this->criarExemplar($idLivro);
        $reserva = $this->criarReserva($usuario['token'], $idLivro);

        $reservas = $this->listarReservas($usuario['token'], ['id_pessoa' => $idPessoa]);

        $this->assertCount(1, $reservas);
        $this->assertEquals($reserva['id_reserva'], $reservas[0]['id_reserva']);
        $this->assertEquals($idLivro, $reservas[0]['id_livro']);
        $this->assertEquals($idPessoa, $reservas[0]['id_pessoa']);
        $this->assertEquals($exemplar['id_exemplar'], $reservas[0]['id_exemplar']);
        $this->assertSame('Livro de Teste', $reservas[0]['titulo']);
        $this->assertSame($this->dadosUsuario()['nome'], $reservas[0]['nome_pessoa']);
        $this->assertSame('ativa', $reservas[0]['status']);
        $this->assertSame($reserva['data_expiracao'], $reservas[0]['data_expiracao']);
        $this->assertArrayHasKey('data_reserva', $reservas[0]);
    }

    public function testListagemSemFiltroIncluiAsReservasDeTodasAsPessoas(): void
    {
        $primeiro = $this->cadastrarELogarUsuario(1);
        $segundo = $this->cadastrarELogarUsuario(2);
        $livroA = $this->criarLivro(['titulo' => 'Livro de Teste A']);
        $livroB = $this->criarLivro(['titulo' => 'Livro de Teste B']);
        $this->criarExemplar($livroA);
        $this->criarExemplar($livroB);
        $reservaA = $this->criarReserva($primeiro['token'], $livroA);
        $reservaB = $this->criarReserva($segundo['token'], $livroB);

        $ids = array_map('intval', array_column($this->listarReservas($primeiro['token']), 'id_reserva'));

        $this->assertContains($reservaA['id_reserva'], $ids);
        $this->assertContains($reservaB['id_reserva'], $ids);
    }

    // ---------- Filtro por pessoa ----------

    public function testFiltroPorPessoaRetornaSoAsReservasDela(): void
    {
        $primeiro = $this->cadastrarELogarUsuario(1);
        $segundo = $this->cadastrarELogarUsuario(2);
        $livroA = $this->criarLivro(['titulo' => 'Livro de Teste A']);
        $livroB = $this->criarLivro(['titulo' => 'Livro de Teste B']);
        $this->criarExemplar($livroA);
        $this->criarExemplar($livroB);
        $reservaDoPrimeiro = $this->criarReserva($primeiro['token'], $livroA);
        $this->criarReserva($segundo['token'], $livroB);

        $reservas = $this->listarReservas(
            $primeiro['token'],
            ['id_pessoa' => (int) $primeiro['usuario']['id_pessoa']]
        );

        $this->assertSame([$reservaDoPrimeiro['id_reserva']], array_map('intval', array_column($reservas, 'id_reserva')));
    }

    public function testPessoaComVariasReservasTodasAparecemNoFiltro(): void
    {
        $usuario = $this->cadastrarELogar();
        $livroA = $this->criarLivro(['titulo' => 'Livro de Teste A']);
        $livroB = $this->criarLivro(['titulo' => 'Livro de Teste B']);
        $this->criarExemplar($livroA);
        $this->criarExemplar($livroB);
        $this->criarReserva($usuario['token'], $livroA);
        $this->criarReserva($usuario['token'], $livroB);

        $reservas = $this->listarReservas(
            $usuario['token'],
            ['id_pessoa' => (int) $usuario['usuario']['id_pessoa']]
        );

        $this->assertCount(2, $reservas);
    }

    public function testPessoaSemReservasRetornaListaVazia(): void
    {
        $usuario = $this->cadastrarELogar();

        $resposta = $this->buscarReservas(
            ['id_pessoa' => (int) $usuario['usuario']['id_pessoa']],
            $usuario['token']
        );
        $corpo = $this->corpo($resposta);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('sucesso', $corpo['status']);
        $this->assertSame([], $corpo['dados']);
    }

    public function testPessoaInexistenteRetornaListaVazia(): void
    {
        $usuario = $this->cadastrarELogar();

        $this->assertSame([], $this->listarReservas($usuario['token'], ['id_pessoa' => 999999]));
    }

    // ---------- Proteção por token e método (PENDENTE) ----------
    // O index.php não valida o JWT nem o método HTTP: qualquer pessoa lista as reservas de todos
    // (nome e livros) sem login, e um POST também responde 200.
    // Quando for corrigido, apague a linha do markTestIncomplete de cada teste.

    public function testSemTokenRetorna401(): void
    {
        $this->markTestIncomplete('Pendente: index.php ainda não valida o JWT e responde 200 sem token.');

        $resposta = $this->buscarReservas();

        $this->assertSame(401, $resposta->getStatusCode(), (string) $resposta->getBody());
    }

    public function testMetodoPostRetorna405(): void
    {
        $this->markTestIncomplete('Pendente: index.php não valida o método HTTP e responde 200 para POST.');

        $usuario = $this->cadastrarELogar();

        $resposta = $this->http->post(self::ROTA, [
            'headers' => ['Authorization' => 'Bearer ' . $usuario['token']],
        ]);

        $this->assertSame(405, $resposta->getStatusCode(), (string) $resposta->getBody());
    }
}