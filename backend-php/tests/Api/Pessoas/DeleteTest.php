<?php

declare(strict_types=1);

namespace Tests\Api\Pessoas;

use Psr\Http\Message\ResponseInterface;
use Tests\Support\AuthHelpers;
use Tests\Support\PessoaHelpers;
use Tests\Support\TestCase;

/**
 * api/pessoas/delete.php
 *
 * O id vem pela URL (?id=). Pessoa com login (usuario_sistema) ou emprestimos nao pode ser excluida (409).
 * Toda pessoa criada pela API tem login, entao o caminho de sucesso usa uma pessoa sem login
 * inserida direto no banco de teste (inserirPessoaSemLogin).
 */
final class DeleteTest extends TestCase
{
    use AuthHelpers; // fornece corpo()
    use PessoaHelpers;

    private function excluirPessoa(int $id): ResponseInterface
    {
        return $this->http->delete('/api/pessoas/delete.php', ['query' => ['id' => $id]]);
    }

    // ---------- Exclusao valida ----------

    public function testExclusaoDePessoaSemLoginRetorna200ERemoveAPessoa(): void
    {
        $id = $this->inserirPessoaSemLogin();

        $resposta = $this->excluirPessoa($id);
        $corpo = $this->corpo($resposta);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('sucesso', $corpo['status']);
        $this->assertNull($corpo['dados']);

        // Depois de excluida, a consulta por id devolve o aviso de "nenhuma pessoa encontrada".
        $this->assertSame([], $this->corpo($this->buscarPessoa($id))['dados']);
    }

    public function testExclusaoNaoAfetaOutrasPessoas(): void
    {
        $idExcluida = $this->inserirPessoaSemLogin();
        $idIntacta = $this->criarPessoa();

        $this->excluirPessoa($idExcluida);

        $resposta = $this->buscarPessoa($idIntacta);
        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertEquals($idIntacta, $this->corpo($resposta)['dados']['id_pessoa']);
    }

    // ---------- Pessoa com login (409) ----------

    public function testPessoaComLoginRetorna409ENaoEExcluida(): void
    {
        $id = $this->criarPessoa();

        $resposta = $this->excluirPessoa($id);
        $corpo = $this->corpo($resposta);

        $this->assertSame(409, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertNull($corpo['dados']);
        $this->assertEquals($id, $this->corpo($this->buscarPessoa($id))['dados']['id_pessoa']);
    }

    // ---------- Pessoa inexistente ----------

    public function testPessoaInexistenteRetorna404(): void
    {
        $resposta = $this->excluirPessoa(999999);
        $corpo = $this->corpo($resposta);

        $this->assertSame(404, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertNull($corpo['dados']);
    }

    // ---------- Id nao informado ----------

    public function testSemIdRetorna400(): void
    {
        $resposta = $this->http->delete('/api/pessoas/delete.php');
        $corpo = $this->corpo($resposta);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertNull($corpo['dados']);
    }

    public function testIdNoCorpoEmVezDaUrlRetorna400ENaoExcluiNada(): void
    {
        $id = $this->inserirPessoaSemLogin();

        $resposta = $this->http->delete('/api/pessoas/delete.php', ['json' => ['id_pessoa' => $id]]);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertEquals($id, $this->corpo($this->buscarPessoa($id))['dados']['id_pessoa']);
    }

    // ---------- Metodo HTTP errado ----------

    public function testMetodoGetRetorna405ENaoExcluiNada(): void
    {
        $id = $this->inserirPessoaSemLogin();

        $resposta = $this->http->get('/api/pessoas/delete.php', ['query' => ['id' => $id]]);

        $this->assertSame(405, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $this->corpo($resposta)['status']);
        $this->assertEquals($id, $this->corpo($this->buscarPessoa($id))['dados']['id_pessoa']);
    }
}
