<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    enviarResposta("erro", "Método inválido. Use GET.", null, 405);
}

$id_pessoa = isset($_GET['id_pessoa']) ? $_GET['id_pessoa'] : null;

if (!$id_pessoa) {
    enviarResposta("erro", "ID da pessoa é obrigatório.", null, 400);
}

try {
    $hoje = date('Y-m-d');
    $dados = [];

    // 1. CARDS DE CIMA (Métricas)
    
    // Total Emprestados Agora
    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM emprestimo WHERE id_pessoa = ? AND data_devolucao IS NULL");
    $stmt->execute([$id_pessoa]);
    $dados['ativos'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

    // Total Atrasados
    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM emprestimo WHERE id_pessoa = ? AND data_devolucao IS NULL AND data_prevista < ?");
    $stmt->execute([$id_pessoa, $hoje]);
    $dados['atrasados'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

    // Total Histórico (Quantos livros já leu na vida)
    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM emprestimo WHERE id_pessoa = ? AND data_devolucao IS NOT NULL");
    $stmt->execute([$id_pessoa]);
    $dados['historico_lidos'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

    // 2. LISTA DE LIVROS ATUAIS (Para mostrar na Home)
    $sqlLista = "SELECT 
                    e.id_emprestimo,
                    e.data_emprestimo,
                    e.data_prevista,
                    l.titulo,
                    l.capa
                 FROM emprestimo e
                 JOIN exemplar ex ON e.id_exemplar = ex.id_exemplar
                 JOIN livro l ON ex.id_livro = l.id_livro
                 WHERE e.id_pessoa = ? AND e.data_devolucao IS NULL
                 ORDER BY e.data_prevista ASC"; // Ordena pelo que vence primeiro
    
    $stmtLista = $pdo->prepare($sqlLista);
    $stmtLista->execute([$id_pessoa]);
    $lista = $stmtLista->fetchAll(PDO::FETCH_ASSOC);

    // Processa status visual para cada livro
    foreach($lista as &$item) {
        if ($hoje > $item['data_prevista']) {
            $item['status_texto'] = "Atrasado!";
            $item['cor'] = "red";
        } elseif ($hoje == $item['data_prevista']) {
            $item['status_texto'] = "Vence Hoje!";
            $item['cor'] = "orange";
        } else {
            // Calcula dias restantes
            $d1 = new DateTime($hoje);
            $d2 = new DateTime($item['data_prevista']);
            $diff = $d1->diff($d2);
            $item['status_texto'] = "Vence em " . $diff->days . " dias";
            $item['cor'] = "blue";
        }
    }

    $dados['meus_livros'] = $lista;

    enviarResposta("sucesso", "Dashboard do usuário carregado.", $dados, 200);

} catch (PDOException $e) {
    enviarResposta("erro", "Erro ao carregar dashboard: " . $e->getMessage(), null, 500);
}
?>