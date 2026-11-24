<?php

declare(strict_types=1);

namespace Tests\Support;

use Firebase\JWT\JWT;

/**
 * Geração de tokens JWT assinados com a chave de teste da API.
 * A chave precisa ser igual ao JWT_SECRET definido em tests/subir-api-teste.sh.
 */
trait TokenHelpers
{
    protected const CHAVE_DE_TESTE = 'epapirus-chave-jwt-somente-para-testes-2026';

    /** Conteúdo do campo "data" do token (quem está logado); $sobrescrever troca campos. */
    protected function dadosDoToken(array $sobrescrever = []): array
    {
        return array_merge([
            'id_usuario' => 1,
            'id_pessoa'  => 1,
            'tipo'       => 'aluno',
            'cargo'      => null,
            'nome'       => 'Usuario de Teste',
        ], $sobrescrever);
    }

    /** Gera um JWT válido assinado com a chave de teste; $sobrescrever troca campos do payload (ex.: exp). */
    protected function gerarToken(array $sobrescrever = []): string
    {
        $payload = array_merge([
            'iss'  => 'e-papirus',
            'iat'  => time() - 120,
            'exp'  => time() + 3600,
            'data' => $this->dadosDoToken(),
        ], $sobrescrever);

        return JWT::encode($payload, self::CHAVE_DE_TESTE, 'HS256');
    }

    /** Token válido com o "data" ajustado: tipo, cargo, id_pessoa... */
    protected function tokenComDados(array $data): string
    {
        return $this->gerarToken(['data' => $this->dadosDoToken($data)]);
    }
}