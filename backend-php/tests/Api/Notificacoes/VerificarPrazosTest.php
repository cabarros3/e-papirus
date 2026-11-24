<?php

declare(strict_types=1);

namespace Tests\Api\Notificacoes;

use Tests\Support\TestCase;
use Tests\Support\EmprestimoHelpers;
use Tests\Support\PessoaHelpers;
use Tests\Support\ExemplarHelpers;
use Tests\Support\LivroHelpers;

final class VerificarPrazosTest extends TestCase
{
    use EmprestimoHelpers;
    use PessoaHelpers;
    use ExemplarHelpers;
    use LivroHelpers;

    private string $scriptPath;

    protected function setUp(): void
    {
        parent::setUp();
        $this->scriptPath = dirname(__DIR__, 3) . '/api/notificacoes/verificar_prazos.php';
    }

    private function executarScript(): string
    {
        $comando = sprintf(
            'DB_HOST=127.0.0.1 DB_NAME=epapirus_test DB_USER=epapirus_test DB_PASS=epapirus_test MAIL_HOST=127.0.0.1 MAIL_PORT=1025 MAIL_USER=teste@epapirus.local MAIL_PASS=teste JWT_SECRET=teste JWT_EXPIRATION=86400 php -d variables_order=EGPCS %s 2>&1',
            escapeshellarg($this->scriptPath)
        );
        return shell_exec($comando) ?? '';
    }

    private function criarEmprestimoComDataPrevista(string $dataPrevista): int
    {
        $idPessoa = $this->criarPessoa($this->dadosOutraPessoa(random_int(100, 999)));
        $idExemplar = $this->criarExemplarDisponivel();
        return $this->inserirEmprestimo($idExemplar, $idPessoa, date('Y-m-d'), $dataPrevista);
    }

    public function testSemEmprestimosAtivosNaoDeveEnviarNada(): void
    {
        $saida = $this->executarScript();
        $this->assertStringContainsString('0 notificações enviadas', $saida);
    }

    public function testEmprestimoVencendoEm3DiasDeveGerarNotificacaoDeLembrete(): void
    {
        $idEmprestimo = $this->criarEmprestimoComDataPrevista(date('Y-m-d', strtotime('+3 days')));
        $this->executarScript();

        $notificacoes = $this->notificacoesDoEmprestimo($idEmprestimo);
        $enviada = null;
        foreach ($notificacoes as $n) {
            if ($n['tipo_notificacao'] === 'lembrete') { $enviada = $n; break; }
        }
        $this->assertNotNull($enviada, 'Não encontrou notificação do tipo "lembrete".');

        if ($enviada['status'] !== 'enviado') {
            $this->markTestIncomplete('O status ficou "erro" porque o ambiente de teste não envia e-mail real. O SMTP falso será resolvido na Issue 12.');
        }
        $this->assertSame('enviado', $enviada['status']);
    }

    public function testEmprestimoVencendoEm1DiaDeveGerarNotificacaoDeLembreteUmDia(): void
    {
        $idEmprestimo = $this->criarEmprestimoComDataPrevista(date('Y-m-d', strtotime('+1 day')));
        $this->executarScript();

        $notificacoes = $this->notificacoesDoEmprestimo($idEmprestimo);
        $enviada = null;
        foreach ($notificacoes as $n) {
            if ($n['tipo_notificacao'] === 'lembrete_1dia') { $enviada = $n; break; }
        }
        $this->assertNotNull($enviada, 'Não encontrou notificação do tipo "lembrete_1dia".');

        if ($enviada['status'] !== 'enviado') {
            $this->markTestIncomplete('O status ficou "erro" porque o ambiente de teste não envia e-mail real. O SMTP falso será resolvido na Issue 12.');
        }
        $this->assertSame('enviado', $enviada['status']);
    }

    public function testEmprestimoEmAtrasoDeveGerarNotificacaoDeAtraso(): void
    {
        $idEmprestimo = $this->criarEmprestimoComDataPrevista(date('Y-m-d', strtotime('-3 days')));
        $this->executarScript();

        $notificacoes = $this->notificacoesDoEmprestimo($idEmprestimo);
        $enviada = null;
        foreach ($notificacoes as $n) {
            if ($n['tipo_notificacao'] === 'atraso') { $enviada = $n; break; }
        }
        $this->assertNotNull($enviada, 'Não encontrou notificação do tipo "atraso".');

        if ($enviada['status'] !== 'enviado') {
            $this->markTestIncomplete('O status ficou "erro" porque o ambiente de teste não envia e-mail real. O SMTP falso será resolvido na Issue 12.');
        }
        $this->assertSame('enviado', $enviada['status']);
    }

    public function testRodarDuasVezesNaoDeveDuplicarNotificacao(): void
    {
        $this->markTestIncomplete(
            'O anti-spam só funciona quando o status é "enviado". Como o ambiente de teste não envia e-mail real, o status fica "erro" e o script grava duplicado. O SMTP falso será resolvido na Issue 12.'
        );
    }
}
