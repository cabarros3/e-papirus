<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    enviarResposta("erro", "Método inválido. Use GET.", null, 405);
}

$id = isset($_GET['id']) ? $_GET['id'] : null;
$termo = isset($_GET['termo']) ? $_GET['termo'] : null;

try {
    if ($id) {
        // Busca por ID específico
        $stmt = $pdo->prepare("SELECT * FROM pessoa WHERE id_pessoa = ?");
        $stmt->execute([$id]);
        $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

    } elseif ($termo) {
        // BUSCA INTELIGENTE: Procura no Nome OU CPF OU Matrícula
        $sql = "SELECT * FROM pessoa WHERE nome LIKE ? OR cpf LIKE ? OR matricula LIKE ? ORDER BY nome ASC";
        $stmt = $pdo->prepare($sql);
        $like = "%$termo%";
        $stmt->execute([$like, $like, $like]);
        $resultado = $stmt->fetchAll(PDO::FETCH_ASSOC);

    } else {
        // Listagem geral (limitada a 50 para não pesar)
        $stmt = $pdo->prepare("SELECT * FROM pessoa ORDER BY nome ASC LIMIT 50");
        $stmt->execute();
        $resultado = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    if ($resultado) {
        enviarResposta("sucesso", "Pessoas encontradas.", $resultado, 200);
    } else {
        enviarResposta("aviso", "Nenhuma pessoa encontrada.", [], 200);
    }

} catch (PDOException $e) {
    enviarResposta("erro", "Erro ao buscar: " . $e->getMessage(), null, 500);
}
?>