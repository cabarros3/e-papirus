<?php

namespace App\Services;

/**
 * Textos das notificações do e-Papirus
 *
 * ⚠️ Esse é o arquivo que Yuri ira editar posteriormente!
 *
 * Aqui ficam as falas e a personalidade do E-P (mascote do projeto).
 * O E-P é um robozinho curioso de outro planeta, que adora livros
 * e cuida da biblioteca do e-Papirus.
 *
 * Cada notificação tem:
 * - titulo: o assunto/título do e-mail
 * - saudacao: como o E-P cumprimenta o usuário
 * - corpo: o texto principal (pode usar {variaveis})
 * - despedida: como o E-P se despede
 *
 * Variáveis disponíveis: {nome}, {livro}, {data}, {dias}, {motivo}, etc.
 * (cada tipo de notificação tem suas variáveis específicas)
 */
class EmailTexts
{
    public static function get($tipo): array
    {
        $textos = [
            // ============================================
            // EMPRÉSTIMO CONFIRMADO
            // ============================================
            'emprestimo' => [
                'titulo'    => 'Empréstimo Confirmado',
                'saudacao'  => 'Olá, {nome}! O E-P aqui! 🤖',
                'corpo'     => "Fui até a estante e encontrei o livro <strong>{livro}</strong> pra você. É seu por enquanto!<br><br>Você tem até <strong>{data}</strong> pra devolver. Capricha na leitura!",
                'despedida' => 'Boa leitura! Qualquer coisa, é só me chamar. — E-P',
                'cor'       => '#06d6a0', // verde sucesso
            ],

            // ============================================
            // DEVOLUÇÃO CONFIRMADA
            // ============================================
            'devolucao' => [
                'titulo'    => 'Devolução Confirmada',
                'saudacao'  => 'Olá, {nome}! O E-P aqui! 🤖',
                'corpo'     => "Recebi de volta o livro <strong>{livro}</strong> no dia <strong>{data}</strong>. Obrigado por cuidar direitinho dele!<br><br>{observacao}",
                'despedida' => 'Foi um prazer! Volte sempre à biblioteca. — E-P',
                'cor'       => '#06d6a0',
            ],

            // ============================================
            // RENOVAÇÃO CONFIRMADA
            // ============================================
            'renovacao' => [
                'titulo'    => 'Renovação Confirmada',
                'saudacao'  => 'Olá, {nome}! O E-P aqui! 🤖',
                'corpo'     => "Renovei o empréstimo do livro <strong>{livro}</strong> pra você!<br><br>A data anterior era <strong>{data_anterior}</strong>.<br>A nova data de devolução é <strong>{data_nova}</strong>.",
                'despedida' => 'Fique tranquilo, agora você tem mais tempo. Boa leitura! — E-P',
                'cor'       => '#06d6a0',
            ],

            // ============================================
            // LEMBRETE DE VENCIMENTO (3 DIAS OU 1 DIA)
            // ============================================
            'lembrete' => [
                'titulo'    => 'Seu empréstimo está perto do vencimento',
                'saudacao'  => 'Olá, {nome}! O E-P aqui! 🤖',
                'corpo'     => "Passei pra lembrar: o livro <strong>{livro}</strong> vence em <strong>{dias} dia(s)</strong>.<br><br>A data prevista é <strong>{data}</strong>. Devolve direitinho pra eu poder emprestar pra outra pessoa?",
                'despedida' => 'Obrigado pela parceria! — E-P',
                'cor'       => '#f4a261', // laranja (atenção)
            ],

            // ============================================
            // ATRASO NA DEVOLUÇÃO
            // ============================================
            'atraso' => [
                'titulo'    => 'Atraso na devolução',
                'saudacao'  => 'Oi, {nome}... o E-P tá preocupado 😟',
                'corpo'     => "O livro <strong>{livro}</strong> tá atrasado desde <strong>{data}</strong>. Já são <strong>{dias}</strong> dia(s) de atraso.<br><br>Pode devolver? Tô doidinho pra reencontrar esse exemplar!",
                'despedida' => 'Prometo não contar pra ninguém se você devolver hoje! 😅 — E-P',
                'cor'       => '#e63946', // vermelho (erro)
            ],

            // ============================================
            // RESERVA DISPONÍVEL (livro devolvido)
            // ============================================
            'reserva_disponivel' => [
                'titulo'    => 'O livro que você reservou está disponível!',
                'saudacao'  => 'Olá, {nome}! O E-P aqui! 🤖',
                'corpo'     => "Boa notícia! O livro <strong>{livro}</strong> que você reservou acabou de voltar pra estante.<br><br>Pode passar na biblioteca até <strong>{data}</strong> pra retirar. Não demora, tá?",
                'despedida' => 'Te espero aqui! — E-P',
                'cor'       => '#00b4d8', // azul ciano (info)
            ],

            // ============================================
            // RESERVA FEITA (confirmação)
            // ============================================
            'reserva_feita' => [
                'titulo'    => 'Reserva Confirmada',
                'saudacao'  => 'Olá, {nome}! O E-P aqui! 🤖',
                'corpo'     => "Reservei o livro <strong>{livro}</strong> pra você!<br><br>Assim que ele voltar pra estante, te aviso. A reserva é válida até <strong>{data}</strong>.",
                'despedida' => 'Pode deixar que eu cuido disso! — E-P',
                'cor'       => '#00b4d8',
            ],

            // ============================================
            // RESERVA CONFIRMADA (virou empréstimo)
            // ============================================
            'reserva_confirmada' => [
                'titulo'    => 'Reserva Confirmada e Empréstimo Realizado',
                'saudacao'  => 'Olá, {nome}! O E-P aqui! 🤖',
                'corpo'     => "Sua reserva do livro <strong>{livro}</strong> foi confirmada!<br><br>Agora é oficial: o livro é seu até <strong>{data}</strong>. Cuida bem dele!",
                'despedida' => 'Boa leitura! — E-P',
                'cor'       => '#06d6a0',
            ],

            // ============================================
            // RESERVA EXPIRADA
            // ============================================
            'reserva_expirada' => [
                'titulo'    => 'Sua reserva expirou',
                'saudacao'  => 'Olá, {nome}... o E-P aqui.',
                'corpo'     => "Poxa, sua reserva do livro <strong>{livro}</strong> expirou em <strong>{data}</strong>.<br><br>Como o livro não foi retirado no prazo, ele voltou pra estante. Mas fica tranquilo! Você pode fazer uma nova reserva quando quiser.",
                'despedida' => 'Qualquer coisa, tô por aqui! — E-P',
                'cor'       => '#e63946',
            ],

            // ============================================
            // BOAS-VINDAS (novo aluno)
            // ============================================
            'boas_vindas' => [
                'titulo'    => 'Bem-vindo(a) ao e-Papirus!',
                'saudacao'  => 'Olá, {nome}! Eu sou o E-P! 🤖💙',
                'corpo'     => "Que bom te ver por aqui! Sou o robozinho curioso que cuida da biblioteca do e-Papirus.<br><br>Comigo você pode:<br>📚 Explorar o acervo completo<br>📖 Emprestar livros<br>🔄 Renovar empréstimos<br>⭐ Fazer reservas<br><br>Conta comigo pra te ajudar com tudo!",
                'despedida' => 'Até logo! — E-P',
                'cor'       => '#00b4d8',
            ],
        ];

        return $textos[$tipo] ?? [];
    }
}
