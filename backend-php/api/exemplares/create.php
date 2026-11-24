<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    enviarResposta("erro", "Método inválido. Use POST.", null, 405);
}

$dados = json_decode(file_get_contents("php://input"), true);

$id_livro = $dados['id_livro'] ?? null;
$localizacao = $dados['localizacao'] ?? null;
$disponibilidade = $dados['disponibilidade'] ?? 'disponivel';

// --- NOVOS CAMPOS ---
// Defaults para estado_fisico e tipo_circulacao caso não sejam enviados
$estado_fisico = $dados['estado_fisico'] ?? 'bom';
$tipo_circulacao = $dados['tipo_circulacao'] ?? 'emprestavel';

// Campos de aquisição (opcionais) - Converte string vazia para NULL
$tipo_aquisicao = !empty($dados['tipo_aquisicao']) ? $dados['tipo_aquisicao'] : null;
$data_aquisicao = !empty($dados['data_aquisicao']) ? $dados['data_aquisicao'] : null;
$numero_nota_fiscal = !empty($dados['numero_nota_fiscal']) ? $dados['numero_nota_fiscal'] : null;
$fornecedor = !empty($dados['fornecedor']) ? $dados['fornecedor'] : null;
$observacao_aquisicao = !empty($dados['observacao_aquisicao']) ? $dados['observacao_aquisicao'] : null;

if (!$id_livro || !$localizacao) {
    enviarResposta("erro", "Campos obrigatórios: id_livro, localizacao", null, 400);
}

// Validação dos ENUMs para evitar Erro 500 do Banco de Dados
$estados_validos = ['bom', 'danificado', 'perdido', 'em_restauracao'];
$circulacoes_validas = ['emprestavel', 'consulta_local'];
$aquisicoes_validas = ['compra', 'doacao', 'permuta'];

if (!in_array($estado_fisico, $estados_validos)) {
    enviarResposta("erro", "Estado físico inválido.", null, 400);
}
if (!in_array($tipo_circulacao, $circulacoes_validas)) {
    enviarResposta("erro", "Tipo de circulação inválido.", null, 400);
}
if ($tipo_aquisicao && !in_array($tipo_aquisicao, $aquisicoes_validas)) {
    enviarResposta("erro", "Tipo de aquisição inválido.", null, 400);
}

try {
    // Buscar o próximo numero_exemplar para este livro
    $sqlCount = "SELECT COALESCE(MAX(numero_exemplar), 0) + 1 as proximo_numero 
                 FROM exemplar 
                 WHERE id_livro = ?";
    $stmtCount = $pdo->prepare($sqlCount);
    $stmtCount->execute([$id_livro]);
    $resultado = $stmtCount->fetch(PDO::FETCH_ASSOC);
    $numero_exemplar = $resultado['proximo_numero'];
    
    // Inserir o novo exemplar com os novos campos
    $sql = "INSERT INTO exemplar (
                id_livro, 
                numero_exemplar, 
                localizacao, 
                disponibilidade,
                estado_fisico,
                tipo_circulacao,
                tipo_aquisicao,
                data_aquisicao,
                numero_nota_fiscal,
                fornecedor,
                observacao_aquisicao
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $id_livro, 
        $numero_exemplar, 
        $localizacao, 
        $disponibilidade,
        $estado_fisico,
        $tipo_circulacao,
        $tipo_aquisicao,
        $data_aquisicao,
        $numero_nota_fiscal,
        $fornecedor,
        $observacao_aquisicao
    ]);
    
    $id_exemplar = $pdo->lastInsertId();
    
    enviarResposta("sucesso", "Exemplar criado com sucesso!", [
        'id_exemplar' => $id_exemplar,
        'numero_exemplar' => $numero_exemplar
    ], 201);
    
} catch (PDOException $e) {
    enviarResposta("erro", "Erro ao criar exemplar: " . $e->getMessage(), null, 500);
}
?>