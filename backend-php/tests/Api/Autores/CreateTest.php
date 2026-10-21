<?php

declare(strict_types=1);

namespace Tests\Api\Autores;

use PHPUnit\Framework\Attributes\DataProvider;
use Tests\Support\AuthHelpers;
use Tests\Support\AutorHelpers;
use Tests\Support\TestCase;

/**
 * api/autores/create.php
 *
 * Duplicidade nao e testada: a tabela autor nao tem UNIQUE e o codigo nao tem essa regra.
 */
final class CreateTest extends TestCase
{
    use AuthHelpers; // fornece corpo()
    use AutorHelpers;

    // ---------- Cadastro valido ----------

    public function testCadastroValidoRetorna201EOIdDoAutor(): void
    {
        $resposta = $this->cadastrarAutor();
        $corpo = $this->corpo($resposta);

        $this->assertSame(201, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('sucesso', $corpo['status']);
        $this->assertGreaterThan(0, (int) $corpo['dados']['id']);
    }

    public function testAutorCadastradoApareceNaConsultaPorId(): void
    {
        $id = $this->criarAutor('Autor Unico de Teste');

        $resposta = $this->buscarAutor($id);
        $autor = $this->corpo($resposta)['dados'];

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertEquals($id, $autor['id_autor']);
        $this->assertSame('Autor Unico de Teste', $autor['nome_autor']);
    }

    // ---------- Validacao do nome ----------

    #[DataProvider('payloadsSemNomeValido')]
    public function testCadastroSemNomeValidoRetorna400(array $dados): void
    {
        $resposta = $this->http->post('/api/autores/create.php', ['json' => (object) $dados]);
        $corpo = $this->corpo($resposta);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertNull($corpo['dados']);
    }

    public static function payloadsSemNomeValido(): array
    {
        return [
            'sem o campo nome_autor' => [[]],
            'nome_autor nulo'        => [['nome_autor' => null]],
            'nome_autor vazio'       => [['nome_autor' => '']],
        ];
    }

    public function testCorpoVazioRetorna400(): void
    {
        $resposta = $this->http->post('/api/autores/create.php', [
            'headers' => ['Content-Type' => 'application/json'],
            'body'    => '',
        ]);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $this->corpo($resposta)['status']);
    }

    // ---------- Metodo HTTP errado ----------

    public function testMetodoGetRetorna405(): void
    {
        $resposta = $this->http->get('/api/autores/create.php');

        $this->assertSame(405, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $this->corpo($resposta)['status']);
    }

    // ---------- Falha conhecida (pendente) ----------

    public function testNomeSoComEspacosRetorna400(): void
    {
        $this->markTestIncomplete(
            'create.php aceita um nome formado so por espacos (empty("   ") e falso) e cadastra o autor '
            . 'com nome em branco. O esperado e 400. Corrigir em issue futura.'
        );

        $resposta = $this->cadastrarAutor('   ');

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
    }
}
