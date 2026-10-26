<?php

declare(strict_types=1);

namespace Tests\Api\Exemplares;

use PHPUnit\Framework\Attributes\DataProvider;
use Tests\Support\ExemplarHelpers;
use Tests\Support\LivroHelpers;
use Tests\Support\TestCase;

final class CreateTest extends TestCase
{
    use ExemplarHelpers;
    use LivroHelpers;

    private const ROTA = '/api/exemplares/create.php';

    // ---------- Cadastro com sucesso ----------

    public function testCadastroValidoRetorna201EOsIdsDoExemplar(): void
    {
        $idLivro = $this->criarLivro();

        $resposta = $this->cadastrarExemplar($idLivro);
        $corpo = $this->corpo($resposta);

        $this->assertSame(201, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('sucesso', $corpo['status']);
        $this->assertGreaterThan(0, (int) $corpo['dados']['id_exemplar']);
        $this->assertSame(1, (int) $corpo['dados']['numero_exemplar']);
    }

    public function testNumeroDoExemplarCresceParaOMesmoLivro(): void
    {
        $idLivro = $this->criarLivro();

        $primeiro = $this->criarExemplar($idLivro);
        $segundo = $this->criarExemplar($idLivro);
        $terceiro = $this->criarExemplar($idLivro);

        $this->assertSame(
            [1, 2, 3],
            [$primeiro['numero_exemplar'], $segundo['numero_exemplar'], $terceiro['numero_exemplar']]
        );
        $this->assertCount(
            3,
            array_unique([$primeiro['id_exemplar'], $segundo['id_exemplar'], $terceiro['id_exemplar']]),
            'Cada exemplar deveria ter um id diferente.'
        );
    }

    public function testNumeracaoEIndependentePorLivro(): void
    {
        $livroA = $this->criarLivro(['titulo' => 'Livro de Teste A']);
        $livroB = $this->criarLivro(['titulo' => 'Livro de Teste B']);

        $this->criarExemplar($livroA);
        $this->criarExemplar($livroA);
        $primeiroDoLivroB = $this->criarExemplar($livroB);

        $this->assertSame(1, $primeiroDoLivroB['numero_exemplar']);
    }

    // ---------- Livro inexistente ----------
    // O create.php não confere se o livro existe: a chave estrangeira de exemplar.id_livro barra
    // o INSERT e a API responde 500 (erro do banco). O correto seria 404.
    // Quando for corrigido, apague a linha do markTestIncomplete.

    public function testLivroInexistenteRetorna404(): void
    {
        $this->markTestIncomplete('Pendente: create.php não confere se o livro existe (hoje responde 500 por causa da chave estrangeira).');
        $resposta = $this->cadastrarExemplar(999999);
        $corpo = $this->corpo($resposta);

        $this->assertSame(404, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
    }

    // ---------- Disponibilidade inválida (PENDENTE) ----------
    // disponibilidade é um ENUM('disponivel','emprestado','reservado') e o create.php não valida o valor.
    // Com um valor fora da lista, o banco recusa o INSERT (modo estrito) e a API responde 500;
    // o correto seria 400. Quando for corrigido, apague a linha do markTestIncomplete.

    public function testDisponibilidadeInvalidaRetorna400(): void
    {
        $this->markTestIncomplete('Pendente: create.php não valida disponibilidade (hoje o banco recusa o valor e a API responde 500).');

        $idLivro = $this->criarLivro();

        $resposta = $this->cadastrarExemplar($idLivro, ['disponibilidade' => 'perdido']);
        $corpo = $this->corpo($resposta);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
    }

    // ---------- Validação e método ----------

    #[DataProvider('payloadsInvalidos')]
    public function testCadastroSemCamposObrigatoriosRetorna400(array $payload): void
    {
        $resposta = $this->http->post(self::ROTA, ['json' => $payload]);
        $corpo = $this->corpo($resposta);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertNull($corpo['dados']);
    }

    public static function payloadsInvalidos(): array
    {
        return [
            'corpo vazio'       => [[]],
            'sem id_livro'      => [['localizacao' => 'Estante A1']],
            'sem localizacao'   => [['id_livro' => 1]],
            'id_livro nulo'     => [['id_livro' => null, 'localizacao' => 'Estante A1']],
            'id_livro zero'     => [['id_livro' => 0, 'localizacao' => 'Estante A1']],
            'localizacao vazia' => [['id_livro' => 1, 'localizacao' => '']],
        ];
    }

    public function testCadastroComMetodoGetRetorna405(): void
    {
        $resposta = $this->http->get(self::ROTA);

        $this->assertSame(405, $resposta->getStatusCode(), (string) $resposta->getBody());
    }
}