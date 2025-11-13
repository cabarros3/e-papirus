<?php
    // Inclui o arquivo de conexão com o banco de dados
    require_once 'db.php';

    // Obtém o ID do usuario a partir da URL usando o método GET
    $id = $_GET['id'];

    // Prepara a instrução SQL para selecionar o usuario pelo ID
    $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE id = ?");
    // Executa a instrução SQL, passando o ID do usuario como parâmetro
    $stmt->execute([$id]);

    // Recupera os dados do usuario como um array associativo
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Detalhes do usuario</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <header>
        <h1>Bem-vindo ao Sistema de Gerenciamento de usuarios</h1>
        <nav>
            <ul>
                <li><a href="../index.php">Home</a></li>
                <li><a href="index-usuario.php">Listar usuarios</a></li>
                <li><a href="create-usuario.php">Adicionar usuario</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <h2>Detalhes do usuario</h2>
        <?php if ($usuario): ?>
            <!-- Exibe os detalhes do usuario -->
            <p><strong>ID:</strong> <?= $usuario['id'] ?></p>
            <p><strong>nome:</strong> <?= $usuario['nome'] ?></p>
            <p><strong>email:</strong> <?= $usuario['email'] ?></p>
            <p><strong>cpf:</strong> <?= $usuario['cpf'] ?></p>
            <p><strong>telefone:</strong> <?= $usuario['telefone'] ?></p>
            <p>
                <!-- Links para editar e excluir o usuario -->
                <a href="update-usuario.php?id=<?= $usuario['id'] ?>">Editar</a>
                <a href="delete-usuario.php?id=<?= $usuario['id'] ?>">Excluir</a>
            </p>
        <?php else: ?>
            <!-- Exibe uma mensagem caso o usuario não seja encontrado -->
            <p>usuario não encontrado.</p>
        <?php endif; ?>
    </main>

    <footer>
        <p>&copy; 2024 - Sistema de Gerenciamento de usuarios</p>
    </footer>
</body>
</html>
