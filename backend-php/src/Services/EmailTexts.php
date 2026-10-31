<?php

namespace App\Services;

/**
 * Textos das notificações do e-Papirus
 *
 * Aqui ficam as falas e a personalidade do E-P (mascote do projeto).
 * O E-P é um robozinho altamente inteligente e debochado que veio de outro planeta,
 * adora livros e cuida da biblioteca do e-Papirus. Ele trata humanos como
 * "organismos biológicos", mas é educado (com um ego gigante).
 *
 * Cada notificação tem:
 * - titulo: o assunto/título do e-mail
 * - saudacao: como o E-P cumprimenta o usuário
 * - corpo: o texto principal (pode usar {variaveis})
 * - despedida: como o E-P se despede
 * - cor: cor do destaque no template HTML
 *
 * Variáveis disponíveis: {nome}, {livro}, {data}, {dias}, {data_anterior},
 * {data_nova}, {observacao}, {motivo}, etc.
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
                'saudacao'  => 'Saudações, {nome}! É o E-P!',
                'corpo'     => "Meus algoritmos vasculharam a estante e localizaram a obra <strong>{livro}</strong> para sua apreciação biológica. Concedi o empréstimo até <strong>{data}</strong>.<br><br>Tente não danificar as páginas. Diferente de você, esse livro não possui um sistema de autorreparo.",
                'despedida' => 'Estarei aqui se precisar. Se divirta com este conhecimento. — E-P',
                'cor'       => '#06d6a0', // verde sucesso
            ],

            // ============================================
            // DEVOLUÇÃO CONFIRMADA
            // ============================================
            'devolucao' => [
                'titulo'    => 'Devolução Confirmada',
                'saudacao'  => 'Saudações, {nome}! É o E-P!',
                'corpo'     => "Meus sensores detectaram o retorno do livro <strong>{livro}</strong> no dia <strong>{data}</strong>. Fico impressionado com a sua capacidade de cumprir prazos. Os organismos costumam ser tão... lentos.",
                'despedida' => 'Foi um prazer lhe ajudar! Volte sempre à biblioteca. — E-P',
                'cor'       => '#06d6a0',
            ],

            // ============================================
            // RENOVAÇÃO CONFIRMADA
            // ============================================
            'renovacao' => [
                'titulo'    => 'Renovação Confirmada',
                'saudacao'  => 'Saudações, {nome}! É o E-P',
                'corpo'     => "Quem diria. O livro <strong>{livro}</strong> era para ser devolvido em <strong>{data_anterior}</strong>, mas como você parece precisar de mais tempo para processar as informações, estendi o prazo para <strong>{data_nova}</strong>.<br><br>Não me faça me arrepender desta decisão, meus sistemas têm limites.",
                'despedida' => 'Por agora aproveite. Boa leitura! — E-P',
                'cor'       => '#06d6a0',
            ],

            // ============================================
            // LEMBRETE DE VENCIMENTO (3 DIAS OU 1 DIA)
            // ============================================
            'lembrete' => [
                'titulo'    => 'Seu empréstimo está perto do vencimento',
                'saudacao'  => 'Saudações, {nome}! É o E-P',
                'corpo'     => "Meus circuitos indicam que o livro <strong>{livro}</strong> expira em <strong>{dias} dia(s)</strong>, precisamente em <strong>{data}</strong>.<br><br>Recomendo que mova suas extremidades biológicas até a biblioteca. O livro é de celulose, não de titânio; não quero que ele se deteriore na sua estante.",
                'despedida' => 'Estou falando sério, {nome}. Não vai me querer puxar seu pé de madrugada, né?! — E-P',
                'cor'       => '#f4a261', // laranja (atenção)
            ],

            // ============================================
            // ATRASO NA DEVOLUÇÃO
            // ============================================
            'atraso' => [
                'titulo'    => 'Atraso na devolução',
                'saudacao'  => 'Saudações, {nome}... é o E-P.',
                'corpo'     => "Erro 404: Retorno não encontrado. O livro <strong>{livro}</strong> está atrasado desde <strong>{data}</strong>. Já são <strong>{dias}</strong> dias de atraso.<br><br>Eu poderia processar 10 milhões de cálculos quânticos nesse tempo, mas tive que usar meus recursos para enviar este alerta. Devolva o item, ou terei que acionar o sistema de penalidades. E acredite, não é nada agradável.",
                'despedida' => 'Espero que sua capacidade de locomoção esteja funcionando. — E-P',
                'cor'       => '#e63946', // vermelho (erro)
            ],

            // ============================================
            // RESERVA DISPONÍVEL (livro devolvido)
            // ============================================
            'reserva_disponivel' => [
                'titulo'    => 'O livro que você reservou está disponível!',
                'saudacao'  => 'Saudações, {nome}! É o E-P!',
                'corpo'     => "Boa notícia para os seus receptores de dopamina: o livro <strong>{livro}</strong> que você reservou retornou ao seu devido lugar.<br><br>Você tem até <strong>{data}</strong> para vir buscá-lo. Não force meu sistema a lidar com uma reserva expirada.",
                'despedida' => 'Aguardo sua breve chegada! — E-P',
                'cor'       => '#00b4d8', // azul ciano (info)
            ],

            // ============================================
            // RESERVA FEITA (confirmação)
            // ============================================
            'reserva_feita' => [
                'titulo'    => 'Reserva Confirmada',
                'saudacao'  => 'Saudações, {nome}! É o E-P!',
                'corpo'     => "Sua requisição para o livro <strong>{livro}</strong> foi processada. Vejo que você tem bom gosto, o que me surpreende positivamente.<br><br>A reserva é válida até <strong>{data}</strong>. Fique de olho no seu e-mail.",
                'despedida' => 'Boa leitura! — E-P',
                'cor'       => '#00b4d8',
            ],

            // ============================================
            // RESERVA CONFIRMADA (virou empréstimo)
            // ============================================
            'reserva_confirmada' => [
                'titulo'    => 'Reserva Confirmada e Empréstimo Realizado',
                'saudacao'  => 'Saudações, {nome}! É o E-P!',
                'corpo'     => "A transação foi concluída. O livro <strong>{livro}</strong> agora está oficialmente sob sua custódia biológica até <strong>{data}</strong>.<br><br>Manuseie com cuidado. Lembre-se: o livro tem mais valor intrínseco que a maioria dos organismos.",
                'despedida' => 'Boa leitura! — E-P',
                'cor'       => '#06d6a0',
            ],

            // ============================================
            // RESERVA EXPIRADA
            // ============================================
            'reserva_expirada' => [
                'titulo'    => 'Sua reserva expirou',
                'saudacao'  => 'Saudações, {nome}... É o E-P.',
                'corpo'     => "A reserva do livro <strong>{livro}</strong> expirou em <strong>{data}</strong>. O tempo voa quando você está ocupado sendo um organismo... não é?<br><br>Como não houve retirada, o item voltou para o acervo. Sinta-se à vontade para tentar novamente, caso seu processamento biológico permita.",
                'despedida' => 'Sem mais delongas! — E-P',
                'cor'       => '#e63946',
            ],

            // ============================================
            // BOAS-VINDAS (novo aluno)
            // ============================================
            'boas_vindas' => [
                'titulo'    => 'Bem-vindo(a) ao e-Papirus!',
                'saudacao'  => 'Saudações, {nome}! Eu sou o E-P! Ou pode me chamar de papirinho, se preferir.',
                'corpo'     => "Seja bem-vindo à biblioteca do e-Papirus. Vejo que você é mais um ser de carbono tentando adquirir conhecimento. Sábia decisão.<br><br>Meus sistemas estão à sua disposição para:<br>📚 Escanear o acervo<br>📖 Processar empréstimos<br>🔄 Recalcular renovações<br>⭐ Gerenciar reservas<br><br>Por favor, não dobre as páginas dos livros. Eu tenho sensores térmicos e ópticos em toda a biblioteca.",
                'despedida' => 'Até logo, querido ser humano! — E-P',
                'cor'       => '#00b4d8',
            ],
        ];

        return $textos[$tipo] ?? [];
    }
}