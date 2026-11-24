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
 * api/emprestimos/devolver.php
 *
 * Devolucao em atraso: hoje > data_prevista. No proprio dia do vencimento nao e atraso.
 * Emprestimos ja vencidos sao inseridos direto no banco de teste (criarEmprestimoAtrasado),
 * porque emprestar.php aceita datas no passado hoje, mas isso pode mudar quando for validado.
 * O e-mail de "reserva disponivel" nao e testado aqui (depende de envio de e-mail).
 */
final class DevolverTest extends TestCase
{
    use AuthHelpers; // fornece corpo()
    use PessoaHelpers;
    use LivroHelpers;
    use ExemplarHelpers;
    use EmprestimoHelpers;

    // ---------- Devolucao valida ----------

    public function testDevolucaoNoPrazoRetorna200GravaADataELiberaOExemplar(): void
    {
        $emprestimo = $this->criarEmprestimo();

        $resposta = $this->devolverEmprestimo($emprestimo['id_emprestimo']);
        $corpo = $this->corpo($resposta);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('sucesso', $corpo['status']);
        $this->assertNull($corpo['dados']);
        $this->assertStringNotContainsString('atraso', $corpo['mensagem']);

        $registro = $this->emprestimoNoBanco($emprestimo['id_emprestimo']);
        $this->assertSame($this->dataEmDias(0), $registro['data_devolucao']);
        $this->assertSame('disponivel', $this->disponibilidadeDoExemplar($emprestimo['id_exemplar']));
    }

    public function testDevolucaoNoDiaDoVencimentoNaoEhAtraso(): void
    {
        $emprestimo = $this->criarEmprestimo(['data_prevista' => $this->dataEmDias(0)]);

        $resposta = $this->devolverEmprestimo($emprestimo['id_emprestimo']);
        $corpo = $this->corpo($resposta);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertStringNotContainsString('atraso', $corpo['mensagem']);
    }

    public function testDevolucaoEmAtrasoRetorna200ComAvisoDeAtraso(): void
    {
        $emprestimo = $this->criarEmprestimoAtrasado(3);

        $resposta = $this->devolverEmprestimo($emprestimo['id_emprestimo']);
        $corpo = $this->corpo($resposta);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('sucesso', $corpo['status']);
        $this->assertStringContainsString('atraso', $corpo['mensagem']);

        $registro = $this->emprestimoNoBanco($emprestimo['id_emprestimo']);
        $this->assertSame($this->dataEmDias(0), $registro['data_devolucao']);
        $this->assertSame('disponivel', $this->disponibilidadeDoExemplar($emprestimo['id_exemplar']));
    }

    public function testExemplarDevolvidoPodeSerEmprestadoDeNovo(): void
    {
        $emprestimo = $this->criarEmprestimo();
        $this->devolverEmprestimo($emprestimo['id_emprestimo']);
        $idOutraPessoa = $this->criarPessoa($this->dadosOutraPessoa(2));

        $resposta = $this->emprestarExemplar($emprestimo['id_exemplar'], $idOutraPessoa);

        $this->assertSame(201, $resposta->getStatusCode(), (string) $resposta->getBody());
    }

    public function testDevolucaoNaoAfetaOutrosEmprestimos(): void
    {
        $devolvido = $this->criarEmprestimo();

        $idOutraPessoa = $this->criarPessoa($this->dadosOutraPessoa(2));
        $idOutroExemplar = $this->criarExemplarDisponivel();
        $idOutroEmprestimo = (int) $this->corpo(
            $this->emprestarExemplar($idOutroExemplar, $idOutraPessoa)
        )['dados']['id_emprestimo'];

        $this->devolverEmprestimo($devolvido['id_emprestimo']);

        $this->assertNull($this->emprestimoNoBanco($idOutroEmprestimo)['data_devolucao']);
        $this->assertSame('emprestado', $this->disponibilidadeDoExemplar($idOutroExemplar));
    }

    // ---------- Emprestimo inexistente ou ja devolvido ----------

    public function testEmprestimoInexistenteRetorna404(): void
    {
        $resposta = $this->devolverEmprestimo(999999);
        $corpo = $this->corpo($resposta);

        $this->assertSame(404, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertNull($corpo['dados']);
    }

    public function testEmprestimoJaDevolvidoRetorna409ENaoAlteraADataDeDevolucao(): void
    {
        $idPessoa = $this->criarPessoa();
        $idExemplar = $this->criarExemplarDisponivel();
        $devolvidoEm = $this->dataEmDias(-2);
        $idEmprestimo = $this->inserirEmprestimo(
            $idExemplar,
            $idPessoa,
            $this->dataEmDias(-10),
            $this->dataEmDias(-3),
            $devolvidoEm
        );

        $resposta = $this->devolverEmprestimo($idEmprestimo);
        $corpo = $this->corpo($resposta);

        $this->assertSame(409, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertNull($corpo['dados']);
        $this->assertSame($devolvidoEm, $this->emprestimoNoBanco($idEmprestimo)['data_devolucao']);
    }

    public function testDevolverDuasVezesRetorna409NaSegunda(): void
    {
        $emprestimo = $this->criarEmprestimo();

        $primeira = $this->devolverEmprestimo($emprestimo['id_emprestimo']);
        $segunda = $this->devolverEmprestimo($emprestimo['id_emprestimo']);

        $this->assertSame(200, $primeira->getStatusCode(), (string) $primeira->getBody());
        $this->assertSame(409, $segunda->getStatusCode(), (string) $segunda->getBody());
    }

    // ---------- Campo obrigatorio ----------

    #[DataProvider('payloadsSemId')]
    public function testSemIdDoEmprestimoRetorna400(array $dados): void
    {
        $resposta = $this->http->put('/api/emprestimos/devolver.php', ['json' => (object) $dados]);
        $corpo = $this->corpo($resposta);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertNull($corpo['dados']);
    }

    public static function payloadsSemId(): array
    {
        return [
            'sem id_emprestimo'  => [[]],
            'id_emprestimo nulo' => [['id_emprestimo' => null]],
        ];
    }

    public function testCorpoVazioRetorna400(): void
    {
        $resposta = $this->http->put('/api/emprestimos/devolver.php', [
            'headers' => ['Content-Type' => 'application/json'],
            'body'    => '',
        ]);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $this->corpo($resposta)['status']);
    }

    // ---------- Metodo HTTP errado ----------

    public function testMetodoGetRetorna405(): void
    {
        $resposta = $this->http->get('/api/emprestimos/devolver.php');

        $this->assertSame(405, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $this->corpo($resposta)['status']);
    }

    // ---------- Falha conhecida (pendente) ----------

    public function testDevolucaoRegistraANotificacaoDeDevolucao(): void
    {
        $this->markTestIncomplete(
            'Pelo codigo, devolver.php nunca grava a notificacao de devolucao: a consulta nao seleciona '
            . 'id_pessoa, entao o INSERT usa 0, a chave estrangeira recusa e o erro e engolido pelo '
            . 'try/catch. O esperado e um registro em notificacao para o emprestimo. '
            . 'Corrigir em issue futura.'
        );

        $emprestimo = $this->criarEmprestimo();
        $this->devolverEmprestimo($emprestimo['id_emprestimo']);

        $notificacoes = $this->notificacoesDoEmprestimo($emprestimo['id_emprestimo']);

        $tipos = array_column($notificacoes, 'tipo_notificacao');
        $this->assertContains('devolucao', $tipos);
    }
}
