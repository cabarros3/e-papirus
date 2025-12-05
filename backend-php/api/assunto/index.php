<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    enviarResposta("erro", "Método inválido. Use GET.", null, 405);
}

try {
    // Busca todos os assuntos ordenados pelo nome
    $sql = "SELECT * FROM assunto ORDER BY nome_assunto ASC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    
    $assuntos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    enviarResposta("sucesso", "Lista de assuntos recuperada.", $assuntos, 200);

} catch (PDOException $e) {
    enviarResposta("erro", "Erro no banco: " . $e->getMessage(), null, 500);
}
?>