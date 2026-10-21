<?php

declare(strict_types=1);

namespace Tests\Api\Autores;

use Psr\Http\Message\ResponseInterface;
use Tests\Support\AuthHelpers;
use Tests\Support\AutorHelpers;
use Tests\Support\LivroHelpers;
use Tests\Support\TestCase;

/**
 * api/autores/delete.php
 *
 * O id vem pela URL (?id=), nao pelo corpo. Autor com livro vinculado nao pode ser excluido (409).
 */
final class DeleteTest extends TestCase
{
    use AuthHelpers; // fornece corpo()
    use AutorHelpers;
    use LivroHelpers; // usado para vincular um livro a um autor

    private function excluirAutor(int $id): ResponseInterface
    {
        return $this->http->delete('/api/autores/delete.php', ['query' => ['id' => $id]]);
    }

    // ---------- Exclusao valida ----------

    public function testExclusaoValidaRetorna200ERemoveOAutor(): void
    {
        $id = $this->criarAutor('Autor Para Excluir');

        $resposta = $this->excluirAutor($id);
        $corpo = $this->corpo($resposta);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('sucesso', $corpo['status']);
        $this->assertNull($corpo['dados']);

        // Depois de excluido, o autor nao existe mais.
        $this->assertSame(404, $this->buscarAutor($id)->getStatusCode());
    }

    public function testExclusaoNaoAfetaOutrosAutores(): void
    {
        $idExcluido = $this->criarAutor('Autor Excluido');
        $idIntacto = $this->criarAutor('Autor Intacto');

        $this->excluirAutor($idExcluido);

        $resposta = $this->buscarAutor($idIntacto);
        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('Autor Intacto', $this->corpo($resposta)['dados']['nome_autor']);
    }

    // ---------- Autor inexistente ----------

    public function testAutorInexistenteRetorna404(): void
    {
        $resposta = $this->excluirAutor(999999);
        $corpo = $this->corpo($resposta);

        $this->assertSame(404, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertNull($corpo['dados']);
    }

    // ---------- Id nao informado ----------

    public function testSemIdRetorna400(): void
    {
        $resposta = $this->http->delete('/api/autores/delete.php');
        $corpo = $this->corpo($resposta);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertNull($corpo['dados']);
    }

    public function testIdNoCorpoEmVezDaUrlRetorna400ENaoExcluiNada(): void
    {
        $id = $this->criarAutor('Autor Com Id No Corpo');

        $resposta = $this->http->delete('/api/autores/delete.php', ['json' => ['id_autor' => $id]]);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame(200, $this->buscarAutor($id)->getStatusCode(), 'O autor nao deveria ter sido excluido.');
    }

    // ---------- Autor com livro vinculado ----------

    public function testAutorComLivroVinculadoRetorna409ENaoEExcluido(): void
    {
        $idAutor = $this->criarAutor('Autor Com Livro');
        $this->criarLivro(['autores' => [$idAutor]]);

        $resposta = $this->excluirAutor($idAutor);
        $corpo = $this->corpo($resposta);

        $this->assertSame(409, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertNull($corpo['dados']);
        $this->assertSame(200, $this->buscarAutor($idAutor)->getStatusCode(), 'O autor deveria continuar existindo.');
    }

    // ---------- Metodo HTTP errado ----------

    public function testMetodoGetRetorna405ENaoExcluiNada(): void
    {
        $id = $this->criarAutor('Autor Para o Teste de Metodo');

        $resposta = $this->http->get('/api/autores/delete.php', ['query' => ['id' => $id]]);

        $this->assertSame(405, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $this->corpo($resposta)['status']);
        $this->assertSame(200, $this->buscarAutor($id)->getStatusCode(), 'O autor nao deveria ter sido excluido.');
    }
}
