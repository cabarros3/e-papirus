<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    enviarResposta("erro", "Método inválido. Use PUT.", null, 405);
}

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->id_exemplar)) {
    enviarResposta("erro", "ID do exemplar é obrigatório.", null, 400);
}

try {
    // Query dinâmica para atualizar apenas o que foi enviado
    $campos = [];
    $params = [];

    if (property_exists($data, 'localizacao')) {
        $campos[] = "localizacao = ?";
        $params[] = $data->localizacao;
    }
    
    if (property_exists($data, 'disponibilidade')) {
        // ISSUE: Adicionado 'quarentena' nos valores válidos
        $validos = ['disponivel', 'emprestado', 'reservado', 'quarentena'];
        if (!in_array($data->disponibilidade, $validos)) {
            enviarResposta("erro", "Status inválido. Use: disponivel, emprestado, reservado ou quarentena.", null, 400);
        }
        $campos[] = "disponibilidade = ?";
        $params[] = $data->disponibilidade;
    }

    // --- NOVOS CAMPOS (ESTADO E CIRCULAÇÃO) ---
    if (property_exists($data, 'estado_fisico')) {
        $validos = ['bom', 'danificado', 'perdido', 'em_restauracao'];
        if (!in_array($data->estado_fisico, $validos)) {
            enviarResposta("erro", "Estado físico inválido.", null, 400);
        }
        $campos[] = "estado_fisico = ?";
        $params[] = $data->estado_fisico;
    }

    if (property_exists($data, 'tipo_circulacao')) {
        $validos = ['emprestavel', 'consulta_local'];
        if (!in_array($data->tipo_circulacao, $validos)) {
            enviarResposta("erro", "Tipo de circulação inválido.", null, 400);
        }
        $campos[] = "tipo_circulacao = ?";
        $params[] = $data->tipo_circulacao;
    }

    // --- NOVOS CAMPOS (AQUISIÇÃO - Aceitam NULL para limpar o dado) ---
    if (property_exists($data, 'tipo_aquisicao')) {
        if (empty($data->tipo_aquisicao)) {
            $campos[] = "tipo_aquisicao = ?";
            $params[] = null;
        } else {
            $validos = ['compra', 'doacao', 'permuta'];
            if (!in_array($data->tipo_aquisicao, $validos)) {
                enviarResposta("erro", "Tipo de aquisição inválido.", null, 400);
            }
            $campos[] = "tipo_aquisicao = ?";
            $params[] = $data->tipo_aquisicao;
        }
    }

    if (property_exists($data, 'data_aquisicao')) {
        $campos[] = "data_aquisicao = ?";
        $params[] = empty($data->data_aquisicao) ? null : $data->data_aquisicao;
    }

    if (property_exists($data, 'numero_nota_fiscal')) {
        $campos[] = "numero_nota_fiscal = ?";
        $params[] = empty($data->numero_nota_fiscal) ? null : $data->numero_nota_fiscal;
    }

    if (property_exists($data, 'fornecedor')) {
        $campos[] = "fornecedor = ?";
        $params[] = empty($data->fornecedor) ? null : $data->fornecedor;
    }

    if (property_exists($data, 'observacao_aquisicao')) {
        $campos[] = "observacao_aquisicao = ?";
        $params[] = empty($data->observacao_aquisicao) ? null : $data->observacao_aquisicao;
    }

    if (empty($campos)) {
        enviarResposta("erro", "Nenhum dado informado para atualização.", null, 400);
    }

    // Adiciona o ID no final dos parâmetros para o WHERE
    $params[] = $data->id_exemplar;

    $sql = "UPDATE exemplar SET " . implode(", ", $campos) . " WHERE id_exemplar = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    if ($stmt->rowCount() > 0) {
        enviarResposta("sucesso", "Exemplar atualizado com sucesso.", null, 200);
    } else {
        enviarResposta("aviso", "Nenhuma alteração feita (verifique o ID ou se os dados são iguais).", null, 200);
    }

} catch (PDOException $e) {
    enviarResposta("erro", "Erro ao atualizar: " . $e->getMessage(), null, 500);
}
?>