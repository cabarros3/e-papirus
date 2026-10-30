<?php

declare(strict_types=1);

namespace Tests\Api\Renovacoes;

use PHPUnit\Framework\Attributes\DataProvider;
use Tests\Support\AuthHelpers;
use Tests\Support\EmprestimoHelpers;
use Tests\Support\ExemplarHelpers;
use Tests\Support\LivroHelpers;
use Tests\Support\PessoaHelpers;
use Tests\Support\RenovacaoHelpers;
use Tests\Support\TestCase;

/**
 * api/renovacoes/create.php
 *
 * Sem nova_data_prevista, o prazo soma 7 dias a data prevista atual. Com ela, a data precisa estar
 * entre amanha e 30 dias a partir de hoje. Renovacao e recusada (409) para emprestimo devolvido ou atrasado.
 *
 * Nao testados, porque o codigo nao tem essas regras: limite maximo de renovacoes e bloqueio
 * por reserva ativa.
 * O e-mail de confirmacao nao e conferido aqui (depende de envio de e-mail).
 */
final class CreateTest extends TestCase
{
    use AuthHelpers; // fornece corpo()
    use PessoaHelpers;
    use LivroHelpers;
    use ExemplarHelpers;
    use EmprestimoHelpers;
    use RenovacaoHelpers;

    // ---------- Renovacao valida ----------

