<?php

declare(strict_types=1);

namespace Tests\Support;

use Psr\Http\Message\ResponseInterface;
use GuzzleHttp\Client;
use PDO;
use PHPUnit\Framework\TestCase as PHPUnitTestCase;

/**
 * Classe base dos testes de integração da API.
 *
 * Na primeira execução: cria o banco de teste (schema + seeds).
 * Antes de cada teste: limpa as tabelas e reimporta apenas o seed (rápido).
 */
abstract class TestCase extends PHPUnitTestCase
{
    // Fixos de propósito: os testes NUNCA devem apontar para o banco de desenvolvimento.
    private const DB_HOST = '127.0.0.1';
    private const DB_NAME = 'epapirus_test';
    private const DB_USER = 'epapirus_test';
    private const DB_PASS = 'epapirus_test';

    /** Garante que o schema seja criado só uma vez por execução do PHPUnit. */
    private static bool $bancoCriado = false;

    protected Client $http;

    protected function setUp(): void
    {
        parent::setUp();

        if (!self::$bancoCriado) {
            $this->criarBanco();
            self::$bancoCriado = true;
        }

        $this->resetarDados();

        $this->http = new Client([
            'base_uri'    => getenv('TEST_BASE_URL') ?: 'http://localhost:8001',
            'http_errors' => false,
            'timeout'     => 10,
        ]);
    }

    protected function corpo(ResponseInterface $resposta): array
    {
        $corpo = json_decode((string) $resposta->getBody(), true);
        $this->assertIsArray($corpo, 'A resposta deveria ser um JSON: ' . (string) $resposta->getBody());
        return $corpo;
    }

    protected function pdoDeTeste(): PDO
    {
        return $this->conexaoBancoDeTeste();
    }

    protected function conexaoBancoDeTeste(): PDO
    {
        return new PDO(
            sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', self::DB_HOST, self::DB_NAME),
            self::DB_USER,
            self::DB_PASS,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
    }

    /** Cria o banco de teste do zero (só na primeira vez). */
    private function criarBanco(): void
    {
        $pdo = new PDO(
            sprintf('mysql:host=%s;charset=utf8mb4', self::DB_HOST),
            self::DB_USER,
            self::DB_PASS,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );

        $pdo->exec('DROP DATABASE IF EXISTS ' . self::DB_NAME);
        $pdo->exec('CREATE DATABASE ' . self::DB_NAME . ' CHARACTER SET utf8mb4');
        $pdo->exec('USE ' . self::DB_NAME);

        foreach (['db.sql', 'seed.sql'] as $arquivo) {
            $sql = file_get_contents(__DIR__ . '/../../db/' . $arquivo);
            $sql = preg_replace('/^(CREATE DATABASE|USE) .*$/m', '', $sql);
            $consulta = $pdo->query($sql);
            do {
            } while ($consulta->nextRowset());
        }
    }

    /** Limpa todas as tabelas e reimporta apenas o seed (rápido). */
    private function resetarDados(): void
    {
        $pdo = $this->conexaoBancoDeTeste();

        $pdo->exec('SET FOREIGN_KEY_CHECKS = 0');

        $tabelas = [
            'notificacao',
            'renovacao',
            'reserva',
            'emprestimo',
            'livro_autor',
            'exemplar',
            'livro',
            'autor',
            'assunto',
            'usuario_sistema',
            'pessoa',
        ];

        foreach ($tabelas as $tabela) {
            $pdo->exec("TRUNCATE TABLE {$tabela}");
        }

        $pdo->exec('SET FOREIGN_KEY_CHECKS = 1');

        $sql = file_get_contents(__DIR__ . '/../../db/seed.sql');
        $sql = preg_replace('/^(CREATE DATABASE|USE) .*$/m', '', $sql);
        $consulta = $pdo->query($sql);
        do {
        } while ($consulta->nextRowset());
    }
}
