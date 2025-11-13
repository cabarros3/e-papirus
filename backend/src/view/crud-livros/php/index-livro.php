<?php
// Inclui o arquivo de conexão com o banco de dados
require_once 'db.php';

// Executa a consulta para obter todos os livros
$stmt = $pdo->query("SELECT * FROM livros");
// Recupera todos os resultados da consulta como um array associativo
$livros = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CRUD livros</title>
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
        <h2>Lista de livros</h2>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Título</th>
                    <th>Editora</th>
                    <th>Ano</th>
                </tr>
            </thead>
            <tbody>
                <!-- Itera sobre os livros e cria uma linha para cada livro na tabela -->
                <?php foreach ($livros as $livro): ?>
                    <tr>
                        <!-- Exibe os dados do livro -->
                        <td><?= $livro['id'] ?></td>
                        <td><?= $livro['titulo'] ?></td>
                        <td><?= $livro['editora'] ?></td>
                        <td><?= $livro['ano'] ?></td>
                        <td>
                            <!-- Links para visualizar, editar e excluir o livro -->
                            <a href="read-livro.php?id=<?= $livro['id'] ?>">Visualizar</a>
                            <a href="update-livro.php?id=<?= $livro['id'] ?>">Editar</a>
                            <a href="delete-livro.php?id=<?= $livro['id'] ?>">Excluir</a>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </main>

    <footer>
        <p>&copy; 2024 - Sistema de Gerenciamento de livros</p>
    </footer>
</body>
</html>
