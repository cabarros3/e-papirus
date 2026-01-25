<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

// Filtra por pessoa se o ID for passado via GET, caso contrário traz tudo
$idPessoa = $_GET['id_pessoa'] ?? null;

try {
    $sql = "SELECT r.*, l.titulo, p.nome as nome_pessoa 
            FROM reserva r
            JOIN livro l ON r.id_livro = l.id_livro
            JOIN pessoa p ON r.id_pessoa = p.id_pessoa";
    
    if ($idPessoa) {
        $sql .= " WHERE r.id_pessoa = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$idPessoa]);
    } else {
        $stmt = $pdo->query($sql);
    }

    $reservas = $stmt->fetchAll(PDO::FETCH_ASSOC);
    enviarResposta("sucesso", "Reservas encontradas.", $reservas, 200);

} catch (PDOException $e) {
    enviarResposta("erro", "Erro ao buscar reservas: " . $e->getMessage(), null, 500);
}
?>