    public function testRenovacaoSemNovaDataSomaSeteDiasAoPrazoAtual(): void
    {
        $emprestimo = $this->criarEmprestimo(['data_prevista' => $this->dataEmDias(5)]);

        $resposta = $this->renovarEmprestimo($emprestimo['id_emprestimo']);
        $corpo = $this->corpo($resposta);

        $this->assertSame(201, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('sucesso', $corpo['status']);
        $this->assertSame($this->dataEmDias(5), $corpo['dados']['data_anterior']);
        $this->assertSame($this->dataEmDias(12), $corpo['dados']['nova_data_entrega']);
        $this->assertSame($this->dataEmDias(12), $this->emprestimoNoBanco($emprestimo['id_emprestimo'])['data_prevista']);
    }

    public function testRenovacaoComNovaDataUsaADataInformada(): void
    {
        $emprestimo = $this->criarEmprestimo(['data_prevista' => $this->dataEmDias(5)]);

        $resposta = $this->renovarEmprestimo($emprestimo['id_emprestimo'], [
            'nova_data_prevista' => $this->dataEmDias(15),
        ]);
        $corpo = $this->corpo($resposta);

        $this->assertSame(201, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame($this->dataEmDias(15), $corpo['dados']['nova_data_entrega']);
        $this->assertSame($this->dataEmDias(15), $this->emprestimoNoBanco($emprestimo['id_emprestimo'])['data_prevista']);
    }

    #[DataProvider('datasLimiteValidas')]
    public function testRenovacaoComNovaDataNosLimitesPermitidosRetorna201(int $diasAPartirDeHoje): void
    {
        $emprestimo = $this->criarEmprestimo();

        $resposta = $this->renovarEmprestimo($emprestimo['id_emprestimo'], [
            'nova_data_prevista' => $this->dataEmDias($diasAPartirDeHoje),
        ]);

        $this->assertSame(201, $resposta->getStatusCode(), (string) $resposta->getBody());
    }

    public static function datasLimiteValidas(): array
    {
        return [
            'amanha'            => [1],
            '30 dias a frente'  => [30],
        ];
    }

    public function testRenovacaoGravaOHistoricoDaRenovacao(): void
    {
        $emprestimo = $this->criarEmprestimo(['data_prevista' => $this->dataEmDias(5)]);

        $this->renovarEmprestimo($emprestimo['id_emprestimo']);

        $historico = $this->renovacoesNoBanco($emprestimo['id_emprestimo']);
        $this->assertCount(1, $historico);
        $this->assertSame($this->dataEmDias(0), $historico[0]['data_renovacao']);
        $this->assertSame($this->dataEmDias(12), $historico[0]['nova_data_devolucao']);
    }

    public function testSegundaRenovacaoSomaSeteDiasSobreOPrazoJaRenovado(): void
    {
        $emprestimo = $this->criarEmprestimo(['data_prevista' => $this->dataEmDias(5)]);

        $this->renovarEmprestimo($emprestimo['id_emprestimo']);
        $resposta = $this->renovarEmprestimo($emprestimo['id_emprestimo']);
        $corpo = $this->corpo($resposta);

        $this->assertSame(201, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame($this->dataEmDias(12), $corpo['dados']['data_anterior']);
        $this->assertSame($this->dataEmDias(19), $corpo['dados']['nova_data_entrega']);
        $this->assertCount(2, $this->renovacoesNoBanco($emprestimo['id_emprestimo']));
    }

    public function testEmprestimoQueVenceHojeAindaPodeSerRenovado(): void
    {
        $emprestimo = $this->criarEmprestimo(['data_prevista' => $this->dataEmDias(0)]);

        $resposta = $this->renovarEmprestimo($emprestimo['id_emprestimo']);
        $corpo = $this->corpo($resposta);

        $this->assertSame(201, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame($this->dataEmDias(7), $corpo['dados']['nova_data_entrega']);
    }

    // ---------- Nova data fora do permitido ----------

    #[DataProvider('datasForaDoPermitido')]
    public function testNovaDataForaDoIntervaloRetorna400ENaoAlteraNada(int $diasAPartirDeHoje): void
    {
        $emprestimo = $this->criarEmprestimo(['data_prevista' => $this->dataEmDias(5)]);

        $resposta = $this->renovarEmprestimo($emprestimo['id_emprestimo'], [
            'nova_data_prevista' => $this->dataEmDias($diasAPartirDeHoje),
        ]);
        $corpo = $this->corpo($resposta);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertNull($corpo['dados']);
        $this->assertSame($this->dataEmDias(5), $this->emprestimoNoBanco($emprestimo['id_emprestimo'])['data_prevista']);
        $this->assertSame([], $this->renovacoesNoBanco($emprestimo['id_emprestimo']));
    }

    public static function datasForaDoPermitido(): array
    {
        return [
            'hoje'                  => [0],
            'ontem'                 => [-1],
            'mais de 30 dias'       => [31],
        ];
    }

    // ---------- Emprestimo que nao pode ser renovado ----------

    public function testEmprestimoAtrasadoRetorna409ENaoAlteraNada(): void
    {
        $emprestimo = $this->criarEmprestimoAtrasado(3);

        $resposta = $this->renovarEmprestimo($emprestimo['id_emprestimo']);
        $corpo = $this->corpo($resposta);

        $this->assertSame(409, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertNull($corpo['dados']);
        $this->assertSame($this->dataEmDias(-3), $this->emprestimoNoBanco($emprestimo['id_emprestimo'])['data_prevista']);
        $this->assertSame([], $this->renovacoesNoBanco($emprestimo['id_emprestimo']));
    }

    public function testEmprestimoJaDevolvidoRetorna409(): void
    {
        $emprestimo = $this->criarEmprestimo();
        $this->devolverEmprestimo($emprestimo['id_emprestimo']);

        $resposta = $this->renovarEmprestimo($emprestimo['id_emprestimo']);
        $corpo = $this->corpo($resposta);

        $this->assertSame(409, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertNull($corpo['dados']);
        $this->assertSame([], $this->renovacoesNoBanco($emprestimo['id_emprestimo']));
    }

    public function testEmprestimoInexistenteRetorna404(): void
    {
        $resposta = $this->renovarEmprestimo(999999);
        $corpo = $this->corpo($resposta);

        $this->assertSame(404, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertNull($corpo['dados']);
    }

    // ---------- Campo obrigatorio ----------

    #[DataProvider('payloadsSemId')]
    public function testSemIdDoEmprestimoRetorna400(array $dados): void
    {
        $resposta = $this->http->post('/api/renovacoes/create.php', ['json' => (object) $dados]);
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
        $resposta = $this->http->post('/api/renovacoes/create.php', [
            'headers' => ['Content-Type' => 'application/json'],
            'body'    => '',
        ]);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $this->corpo($resposta)['status']);
    }

    // ---------- Metodo HTTP errado ----------

    public function testMetodoGetRetorna405(): void
    {
        $resposta = $this->http->get('/api/renovacoes/create.php');

        $this->assertSame(405, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $this->corpo($resposta)['status']);
    }

    // ---------- Falhas conhecidas (pendentes) ----------

    public function testNovaDataComFormatoInvalidoRetorna400(): void
    {
        $this->markTestIncomplete(
            'create.php cria um DateTime direto com o texto recebido, e uma data invalida lanca uma '
            . 'excecao que nao e tratada: a API nao responde JSON (provavelmente um 500 do PHP). '
            . 'O esperado e 400 em JSON. Corrigir em issue futura.'
        );

        $emprestimo = $this->criarEmprestimo();

        $resposta = $this->renovarEmprestimo($emprestimo['id_emprestimo'], [
            'nova_data_prevista' => 'nao-e-uma-data',
        ]);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
    }

    public function testNovaDataAnteriorAoPrazoAtualNaoDeveSerAceita(): void
    {
        $this->markTestIncomplete(
            'create.php so confere se a nova data esta entre amanha e 30 dias a partir de hoje, sem '
            . 'compara-la com o prazo atual: uma "renovacao" pode ENCURTAR o prazo (ex.: prazo atual '
            . 'daqui a 20 dias e nova data daqui a 2 dias). O esperado e recusar uma data anterior ao '
            . 'prazo atual. Corrigir em issue futura.'
        );

        $emprestimo = $this->criarEmprestimo(['data_prevista' => $this->dataEmDias(20)]);

        $resposta = $this->renovarEmprestimo($emprestimo['id_emprestimo'], [
            'nova_data_prevista' => $this->dataEmDias(2),
        ]);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
    }
}
