<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    enviarResposta("erro", "Método inválido. Use GET.", null, 405);
}

// Filtros: status (todos, pendente, devolvido, atrasado, em_dia) e id_pessoa
$status = isset($_GET['status']) ? $_GET['status'] : 'todos';
$id_pessoa = isset($_GET['id_pessoa']) ? $_GET['id_pessoa'] : null;
$id_exemplar = isset($_GET['id_exemplar']) ? $_GET['id_exemplar'] : null;

try {
    $sql = "SELECT 
                emp.id_emprestimo,
                emp.data_emprestimo,
                emp.data_prevista,
                emp.data_devolucao,
                l.titulo,
                l.id_livro,
                e.id_exemplar,
                p.nome as nome_pessoa,
                p.tipo as tipo_pessoa,
                p.email as email_pessoa
            FROM emprestimo emp
            JOIN exemplar e ON emp.id_exemplar = e.id_exemplar
            JOIN livro l ON e.id_livro = l.id_livro
            JOIN pessoa p ON emp.id_pessoa = p.id_pessoa";

    $conditions = [];
    $params = [];
    $dataHoje = date('Y-m-d'); // Data atual do servidor PHP

    // --- LÓGICA DE FILTROS APRIMORADA ---

    if ($status === 'pendente') {
        // Tudo que está com o leitor (independente se atrasou ou não)
        $conditions[] = "emp.data_devolucao IS NULL";
    
    } elseif ($status === 'devolvido') {
        // Tudo que já foi devolvido
        $conditions[] = "emp.data_devolucao IS NOT NULL";
    
    } elseif ($status === 'atrasado') {
        // Não devolvido E data prevista é MENOR que hoje
        $conditions[] = "emp.data_devolucao IS NULL";
        $conditions[] = "emp.data_prevista < ?";
        $params[] = $dataHoje;
    
    } elseif ($status === 'em_dia') {
        // Não devolvido E data prevista é MAIOR ou IGUAL a hoje
        $conditions[] = "emp.data_devolucao IS NULL";
        $conditions[] = "emp.data_prevista >= ?";
        $params[] = $dataHoje;
    }
    // Se for 'todos', não entra em nenhum if e traz tudo.



    // Filtro por Exemplar
    if ($id_exemplar) {
        $conditions[] = "emp.id_exemplar = ?";
        $params[] = $id_exemplar;
    }

    // Filtro por Pessoa
    if ($id_pessoa) {
        $conditions[] = "emp.id_pessoa = ?";
        $params[] = $id_pessoa;
    }

    // Monta o SQL final
    if (count($conditions) > 0) {
        $sql .= " WHERE " . implode(" AND ", $conditions);
    }

    $sql .= " ORDER BY emp.data_devolucao ASC, emp.data_emprestimo DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $resultado = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Adiciona o status visual (cores e textos) para o Front-end
    foreach($resultado as &$row) {
        if ($row['data_devolucao'] !== null) {
            $row['situacao'] = 'Finalizado';
            $row['cor'] = 'green';
        } else {
            if ($dataHoje > $row['data_prevista']) {
                $row['situacao'] = 'Atrasado';
                $row['cor'] = 'red';
            } else {
                $row['situacao'] = 'Em dia';
                $row['cor'] = 'blue';
            }
        }
    }

    if ($resultado) {
        enviarResposta("sucesso", count($resultado) . " registros encontrados.", $resultado, 200);
    } else {
        // Retorna array vazio em vez de erro 404 para filtros vazios (melhor para o front)
        enviarResposta("sucesso", "Nenhum registro encontrado para este filtro.", [], 200);
    }

} catch (PDOException $e) {
    enviarResposta("erro", "Erro ao buscar: " . $e->getMessage(), null, 500);
}
?>