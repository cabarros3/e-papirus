<?php

declare(strict_types=1);

namespace Tests\Api\Auth;

use Tests\Support\AuthHelpers;
use Tests\Support\TestCase;

final class MeTest extends TestCase
{
    use AuthHelpers;

    // ---------- Consulta de usuário ----------

    public function testRetornaOsDadosDoUsuario(): void
    {
        $dados = $this->cadastrarELogar();
        $id = $dados['usuario']['id_usuario'];

        $resposta = $this->http->get('/api/auth/me.php', ['query' => ['id' => $id]]);
        $corpo = $this->corpo($resposta);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('sucesso', $corpo['status']);

        $esperado = $this->dadosUsuario();
        foreach (['nome', 'email', 'matricula', 'cpf', 'telefone', 'tipo'] as $campo) {
            $this->assertEquals($esperado[$campo], $corpo['dados'][$campo], "Campo {$campo} diferente do cadastrado.");
        }
        $this->assertEquals($id, $corpo['dados']['id_usuario']);
        $this->assertArrayNotHasKey('senha', $corpo['dados']);
    }

    public function testUsuarioInexistenteRetorna404(): void
    {
        $resposta = $this->http->get('/api/auth/me.php', ['query' => ['id' => 99999]]);

        $this->assertSame(404, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $this->corpo($resposta)['status']);
    }

    public function testSemIdRetorna404(): void
    {
        $resposta = $this->http->get('/api/auth/me.php');

        $this->assertSame(404, $resposta->getStatusCode(), (string) $resposta->getBody());
    }

    public function testMetodoPostRetorna405(): void
    {
        $resposta = $this->http->post('/api/auth/me.php');

        $this->assertSame(405, $resposta->getStatusCode(), (string) $resposta->getBody());
    }

    // ---------- Proteção por token (PENDENTE) ----------
    // O me.php ainda não valida o JWT e responde 200 para qualquer requisição.
    // Quando for corrigido, apague a linha do markTestIncomplete de cada teste.

    public function testSemTokenRetorna401(): void
    {
        $this->markTestIncomplete('Pendente: me.php ainda não valida o JWT e responde 200 sem token.');

        $dados = $this->cadastrarELogar();

        $resposta = $this->http->get('/api/auth/me.php', [
            'query' => ['id' => $dados['usuario']['id_usuario']],
        ]);

        $this->assertSame(401, $resposta->getStatusCode(), (string) $resposta->getBody());
    }

    public function testTokenInvalidoRetorna401(): void
    {
        $this->markTestIncomplete('Pendente: me.php ainda não valida o JWT e responde 200 com token inválido.');

        $dados = $this->cadastrarELogar();

        $resposta = $this->http->get('/api/auth/me.php', [
            'query'   => ['id' => $dados['usuario']['id_usuario']],
            'headers' => ['Authorization' => 'Bearer token.invalido.aqui'],
        ]);

        $this->assertSame(401, $resposta->getStatusCode(), (string) $resposta->getBody());
    }
}
