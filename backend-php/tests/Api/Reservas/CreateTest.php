<?php

declare(strict_types=1);

namespace Tests\Api\Reservas;

use PHPUnit\Framework\Attributes\DataProvider;
use Psr\Http\Message\ResponseInterface;
use Tests\Support\AuthHelpers;
use Tests\Support\ExemplarHelpers;
use Tests\Support\LivroHelpers;
use Tests\Support\ReservaHelpers;
use Tests\Support\TestCase;
use Tests\Support\TokenHelpers;

final class CreateTest extends TestCase
{
    use AuthHelpers;
    use ExemplarHelpers;
    use LivroHelpers;
    use ReservaHelpers;
    use TokenHelpers;

    private const ROTA = '/api/reservas/create.php';

    // ---------- Reserva com sucesso ----------

    public function testReservaValidaRetorna201EOsDadosDaReserva(): void
    {
        $usuario = $this->cadastrarELogar();
        $idLivro = $this->criarLivro();
        $exemplar = $this->criarExemplar($idLivro);

        $resposta = $this->cadastrarReserva($usuario['token'], ['id_livro' => $idLivro]);
        $corpo = $this->corpo($resposta);

        $this->assertSame(201, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('sucesso', $corpo['status']);
        $this->assertGreaterThan(0, (int) $corpo['dados']['id_reserva']);
        $this->assertEquals($usuario['usuario']['id_pessoa'], $corpo['dados']['id_pessoa']);
        $this->assertEquals($exemplar['id_exemplar'], $corpo['dados']['id_exemplar']);
    }

    public function testExemplarReservadoFicaComStatusReservado(): void
    {
        $usuario = $this->cadastrarELogar();
        $idLivro = $this->criarLivro();
        $this->criarExemplar($idLivro);

        $this->criarReserva($usuario['token'], $idLivro);

        $this->assertSame('reservado', $this->exemplaresDoLivro($idLivro)[0]['disponibilidade']);
    }

    public function testReservaUsaSomenteUmExemplarDisponivel(): void
    {
        $usuario = $this->cadastrarELogar();
        $idLivro = $this->criarLivro();
        $this->criarExemplar($idLivro, ['disponibilidade' => 'emprestado']);
        $disponivel = $this->criarExemplar($idLivro);

        $reserva = $this->criarReserva($usuario['token'], $idLivro);

        $this->assertSame($disponivel['id_exemplar'], $reserva['id_exemplar']);
    }

    // ---------- Prazo de expiração ----------

    public function testPrazoDeExpiracaoPadraoEDeTresDias(): void
    {
        $usuario = $this->cadastrarELogar();
        $idLivro = $this->criarLivro();
        $this->criarExemplar($idLivro);

        $this->reservarEConferirPrazo(3, $usuario['token'], $idLivro);
    }

    public function testPrazoDeExpiracaoDoProfessorEDeSeteDias(): void
    {
        $usuario = $this->cadastrarELogar();
        // Token forjado de professor, com o id de uma pessoa que existe no banco.
        $token = $this->tokenComDados([
            'tipo'      => 'professor',
            'id_pessoa' => (int) $usuario['usuario']['id_pessoa'],
        ]);
        $idLivro = $this->criarLivro();
        $this->criarExemplar($idLivro);

        $this->reservarEConferirPrazo(7, $token, $idLivro);
    }

    // ---------- Sem exemplar disponível ----------

    public function testSegundaReservaDoUnicoExemplarRetorna404(): void
    {
        $primeiro = $this->cadastrarELogarUsuario(1);
        $segundo = $this->cadastrarELogarUsuario(2);
        $idLivro = $this->criarLivro();
        $this->criarExemplar($idLivro);

        $this->criarReserva($primeiro['token'], $idLivro);
        $resposta = $this->cadastrarReserva($segundo['token'], ['id_livro' => $idLivro]);

        $this->assertSemExemplarDisponivel($resposta);
    }

    public function testLivroComExemplarEmprestadoRetorna404(): void
    {
        $usuario = $this->cadastrarELogar();
        $idLivro = $this->criarLivro();
        $this->criarExemplar($idLivro, ['disponibilidade' => 'emprestado']);

        $this->assertSemExemplarDisponivel(
            $this->cadastrarReserva($usuario['token'], ['id_livro' => $idLivro])
        );
    }

    public function testLivroSemExemplaresRetorna404(): void
    {
        $usuario = $this->cadastrarELogar();
        $idLivro = $this->criarLivro();

        $this->assertSemExemplarDisponivel(
            $this->cadastrarReserva($usuario['token'], ['id_livro' => $idLivro])
        );
    }

    public function testLivroInexistenteRetorna404(): void
    {
        $usuario = $this->cadastrarELogar();

        $this->assertSemExemplarDisponivel(
            $this->cadastrarReserva($usuario['token'], ['id_livro' => 999999])
        );
    }

    // ---------- Reserva duplicada (PENDENTE) ----------
    // Nada impede a mesma pessoa de reservar o mesmo livro mais de uma vez: com dois exemplares
    // disponíveis, as duas reservas dão 201. O correto seria 409.
    // Quando for corrigido, apague a linha do markTestIncomplete.

    public function testMesmaPessoaNaoPodeReservarOMesmoLivroDuasVezes(): void
    {
        $this->markTestIncomplete('Pendente: create.php não impede reserva duplicada (com 2 exemplares, a mesma pessoa reserva o mesmo livro duas vezes).');

        $usuario = $this->cadastrarELogar();
        $idLivro = $this->criarLivro();
        $this->criarExemplar($idLivro);
        $this->criarExemplar($idLivro);

        $this->criarReserva($usuario['token'], $idLivro);
        $segunda = $this->cadastrarReserva($usuario['token'], ['id_livro' => $idLivro]);

        $this->assertSame(409, $segunda->getStatusCode(), (string) $segunda->getBody());
        $this->assertSame('erro', $this->corpo($segunda)['status']);
    }

    // ---------- Reserva em nome de outra pessoa ----------

    #[DataProvider('cargosDeStaff')]
    public function testFuncionarioReservaParaOutraPessoa(string $cargo): void
    {
        $cliente = $this->cadastrarELogar();
        $token = $this->tokenComDados(['tipo' => 'funcionario', 'cargo' => $cargo]);
        $idLivro = $this->criarLivro();
        $this->criarExemplar($idLivro);

        $resposta = $this->cadastrarReserva($token, [
            'id_livro'  => $idLivro,
            'id_pessoa' => (int) $cliente['usuario']['id_pessoa'],
        ]);
        $corpo = $this->corpo($resposta);

        $this->assertSame(201, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertEquals($cliente['usuario']['id_pessoa'], $corpo['dados']['id_pessoa']);
    }

    public static function cargosDeStaff(): array
    {
        return [
            'bibliotecario' => ['bibliotecario'],
            'auxiliar'      => ['auxiliar'],
        ];
    }

    public function testFuncionarioSemIdPessoaRetorna400(): void
    {
        $token = $this->tokenComDados(['tipo' => 'funcionario', 'cargo' => 'bibliotecario']);

        $resposta = $this->cadastrarReserva($token, ['id_livro' => 1]);
        $corpo = $this->corpo($resposta);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertStringContainsString('ID da pessoa', $corpo['mensagem']);
    }

    #[DataProvider('perfisSemPermissaoDeStaff')]
    public function testUsuarioComumNaoReservaParaOutraPessoa(array $perfil): void
    {
        $dono = $this->cadastrarELogarUsuario(1);
        $outra = $this->cadastrarELogarUsuario(2);
        $token = $this->tokenComDados($perfil + ['id_pessoa' => (int) $dono['usuario']['id_pessoa']]);
        $idLivro = $this->criarLivro();
        $this->criarExemplar($idLivro);

        // O id_pessoa do corpo deve ser ignorado: a reserva sai no nome de quem está logado.
        $resposta = $this->cadastrarReserva($token, [
            'id_livro'  => $idLivro,
            'id_pessoa' => (int) $outra['usuario']['id_pessoa'],
        ]);
        $corpo = $this->corpo($resposta);

        $this->assertSame(201, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertEquals($dono['usuario']['id_pessoa'], $corpo['dados']['id_pessoa']);
    }

    public static function perfisSemPermissaoDeStaff(): array
    {
        return [
            'aluno'                       => [['tipo' => 'aluno', 'cargo' => null]],
            'funcionario sem cargo'       => [['tipo' => 'funcionario', 'cargo' => null]],
            'funcionario com outro cargo' => [['tipo' => 'funcionario', 'cargo' => 'estagiario']],
        ];
    }

    // ---------- Pessoa inexistente ----------

    public function testFalhaNaReservaNaoDeixaOExemplarReservado(): void
    {
        $token = $this->tokenComDados(['tipo' => 'funcionario', 'cargo' => 'bibliotecario']);
        $idLivro = $this->criarLivro();
        $this->criarExemplar($idLivro);

        $resposta = $this->cadastrarReserva($token, ['id_livro' => $idLivro, 'id_pessoa' => 999999]);

        $this->assertNotSame(201, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame(
            'disponivel',
            $this->exemplaresDoLivro($idLivro)[0]['disponibilidade'],
            'A transação deveria ter sido desfeita: o exemplar não pode ficar reservado.'
        );
    }

    // PENDENTE: o create.php não confere se a pessoa existe; a chave estrangeira barra o INSERT
    // e a API responde 500. O correto seria 404. Quando for corrigido, apague a linha do markTestIncomplete.

    public function testPessoaInexistenteRetorna404(): void
    {
        $this->markTestIncomplete('Pendente: create.php não confere se a pessoa existe (hoje responde 500 por causa da chave estrangeira).');

        $token = $this->tokenComDados(['tipo' => 'funcionario', 'cargo' => 'bibliotecario']);
        $idLivro = $this->criarLivro();
        $this->criarExemplar($idLivro);

        $resposta = $this->cadastrarReserva($token, ['id_livro' => $idLivro, 'id_pessoa' => 999999]);

        $this->assertSame(404, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $this->corpo($resposta)['status']);
    }

    // ---------- Validação e método ----------

    #[DataProvider('payloadsSemLivro')]
    public function testReservaSemLivroRetorna400(array $payload): void
    {
        $usuario = $this->cadastrarELogar();

        $resposta = $this->cadastrarReserva($usuario['token'], $payload);
        $corpo = $this->corpo($resposta);

        $this->assertSame(400, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertNull($corpo['dados']);
    }

    public static function payloadsSemLivro(): array
    {
        return [
            'corpo vazio'   => [[]],
            'id_livro nulo' => [['id_livro' => null]],
            'id_livro zero' => [['id_livro' => 0]],
        ];
    }

    public function testMetodoGetComTokenRetorna405(): void
    {
        $usuario = $this->cadastrarELogar();

        $resposta = $this->http->get(self::ROTA, [
            'headers' => ['Authorization' => 'Bearer ' . $usuario['token']],
        ]);

        $this->assertSame(405, $resposta->getStatusCode(), (string) $resposta->getBody());
    }

    // ---------- Auxiliares ----------

    /** Reserva e confere que a expiração é daqui a $dias dias. */
    private function reservarEConferirPrazo(int $dias, string $token, int $idLivro): void
    {
        $antes = date('Y-m-d', strtotime("+{$dias} days"));
        $resposta = $this->cadastrarReserva($token, ['id_livro' => $idLivro]);
        $depois = date('Y-m-d', strtotime("+{$dias} days"));

        $this->assertSame(201, $resposta->getStatusCode(), (string) $resposta->getBody());

        // Aceita as duas datas para o teste não falhar se rodar na virada do dia.
        $this->assertContains($this->corpo($resposta)['dados']['data_expiracao'], [$antes, $depois]);
    }

    private function assertSemExemplarDisponivel(ResponseInterface $resposta): void
    {
        $corpo = $this->corpo($resposta);

        $this->assertSame(404, $resposta->getStatusCode(), (string) $resposta->getBody());
        $this->assertSame('erro', $corpo['status']);
        $this->assertNull($corpo['dados']);
    }
}