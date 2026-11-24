<?php

declare(strict_types=1);

namespace Tests\Api\Assuntos;

use Tests\Support\AssuntoHelpers;
use Tests\Support\TestCase;

final class IndexTest extends TestCase
{
    use AssuntoHelpers;

    private const ROTA = '/api/assuntos/index.php';

    // ---------- Listagem ----------

    public function testListagemRetornaOsAssuntosDoSeed(): void
    {
        $resposta = $this->http->get(self::ROTA);
        $corpo = $this->corpo($resposta);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('sucesso', $corpo['status']);
        $this->assertIsArray($corpo['dados']);
        $this->assertNotEmpty($corpo['dados'], 'O seed deveria ter inserido assuntos.');
    }

    public function testCadaAssuntoTemIdENome(): void
    {
        foreach ($this->listarAssuntos() as $assunto) {
            $this->assertArrayHasKey('id_assunto', $assunto);
            $this->assertArrayHasKey('nome_assunto', $assunto);
        }
    }

    public function testAssuntoCriadoApareceNaListagem(): void
    {
        $antes = count($this->listarAssuntos());

        $this->garantirAssuntoCriado('Assunto de Teste');

        $depois = $this->listarAssuntos();
        $this->assertCount($antes + 1, $depois);
        $this->assertContains('Assunto de Teste', array_column($depois, 'nome_assunto'));
    }

    public function testListagemVemOrdenadaPeloNome(): void
    {
        // Criados fora de ordem; nomes só com letras ASCII para não depender da collation do MySQL.
        $this->garantirAssuntoCriado('ZZ Assunto de Teste');
        $this->garantirAssuntoCriado('AA Assunto de Teste');

        $nomes = array_column($this->listarAssuntos(), 'nome_assunto');

        $this->assertContains('AA Assunto de Teste', $nomes);
        $this->assertContains('ZZ Assunto de Teste', $nomes);
        $this->assertLessThan(
            array_search('ZZ Assunto de Teste', $nomes, true),
            array_search('AA Assunto de Teste', $nomes, true)
        );
    }

    // ---------- Método ----------

    public function testListagemComMetodoPostRetorna405(): void
    {
        $resposta = $this->http->post(self::ROTA);

        $this->assertSame(405, $resposta->getStatusCode(), (string) $resposta->getBody());
    }
}