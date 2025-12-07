<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    enviarResposta("erro", "Método inválido. Use GET.", null, 405);
}

$id_emprestimo = isset($_GET['id_emprestimo']) ? $_GET['id_emprestimo'] : null;

try {
    $sql = "SELECT 
                r.id_renovacao,
                r.data_renovacao,
                r.nova_data_devolucao,
                l.titulo,
                p.nome as nome_leitor
            FROM renovacao r
            JOIN emprestimo e ON r.id_emprestimo = e.id_emprestimo
            JOIN exemplar ex ON e.id_exemplar = ex.id_exemplar
            JOIN livro l ON ex.id_livro = l.id_livro
            JOIN pessoa p ON e.id_pessoa = p.id_pessoa";

    $params = [];
    
    if ($id_emprestimo) {
        $sql .= " WHERE r.id_emprestimo = ?";
        $params[] = $id_emprestimo;
    }

    $sql .= " ORDER BY r.data_renovacao DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $resultado = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if ($resultado) {
        enviarResposta("sucesso", "Histórico de renovações encontrado.", $resultado, 200);
    } else {
        enviarResposta("sucesso", "Nenhuma renovação encontrada.", [], 200);
    }

} catch (PDOException $e) {
    enviarResposta("erro", "Erro ao buscar: " . $e->getMessage(), null, 500);
}
?>