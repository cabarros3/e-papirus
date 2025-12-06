<?php
require_once '../../config/cors.php';
require_once '../../config/utils.php';
require_once '../../db/db.php';

// Este endpoint é apenas de leitura (GET)
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    enviarResposta("erro", "Método inválido. Use GET.", null, 405);
}

// Em um sistema real com JWT, você pegaria o ID do token aqui.
// Por enquanto, vamos pegar da URL: /api/auth/me.php?id=1
$id_usuario = isset($_GET['id']) ? $_GET['id'] : null;

if (!$id_usuario) {
    enviarResposta("erro", "ID do usuário não fornecido.", null, 400);
}

try {
    // Buscamos os dados completos (Sistema + Pessoa)
    // Ocultamos a senha e o ID interno da pessoa se não for relevante
    $sql = "SELECT 
                u.id_usuario, 
                u.email, 
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