<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    enviarResposta("erro", "Método inválido. Use GET.", null, 405);
}

// Pegamos o ID (para busca específica) ou o 'q' (para busca geral)
$id = isset($_GET['id']) ? $_GET['id'] : null;
$busca = isset($_GET['q']) ? $_GET['q'] : null;

try {
    // 1. A Query Base permanece a mesma (com os JOINs necessários)
    // 1. A Query Base corrigida
    $sql = "SELECT 
                l.id_livro, 
                l.titulo, 
                l.capa,  /* <--- ADICIONADO AQUI */
                l.editora, 
                l.ano_publicacao,
                l.cidade_publicacao,
                l.nota_resumo,
                l.descricao_fisica,
                a.nome_assunto,
                GROUP_CONCAT(aut.nome_autor SEPARATOR ', ') as nomes_autores
            FROM livro l
            JOIN assunto a ON l.id_assunto = a.id_assunto
            LEFT JOIN livro_autor la ON l.id_livro = la.id_livro
            LEFT JOIN autor aut ON la.id_autor = aut.id_autor";

    $params = [];

    // 2. Lógica de Filtros
    if ($id) {
        // Prioridade 1: Busca por ID específico
        $sql .= " WHERE l.id_livro = ?";
        $params[] = $id;
    } elseif ($busca) {
        // Prioridade 2: Busca Geral (Barra de pesquisa)
        // O uso de parênteses (...) é CRUCIAL aqui para não quebrar a lógica com os JOINs
        $sql .= " WHERE (l.titulo LIKE ? 
                     OR l.editora LIKE ? 
                     OR l.ano_publicacao LIKE ? 
                     OR aut.nome_autor LIKE ?)";
        
        // Adicionamos o termo com curingas (%) para cada campo
        $termo = "%{$busca}%";
        $params[] = $termo; // Título
        $params[] = $termo; // Editora
        $params[] = $termo; // Ano
        $params[] = $termo; // Autor
    }

    // 3. Agrupamento (Obrigatório por causa do GROUP_CONCAT e JOIN de autores)
    $sql .= " GROUP BY l.id_livro";
    
    // 4. Ordenação (Apenas se não for busca por ID único)
    if (!$id) {
        $sql .= " ORDER BY l.titulo ASC";
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    // 5. Retorno dos Dados
    if ($id) {
        // Se pediu ID, retorna apenas um objeto (fetch)
        $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
    } else {
        // Se for lista ou busca, retorna array de objetos (fetchAll)
        $resultado = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Atenção: Se a busca retornar vazio, $resultado será false ou array vazio.
    // Para buscas, geralmente preferimos retornar 200 com array vazio do que 404.
    if ($resultado !== false) { 
        // Se for array vazio, o front recebe [] e mostra "Nenhum livro encontrado" sem dar erro.
        enviarResposta("sucesso", "Livros recuperados.", $resultado, 200);
    } else {
        // Apenas se der erro no fetch ou ID inexistente
        enviarResposta("erro", "Nenhum livro encontrado.", null, 404);
    }

} catch (PDOException $e) {
    enviarResposta("erro", "Erro no banco: " . $e->getMessage(), null, 500);
}
?>