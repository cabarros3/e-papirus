<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/utils.php';
require_once __DIR__ . '/../../db/db.php';

// --- GUARD: Validação de Segurança ---
// A função validarTokenJWT() no seu utils.php já retorna $decoded->data
$usuarioLogado = validarTokenJWT(); 

// AJUSTE: Acessamos o 'tipo' diretamente, pois os dados já foram extraídos no utils.php
if ($usuarioLogado->tipo !== 'funcionario') {
    enviarResposta("erro", "Acesso negado. Apenas funcionários podem acessar.", null, 403);
}
// -------------------------------------

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    enviarResposta("erro", "Método inválido. Use GET.", null, 405);
}

try {
    $hoje = date('Y-m-d');
    $dados = [];

    // 1. Inventário
    $dados['total_livros'] = $pdo->query("SELECT COUNT(*) FROM livro")->fetchColumn();
    $dados['total_exemplares'] = $pdo->query("SELECT COUNT(*) FROM exemplar")->fetchColumn();
    $dados['total_usuarios'] = $pdo->query("SELECT COUNT(*) FROM pessoa")->fetchColumn();

    // 2. Circulação
    $dados['emprestimos_ativos'] = $pdo->query("SELECT COUNT(*) FROM emprestimo WHERE data_devolucao IS NULL")->fetchColumn();
    
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM emprestimo WHERE data_devolucao IS NULL AND data_prevista < ?");
    $stmt->execute([$hoje]);
    $dados['emprestimos_atrasados'] = $stmt->fetchColumn();

    // 3. Atividade Recente (Feed de atividade)
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

    // 4. Livros Mais Emprestados (TOP 5)
    // AJUSTE: Adicionada a coluna l.capa (ou o nome real da coluna no seu banco)
    $sqlTop = "SELECT l.titulo, l.capa, COUNT(e.id_emprestimo) as total_saidas
            FROM emprestimo e
            JOIN exemplar ex ON e.id_exemplar = ex.id_exemplar
            JOIN livro l ON ex.id_livro = l.id_livro
            GROUP BY l.id_livro, l.titulo, l.capa
            ORDER BY total_saidas DESC
            LIMIT 5";

    $dados['top_livros'] = $pdo->query($sqlTop)->fetchAll(PDO::FETCH_ASSOC);

    enviarResposta("sucesso", "Dados carregados com sucesso.", $dados, 200);

} catch (PDOException $e) {
    enviarResposta("erro", "Erro no processamento do banco de dados: " . $e->getMessage(), null, 500);
}