<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    enviarResposta("erro", "Método inválido. Use GET.", null, 405);
}

$id_usuario = isset($_GET['id']) ? $_GET['id'] : null;

try {
    // AQUI ESTÁ O TRUQUE: Adicionei p.id_pessoa na seleção
    $sql = "SELECT 
                u.id_usuario, 
                u.email, 
                p.id_pessoa, 
                p.nome, 
                p.matricula, 
                p.cpf, 
                p.telefone, 
                p.tipo 
            FROM usuario_sistema u
            JOIN pessoa p ON u.id_pessoa = p.id_pessoa
            WHERE u.id_usuario = ?";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$id_usuario]);
    $dadosUsuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($dadosUsuario) {
        enviarResposta("sucesso", "Dados do usuário recuperados.", $dadosUsuario, 200);
    } else {
        enviarResposta("erro", "Usuário não encontrado.", null, 404);
    }

} catch (PDOException $e) {
    enviarResposta("erro", "Erro no banco: " . $e->getMessage(), null, 500);
}
?>