<?php

declare(strict_types=1);

namespace Tests\Api;

use Tests\Support\TestCase;

/**
 * Teste de fumaça: prova que PHPUnit, Guzzle, a API de teste e o banco de teste
 * funcionam juntos (cadastra um usuário novo e faz login com ele).
 */
final class SmokeTest extends TestCase
{
    public function testApiCadastraEAutenticaUsuario(): void
    {
        $registro = $this->http->post('/api/auth/register.php', [
            'json' => [
                'nome'      => 'Usuário de Teste',
                'matricula' => '20260001',
                'cpf'       => '52998224725',
                'email'     => 'teste@epapirus.local',
                'senha'     => 'senha-de-teste-123',
                'tipo'      => 'aluno',
                'telefone'  => '81999990000',
            ],
        ]);

        $this->assertContains(
            $registro->getStatusCode(),
            [200, 201],
            'Cadastro falhou: ' . (string) $registro->getBody()
        );

        $login = $this->http->post('/api/auth/login.php', [
            'json' => [
                'email' => 'teste@epapirus.local',
                'senha' => 'senha-de-teste-123',
            ],
        ]);

        $this->assertSame(
            200,
            $login->getStatusCode(),
            'Login falhou: ' . (string) $login->getBody()
        );

        $corpo = json_decode((string) $login->getBody(), true);
        $this->assertIsArray($corpo, 'A resposta do login deveria ser um JSON.');
    }
}