<?php

declare(strict_types=1);

namespace Tests\Api\Autores;

use Psr\Http\Message\ResponseInterface;
use Tests\Support\AuthHelpers;
use Tests\Support\AutorHelpers;
use Tests\Support\TestCase;

/**
 * api/autores/index.php
 *
 * Busca por nome nao e testada: o endpoint nao tem busca (so listagem e ?id=).
 * "Lista vazia" nao e testada: os autores do seed tem livros vinculados e nao ha como apaga-los.
 */
final class IndexTest extends TestCase
{
    use AuthHelpers; // fornece corpo()
    use AutorHelpers;

    private function listar(): ResponseInterface
    {
        return $this->http->get('/api/autores/index.php');
    }

    /** @return array[] lista de autores devolvida pela API */
    private function autoresDaLista(ResponseInterface $resposta): array
    {
        $dados = $this->corpo($resposta)['dados'];

        $this->assertIsArray($dados, 'A resposta deveria trazer uma lista: ' . (string) $resposta->getBody());

        return $dados;
    }

    // ---------- Listagem ----------

    public function testListagemRetorna200ComOsCamposDoAutor(): void
    {
        $resposta = $this->listar();
        $corpo = $this->corpo($resposta);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('sucesso', $corpo['status']);
        $this->assertNotEmpty($corpo['dados'], 'O seed deveria trazer autores.');
        $this->assertArrayHasKey('id_autor', $corpo['dados'][0]);
        $this->assertArrayHasKey('nome_autor', $corpo['dados'][0]);
    }

    public function testListagemTrazOsAutoresDoSeed(): void
    {
        $nomes = array_column($this->autoresDaLista($this->listar()), 'nome_autor');

        $this->assertContains(self::NOME_AUTOR_DO_SEED, $nomes);
    }

    public function testListagemIncluiAutorRecemCadastrado(): void
    {
        $antes = count($this->autoresDaLista($this->listar()));

        $id = $this->criarAutor('Autor Recem Cadastrado');

        $lista = $this->autoresDaLista($this->listar());
        $this->assertCount($antes + 1, $lista);
        $this->assertContains($id, array_map('intval', array_column($lista, 'id_autor')));
    }

    public function testListagemVemOrdenadaPorNomeCrescente(): void
    {
        // Criados fora de ordem de proposito.
        $idZ = $this->criarAutor('Zzzz Teste de Ordem');
        $idA = $this->criarAutor('Aaaa Teste de Ordem');

        $ids = array_map('intval', array_column($this->autoresDaLista($this->listar()), 'id_autor'));

        $this->assertLessThan(
            array_search($idZ, $ids, true),
            array_search($idA, $ids, true),
            'O autor "Aaaa..." deveria vir antes do "Zzzz...".'
        );
    }

    // ---------- Consulta por id ----------

    public function testConsultaPorIdRetornaUmObjetoComOsCamposDoAutor(): void
    {
        $id = $this->criarAutor('Autor de Consulta');

        $resposta = $this->buscarAutor($id);
        $corpo = $this->corpo($resposta);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('sucesso', $corpo['status']);
        $this->assertArrayHasKey('nome_autor', $corpo['dados'], 'Com ?id= a API devolve um objeto, nao uma lista.');
        $this->assertEquals($id, $corpo['dados']['id_autor']);
        $this->assertSame('Autor de Consulta', $corpo['dados']['nome_autor']);
    }

    public function testConsultaPorIdInexistenteRetorna404(): void
    {
        $resposta = $this->buscarAutor(999999);
        $corpo = $this->corpo($resposta);

        $this->assertSame(404, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertNull($corpo['dados']);
    }

    // ---------- Metodo HTTP errado ----------

    public function testMetodoPostRetorna405(): void
    {
        $resposta = $this->http->post('/api/autores/index.php');

        $this->assertSame(405, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $this->corpo($resposta)['status']);
    }
}
