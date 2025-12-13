<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    enviarResposta("erro", "Método inválido. Use GET.", null, 405);
}

try {
    $hoje = date('Y-m-d');
    $dados = [];

    // 1. CARDS DE INVENTÁRIO
    $dados['total_livros'] = $pdo->query("SELECT COUNT(*) FROM livro")->fetchColumn();
    $dados['total_exemplares'] = $pdo->query("SELECT COUNT(*) FROM exemplar")->fetchColumn();
    $dados['total_usuarios'] = $pdo->query("SELECT COUNT(*) FROM pessoa")->fetchColumn();

    // 2. CARDS DE CIRCULAÇÃO
    $dados['emprestimos_ativos'] = $pdo->query("SELECT COUNT(*) FROM emprestimo WHERE data_devolucao IS NULL")->fetchColumn();
    
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM emprestimo WHERE data_devolucao IS NULL AND data_prevista < ?");
    $stmt->execute([$hoje]);
    $dados['emprestimos_atrasados'] = $stmt->fetchColumn();

    // 3. ÚLTIMAS MOVIMENTAÇÕES (Feed de atividade)
    // Mostra os últimos 5 empréstimos feitos
    $sqlFeed = "SELECT 
                    p.nome as leitor,
                    l.titulo,
                    e.data_emprestimo
                FROM emprestimo e
                JOIN pessoa p ON e.id_pessoa = p.id_pessoa
                JOIN exemplar ex ON e.id_exemplar = ex.id_exemplar
                JOIN livro l ON ex.id_livro = l.id_livro
                ORDER BY e.data_emprestimo DESC, e.id_emprestimo DESC
                LIMIT 5";
    
    $dados['atividade_recente'] = $pdo->query($sqlFeed)->fetchAll(PDO::FETCH_ASSOC);

    // 4. LIVROS MAIS EMPRESTADOS (TOP 5) - Bônus para relatórios
    $sqlTop = "SELECT l.titulo, COUNT(e.id_emprestimo) as total_saidas
               FROM emprestimo e
               JOIN exemplar ex ON e.id_exemplar = ex.id_exemplar
               JOIN livro l ON ex.id_livro = l.id_livro
               GROUP BY l.id_livro
               ORDER BY total_saidas DESC
               LIMIT 5";
    
    $dados['top_livros'] = $pdo->query($sqlTop)->fetchAll(PDO::FETCH_ASSOC);

    enviarResposta("sucesso", "Dashboard admin carregado.", $dados, 200);

} catch (PDOException $e) {
    enviarResposta("erro", "Erro no dashboard: " . $e->getMessage(), null, 500);
}
?>