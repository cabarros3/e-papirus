<?php

namespace App\Services;

/**
 * Textos das notificações do e-Papirus
 *
 * Aqui ficam as falas e a personalidade do E-P (mascote do projeto).
 * O E-P é um robozinho curioso de outro planeta, que adora livros
 * e cuida da biblioteca do e-Papirus. Ele é fofo e prestativo na maior
 * parte do tempo, mas fica um pouco debochado quando precisa cobrar
 * prazos (véspera de entrega, atraso, etc).
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
                'cor'       => '#06d6a0',
            ],

            // ============================================
            // DEVOLUÇÃO CONFIRMADA (Atraso)
            // ============================================
            'devolucao' => [
                'titulo'    => 'Devolução Confirmada',
                'saudacao'  => 'Saudações, {nome}! É o E-P!',
                'corpo'     => "Meus sensores detectaram o retorno do livro <strong>{livro}</strong> no dia <strong>{data}</strong>. Fico impressionado com a sua capacidade de cumprir prazos. Os organismos costumam ser tão... lentos. <br><br> Mas o importante é que voltou!",
                'despedida' => 'Foi um prazer lhe ajudar! Volte sempre à biblioteca. — E-P',
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
            // LEMBRETE DE VENCIMENTO (Apenas véspera)
            // ============================================
            'lembrete' => [
                'titulo'    => 'Seu empréstimo está perto do vencimento',
                'saudacao'  => 'Saudações, {nome}! É o E-P',
                'corpo'     => "Meus circuitos indicam que o livro <strong>{livro}</strong> expira em <strong>{dias} dia(s)</strong>, precisamente em <strong>{data}</strong>.<br><br>Recomendo que mova suas extremidades biológicas até a biblioteca. O livro é de celulose, não de titânio; não quero que ele se deteriore na sua estante.",
                'despedida' => 'Estou falando sério, {nome}. Não vai me querer puxar seu pé de madrugada, né?! — E-P',
                'cor'       => '#f4a261',
            ],

            // ============================================
            // ATRASO NA DEVOLUÇÃO
            // ============================================
            'atraso' => [
                'titulo'    => 'Atraso na devolução',
                'saudacao'  => 'Saudações, {nome}... é o E-P.',
                'corpo'     => "Erro 404: Retorno não encontrado. O livro <strong>{livro}</strong> está atrasado desde <strong>{data}</strong>. Já são <strong>{dias}</strong> dias de atraso.<br><br>Eu poderia processar 10 milhões de cálculos quânticos nesse tempo, mas tive que usar meus recursos para enviar este alerta. Devolva o item, ou terei que acionar o sistema de penalidades. E acredite, não é nada agradável.",
                'despedida' => 'Espero que sua capacidade de locomoção esteja funcionando. — E-P',
                'cor'       => '#e63946',
            ],

            // ============================================
            // RESERVA DISPONÍVEL (livro devolvido)
            // ============================================
            'reserva_disponivel' => [
                'titulo'    => 'O livro que você reservou está disponível!',
                'saudacao'  => 'Olá, {nome}! O E-P aqui! 🤖',
                'corpo'     => "Boa notícia! O livro <strong>{livro}</strong> que você reservou acabou de voltar pra estante.<br><br>Pode passar na biblioteca até <strong>{data}</strong> pra retirar. Não demora, tá?",
                'despedida' => 'Te espero aqui! — E-P',
                'cor'       => '#00b4d8',
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
