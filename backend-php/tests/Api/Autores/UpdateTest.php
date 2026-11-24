<?php

declare(strict_types=1);

namespace Tests\Api\Autores;

use PHPUnit\Framework\Attributes\DataProvider;
use Psr\Http\Message\ResponseInterface;
use Tests\Support\AuthHelpers;
use Tests\Support\AutorHelpers;
use Tests\Support\TestCase;

/**
 * api/autores/update.php
 *
 * O endpoint so verifica se id_autor e nome_autor foram enviados (isset).
 * Id inexistente e nome igual ao anterior caem no mesmo caminho: 200 com status "aviso".
 */
final class UpdateTest extends TestCase
{
    use AuthHelpers; // fornece corpo()
    use AutorHelpers;

    private function atualizarAutor(int $id, string $nome): ResponseInterface
    {
        return $this->http->put('/api/autores/update.php', [
            'json' => ['id_autor' => $id, 'nome_autor' => $nome],
        ]);
    }

    private function nomeDoAutor(int $id): string
    {
        return $this->corpo($this->buscarAutor($id))['dados']['nome_autor'];
    }

    // ---------- Atualizacao valida ----------

    public function testAtualizacaoValidaRetorna200ETrocaONome(): void
    {
        $id = $this->criarAutor('Nome Antigo');

        $resposta = $this->atualizarAutor($id, 'Nome Novo');
        $corpo = $this->corpo($resposta);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('sucesso', $corpo['status']);
        $this->assertNull($corpo['dados']);
        $this->assertSame('Nome Novo', $this->nomeDoAutor($id));
    }

    public function testAtualizacaoNaoAfetaOutrosAutores(): void
    {
        $idAlterado = $this->criarAutor('Autor Alterado');
        $idIntacto = $this->criarAutor('Autor Intacto');

        $this->atualizarAutor($idAlterado, 'Autor Alterado Novo');

        $this->assertSame('Autor Intacto', $this->nomeDoAutor($idIntacto));
    }

    public function testAtualizacaoComONomeIgualDevolveAvisoENaoAlteraNada(): void
    {
        $id = $this->criarAutor('Nome Igual');

        $resposta = $this->atualizarAutor($id, 'Nome Igual');
        $corpo = $this->corpo($resposta);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('aviso', $corpo['status']);
        $this->assertNull($corpo['dados']);
        $this->assertSame('Nome Igual', $this->nomeDoAutor($id));
    }

    // ---------- Campos obrigatorios ----------

    #[DataProvider('payloadsIncompletos')]
    public function testAtualizacaoComPayloadIncompletoRetorna400(array $dados): void
    {
        $resposta = $this->http->put('/api/autores/update.php', ['json' => (object) $dados]);
        $corpo = $this->corpo($resposta);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertNull($corpo['dados']);
    }

    public static function payloadsIncompletos(): array
    {
        return [
            'sem id_autor'    => [['nome_autor' => 'Nome Qualquer']],
            'sem nome_autor'  => [['id_autor' => self::ID_AUTOR_DO_SEED]],
            'nome_autor nulo' => [['id_autor' => self::ID_AUTOR_DO_SEED, 'nome_autor' => null]],
            'id_autor nulo'   => [['id_autor' => null, 'nome_autor' => 'Nome Qualquer']],
        ];
    }

    public function testCorpoVazioRetorna400(): void
    {
        $resposta = $this->http->put('/api/autores/update.php', [
            'headers' => ['Content-Type' => 'application/json'],
            'body'    => '',
        ]);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $this->corpo($resposta)['status']);
    }

    // ---------- Metodo HTTP errado ----------

    public function testMetodoGetRetorna405(): void
    {
        $resposta = $this->http->get('/api/autores/update.php');

        $this->assertSame(405, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $this->corpo($resposta)['status']);
    }

    // ---------- Falhas conhecidas (pendentes) ----------

    public function testAutorInexistenteRetorna404(): void
    {
        $this->markTestIncomplete(
            'update.php devolve 200 com status "aviso" ("Nenhuma alteracao realizada") para um id '
            . 'inexistente, o mesmo retorno de quando o nome e igual ao anterior. O esperado e 404. '
            . 'Corrigir em issue futura.'
        );

        $resposta = $this->atualizarAutor(999999, 'Nome Qualquer');

        $this->assertSame(404, $resposta->getStatusCode(), (string) $resposta->getBody());
    }

    public function testNomeVazioRetorna400(): void
    {
        $this->markTestIncomplete(
            'update.php so verifica isset: um nome vazio passa e grava o autor com nome em branco, '
            . 'diferente do create.php, que rejeita nome vazio com 400. O esperado e 400. '
            . 'Corrigir em issue futura.'
        );

        $id = $this->criarAutor('Nome Original');

        $resposta = $this->atualizarAutor($id, '');

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
    }
}
