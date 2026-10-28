<?php

declare(strict_types=1);

namespace Tests\Api\Emprestimos;

use PHPUnit\Framework\Attributes\DataProvider;
use Tests\Support\AuthHelpers;
use Tests\Support\EmprestimoHelpers;
use Tests\Support\ExemplarHelpers;
use Tests\Support\LivroHelpers;
use Tests\Support\PessoaHelpers;
use Tests\Support\TestCase;

/**
 * api/emprestimos/emprestar.php
 *
 * Limite de emprestimos por pessoa nao e testado: o codigo nao tem essa regra.
 * Na API de teste o SMTP e falso (MAIL_* no tests/subir-api-teste.sh): o envio do e-mail falha,
 * e a falha nao deve impedir o emprestimo.
 */
final class EmprestarTest extends TestCase
{
    use AuthHelpers; // fornece corpo()
    use PessoaHelpers;
    use LivroHelpers;
    use ExemplarHelpers;
    use EmprestimoHelpers;

    // ---------- Emprestimo valido ----------

    public function testEmprestimoValidoRetorna201EOIdDoEmprestimo(): void
    {
        $idPessoa = $this->criarPessoa();
        $idExemplar = $this->criarExemplarDisponivel();

        $resposta = $this->emprestarExemplar($idExemplar, $idPessoa);
        $corpo = $this->corpo($resposta);

        $this->assertSame(201, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('sucesso', $corpo['status']);
        $this->assertGreaterThan(0, (int) $corpo['dados']['id_emprestimo']);
    }

    public function testEmprestimoMarcaOExemplarComoEmprestado(): void
    {
        $idPessoa = $this->criarPessoa();
        $idExemplar = $this->criarExemplarDisponivel();

        $this->assertSame('disponivel', $this->disponibilidadeDoExemplar($idExemplar));

        $this->emprestarExemplar($idExemplar, $idPessoa);

        $this->assertSame('emprestado', $this->disponibilidadeDoExemplar($idExemplar));
    }

    public function testEmprestimoGravaAsDatasEOsVinculos(): void
    {
        $prevista = $this->dataEmDias(10);

        $emprestimo = $this->criarEmprestimo(['data_prevista' => $prevista]);
        $registro = $this->emprestimoNoBanco($emprestimo['id_emprestimo']);

        $this->assertSame($this->dataEmDias(0), $registro['data_emprestimo']);
        $this->assertSame($prevista, $registro['data_prevista']);
        $this->assertNull($registro['data_devolucao']);
        $this->assertEquals($emprestimo['id_exemplar'], $registro['id_exemplar']);
        $this->assertEquals($emprestimo['id_pessoa'], $registro['id_pessoa']);
    }

    public function testFalhaNoEnvioDoEmailNaoImpedeOEmprestimoEFicaRegistrada(): void
    {
        $emprestimo = $this->criarEmprestimo();

        $notificacoes = $this->notificacoesDoEmprestimo($emprestimo['id_emprestimo']);

        $this->assertCount(1, $notificacoes);
        $this->assertSame('emprestimo', $notificacoes[0]['tipo_notificacao']);
        $this->assertSame('erro', $notificacoes[0]['status']);
    }

    // ---------- Campos obrigatorios ----------

    #[DataProvider('camposObrigatorios')]
    public function testEmprestimoSemCampoObrigatorioRetorna400(string $campo): void
    {
        $dados = $this->dadosEmprestimo(1, 1);
        unset($dados[$campo]);

        $resposta = $this->http->post('/api/emprestimos/emprestar.php', ['json' => $dados]);
        $corpo = $this->corpo($resposta);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertNull($corpo['dados']);
    }

    public static function camposObrigatorios(): array
    {
        return [
            'id_exemplar'   => ['id_exemplar'],
            'id_pessoa'     => ['id_pessoa'],
            'data_prevista' => ['data_prevista'],
        ];
    }

    // ---------- Exemplar inexistente ou indisponivel ----------

    public function testExemplarInexistenteRetorna404ENaoCriaEmprestimo(): void
    {
        $idPessoa = $this->criarPessoa();

        $resposta = $this->emprestarExemplar(999999, $idPessoa);
        $corpo = $this->corpo($resposta);

        $this->assertSame(404, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertNull($corpo['dados']);
        $this->assertSame([], $this->corpo($this->listarEmprestimos())['dados']);
    }

    public function testExemplarJaEmprestadoRetorna409ENaoCriaOutroEmprestimo(): void
    {
        $primeiro = $this->criarEmprestimo();
        $idOutraPessoa = $this->criarPessoa($this->dadosOutraPessoa(2));

        $resposta = $this->emprestarExemplar($primeiro['id_exemplar'], $idOutraPessoa);
        $corpo = $this->corpo($resposta);

        $this->assertSame(409, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertNull($corpo['dados']);

        $lista = $this->corpo($this->listarEmprestimos(['id_exemplar' => $primeiro['id_exemplar']]))['dados'];
        $this->assertCount(1, $lista);
    }

    public function testExemplarReservadoRetorna409ENaoMudaADisponibilidade(): void
    {
        $idPessoa = $this->criarPessoa();
        $idExemplar = $this->criarExemplarDisponivel();
        $this->definirDisponibilidadeDoExemplar($idExemplar, 'reservado');

        $resposta = $this->emprestarExemplar($idExemplar, $idPessoa);

        $this->assertSame(409, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $this->corpo($resposta)['status']);
        $this->assertSame('reservado', $this->disponibilidadeDoExemplar($idExemplar));
    }

    // ---------- Metodo HTTP errado ----------

    public function testMetodoGetRetorna405(): void
    {
        $resposta = $this->http->get('/api/emprestimos/emprestar.php');

        $this->assertSame(405, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $this->corpo($resposta)['status']);
    }

    // ---------- Falhas conhecidas (pendentes) ----------

    public function testPessoaInexistenteRetorna404(): void
    {
        $this->markTestIncomplete(
            'emprestar.php nao verifica se a pessoa existe: a chave estrangeira falha e a API devolve '
            . '500 com a mensagem do banco. O esperado e 404. Corrigir em issue futura.'
        );

        $idExemplar = $this->criarExemplarDisponivel();

        $resposta = $this->emprestarExemplar($idExemplar, 999999);

        $this->assertSame(404, $resposta->getStatusCode(), (string) $resposta->getBody());
    }

    public function testDataPrevistaNoPassadoRetorna400(): void
    {
        $this->markTestIncomplete(
            'emprestar.php nao valida data_prevista: uma data no passado e aceita e o emprestimo ja '
            . 'nasce atrasado. O esperado e 400. Corrigir em issue futura.'
        );

        $idPessoa = $this->criarPessoa();
        $idExemplar = $this->criarExemplarDisponivel();

        $resposta = $this->emprestarExemplar($idExemplar, $idPessoa, ['data_prevista' => $this->dataEmDias(-5)]);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
    }

    public function testDataPrevistaInvalidaRetorna400(): void
    {
        $this->markTestIncomplete(
            'emprestar.php nao valida o formato de data_prevista: um valor que nao e data chega ao '
            . 'banco e provavelmente vira 500 com a mensagem do MySQL. O esperado e 400. '
            . 'Corrigir em issue futura.'
        );

        $idPessoa = $this->criarPessoa();
        $idExemplar = $this->criarExemplarDisponivel();

        $resposta = $this->emprestarExemplar($idExemplar, $idPessoa, ['data_prevista' => 'nao-e-uma-data']);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
    }
}
