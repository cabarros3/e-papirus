<?php
    // Inclui o arquivo de conexão com o banco de dados
    require_once 'db.php';

    // Obtém o ID do aluno a partir da URL usando o método GET
    $id = $_GET['id'];

    // Prepara a instrução SQL para selecionar o aluno pelo ID
    $stmt = $pdo->prepare("SELECT * FROM livros WHERE id = ?");
    // Executa a instrução SQL, passando o ID do livro como parâmetro
    $stmt->execute([$id]);

    // Recupera os dados do livro como um array associativo
    $livro = $stmt->fetch(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Detalhes do livro</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <header>
        <h1>Bem-vindo ao Sistema de Gerenciamento de livros</h1>
        <nav>
            <ul>
                <li><a href="../index.php">Home</a></li>
                <li><a href="index-livro.php">Listar livros</a></li>
                <li><a href="create-livro.php">Adicionar livro</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <h2>Detalhes do livro</h2>
        <?php if ($livro): ?>
            <!-- Exibe os detalhes do livro -->
            <p><strong>ID:</strong> <?= $livro['id'] ?></p>
            <p><strong>titulo:</strong> <?= $livro['titulo'] ?></p>
            <p><strong>Editora:</strong> <?= $livro['editora'] ?></p>
            <p><strong>Ano:</strong> <?= $livro['ano'] ?></p>
            <p>
                <!-- Links para editar e excluir o livro -->
                <a href="update-livro.php?id=<?= $livro['id'] ?>">Editar</a>
                <a href="delete-livro.php?id=<?= $livro['id'] ?>">Excluir</a>
            </p>
        <?php else: ?>
            <!-- Exibe uma mensagem caso o livro não seja encontrado -->
            <p>livro não encontrado.</p>
        <?php endif; ?>
    </main>

    <footer>
        <p>&copy; 2024 - Sistema de Gerenciamento de livros</p>
    </footer>
</body>
</html>
