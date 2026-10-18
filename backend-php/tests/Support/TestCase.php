<?php

declare(strict_types=1);

namespace Tests\Support;

use GuzzleHttp\Client;
use PDO;
use PHPUnit\Framework\TestCase as PHPUnitTestCase;

/**
 * Classe base dos testes de integração da API.
 *
 * Antes de cada teste:
 *  - recria o banco de teste (schema + seeds);
 *  - entrega um cliente HTTP ($this->http) apontando para a API de teste.
 */
abstract class TestCase extends PHPUnitTestCase
{
    // Fixos de propósito: os testes NUNCA devem apontar para o banco de desenvolvimento.
    private const DB_HOST = '127.0.0.1';
    private const DB_NAME = 'epapirus_test';
    private const DB_USER = 'epapirus_test';
    private const DB_PASS = 'epapirus_test';

    protected Client $http;

    protected function setUp(): void
    {
        parent::setUp();

        $this->resetarBanco();

        $this->http = new Client([
            'base_uri'    => getenv('TEST_BASE_URL') ?: 'http://localhost:8001',
            'http_errors' => false, // respostas 4xx/5xx viram objeto, não exceção
            'timeout'     => 10,
        ]);
    }

    private function resetarBanco(): void
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
            // Remove CREATE DATABASE / USE: o banco de destino já foi escolhido acima.
            $sql = preg_replace('/^(CREATE DATABASE|USE) .*$/m', '', $sql);

            $consulta = $pdo->query($sql);
            // Percorre todos os comandos do arquivo para que erros em qualquer um apareçam.
            do {
            } while ($consulta->nextRowset());
        }
    }
}
