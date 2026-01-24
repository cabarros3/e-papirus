<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    enviarResposta("erro", "Método inválido. Use GET.", null, 405);
}

$id_livro = isset($_GET['id_livro']) ? $_GET['id_livro'] : null;
$id_exemplar = isset($_GET['id']) ? $_GET['id'] : null;

try {
    // CONEXÃO: Busca livros com seus exemplares agrupados
    $sql = "SELECT 
                l.id_livro,
                l.titulo,
                l.editora,
                e.id_exemplar,
                e.localizacao,
                e.disponibilidade,
                e.numero_exemplar
            FROM livro l
            LEFT JOIN exemplar e ON e.id_livro = l.id_livro";
    
    $params = [];
    $conditions = [];
    
    // Filtros dinâmicos
    if ($id_exemplar) {
        $conditions[] = "e.id_exemplar = ?";
        $params[] = $id_exemplar;
    }
    
    if ($id_livro) {
        $conditions[] = "l.id_livro = ?";
        $params[] = $id_livro;
    }
    
    if (count($conditions) > 0) {
        $sql .= " WHERE " . implode(" AND ", $conditions);
    }
    
    $sql .= " ORDER BY l.titulo ASC, e.numero_exemplar ASC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $resultado = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if ($resultado) {
        // Agrupar exemplares por livro
        $livrosAgrupados = [];
        
        foreach ($resultado as $row) {
            $id_livro = $row['id_livro'];
            
            // Se o livro ainda não existe no array, criar
            if (!isset($livrosAgrupados[$id_livro])) {
                $livrosAgrupados[$id_livro] = [
                    'id_livro' => $row['id_livro'],
                    'titulo' => $row['titulo'],
                    'editora' => $row['editora'],
                    'exemplares' => []
                ];
            }
            
            // Adicionar exemplar se existir
            if ($row['id_exemplar']) {
                $livrosAgrupados[$id_livro]['exemplares'][] = [
                    'id_exemplar' => $row['id_exemplar'],
                    'numero_exemplar' => $row['numero_exemplar'],
                    'localizacao' => $row['localizacao'],
                    'disponibilidade' => $row['disponibilidade']
                ];
            }
        }
        
        // Converter para array indexado
        $livrosAgrupados = array_values($livrosAgrupados);
        
        enviarResposta("sucesso", "Exemplares encontrados.", $livrosAgrupados, 200);
    } else {
        enviarResposta("erro", "Nenhum exemplar encontrado.", null, 404);
    }
    
} catch (PDOException $e) {
    enviarResposta("erro", "Erro ao buscar exemplares: " . $e->getMessage(), null, 500);
}
?>