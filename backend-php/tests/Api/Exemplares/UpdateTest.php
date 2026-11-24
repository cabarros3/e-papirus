<?php

declare(strict_types=1);

namespace Tests\Api\Exemplares;

use PHPUnit\Framework\Attributes\DataProvider;
use Tests\Support\ExemplarHelpers;
use Tests\Support\LivroHelpers;
use Tests\Support\TestCase;

final class UpdateTest extends TestCase
{
    use ExemplarHelpers;
    use LivroHelpers;

    private const ROTA = '/api/exemplares/update.php';

    // ---------- Atualizações bem-sucedidas ----------

    public function testAtualizacaoDeLocalizacaoRetorna200Sucesso(): void
    {
        $idLivro  = $this->criarLivro();
        $exemplar = $this->criarExemplar($idLivro);

        $resposta = $this->atualizarExemplar($exemplar['id_exemplar'], [
            'localizacao' => 'Estante B2 - Prateleira 3',
        ]);
        $corpo = $this->corpo($resposta);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('sucesso', $corpo['status']);
        $this->assertNull($corpo['dados']);
    }

    public function testAtualizacaoDeDisponibilidadeParaEmprestadoRetorna200Sucesso(): void
    {
        $idLivro  = $this->criarLivro();
        $exemplar = $this->criarExemplar($idLivro);

        $resposta = $this->atualizarExemplar($exemplar['id_exemplar'], [
            'disponibilidade' => 'emprestado',
        ]);
        $corpo = $this->corpo($resposta);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('sucesso', $corpo['status']);
    }

    public function testAtualizacaoDeLocalizacaoEDisponibilidadeJuntasRetorna200Sucesso(): void
    {
        $idLivro  = $this->criarLivro();
        $exemplar = $this->criarExemplar($idLivro);

        $resposta = $this->atualizarExemplar($exemplar['id_exemplar'], [
            'localizacao'     => 'Estante C1',
            'disponibilidade' => 'reservado',
        ]);
        $corpo = $this->corpo($resposta);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('sucesso', $corpo['status']);
    }

    // ---------- Sem alteração real (mesmos valores) ----------

    /**
     * ATENÇÃO: este teste assume que o MySQL está sem PDO::MYSQL_ATTR_FOUND_ROWS
     * (padrão do driver). Com FOUND_ROWS ligado, rowCount devolve 1 mesmo sem
     * mudança real e o status viria como 'sucesso' em vez de 'aviso'.
     * É o comportamento pretendido pelo update.php ("se os dados são iguais").
     */
    public function testAtualizacaoComMesmosValoresRetorna200Aviso(): void
    {
        $idLivro  = $this->criarLivro();
        $exemplar = $this->criarExemplar($idLivro, ['localizacao' => 'Estante Fixa']);

        $resposta = $this->atualizarExemplar($exemplar['id_exemplar'], [
            'localizacao' => 'Estante Fixa', // igual ao que já está
        ]);
        $corpo = $this->corpo($resposta);

        $this->assertSame(200, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('aviso', $corpo['status']);
        $this->assertNull($corpo['dados']);
    }

    // ---------- Exemplar inexistente (PENDENTE) ----------
    // O update.php não verifica se o id_exemplar existe: um UPDATE com ID inexistente
    // afeta 0 linhas e a API devolve 200/aviso. O correto seria 404.
    // Quando corrigirem, apaguem o markTestIncomplete.

    public function testExemplarInexistenteRetorna404(): void
    {
        $this->markTestIncomplete('Pendente: update.php não confere se o exemplar existe (hoje responde 200/aviso).');

        $resposta = $this->atualizarExemplar(999999, [
            'localizacao' => 'Estante Z9',
        ]);
        $corpo = $this->corpo($resposta);

        $this->assertSame(404, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
    }

    // ---------- Localização vazia (PENDENTE) ----------
    // O create.php valida localizacao vazia (400), mas o update.php não valida.
    // Hoje aceita string vazia e devolve 200/sucesso — inconsistência com o create.
    // Quando corrigirem, apaguem o markTestIncomplete.

    public function testLocalizacaoVaziaRetorna400(): void
    {
        $this->markTestIncomplete('Pendente: update.php não valida localizacao vazia (hoje aceita e retorna 200).');

        $idLivro  = $this->criarLivro();
        $exemplar = $this->criarExemplar($idLivro);

        $resposta = $this->atualizarExemplar($exemplar['id_exemplar'], [
            'localizacao' => '',
        ]);
        $corpo = $this->corpo($resposta);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
    }

    // ---------- Validação ----------

    #[DataProvider('payloadsInvalidos')]
    public function testPayloadInvalidoRetorna400(array $payload): void
    {
        $resposta = $this->http->put(self::ROTA, ['json' => $payload]);
        $corpo    = $this->corpo($resposta);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertNull($corpo['dados']);
    }

    public static function payloadsInvalidos(): array
    {
        return [
            'corpo vazio'                      => [[]],
            'sem id_exemplar'                  => [['localizacao' => 'Estante A1']],
            'id_exemplar nulo'                 => [['id_exemplar' => null, 'localizacao' => 'Estante A1']],
            'somente id_exemplar'              => [['id_exemplar' => 1]],           // nenhum campo para atualizar
            'disponibilidade invalida'         => [['id_exemplar' => 1, 'disponibilidade' => 'perdido']],
            'disponibilidade com maiuscula'    => [['id_exemplar' => 1, 'disponibilidade' => 'Disponivel']],
            'disponibilidade vazia'            => [['id_exemplar' => 1, 'disponibilidade' => '']],
        ];
    }

    // ---------- Método ----------

    public function testMetodoGetRetorna405(): void
    {
        $resposta = $this->http->get(self::ROTA);

        $this->assertSame(405, $resposta->getStatusCode(), (string) $resposta->getBody());
    }

    public function testMetodoPostRetorna405(): void
    {
        $resposta = $this->http->post(self::ROTA);

        $this->assertSame(405, $resposta->getStatusCode(), (string) $resposta->getBody());
    }
}