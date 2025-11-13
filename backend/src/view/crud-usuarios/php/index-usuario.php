<?php
// Inclui o arquivo de conexão com o banco de dados
require_once 'db.php';

// Executa a consulta para obter todos os livros
$stmt = $pdo->query("SELECT * FROM usuarios");
// Recupera todos os resultados da consulta como um array associativo
$usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CRUD usuarios</title>
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
        <h2>Lista de usuarios</h2>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>CPF</th>
                    <th>Telefone</th>
                </tr>
            </thead>
            <tbody>
                <!-- Itera sobre os usuarios e cria uma linha para cada usuario na tabela -->
                <?php foreach ($usuarios as $usuario): ?>
                    <tr>
                        <!-- Exibe os dados do usuario -->
                        <td><?= $usuario['id'] ?></td>
                        <td><?= $usuario['nome'] ?></td>
                        <td><?= $usuario['email'] ?></td>
                        <td><?= $usuario['cpf'] ?></td>
                        <td><?= $usuario['telefone'] ?></td>
                        <td>
                            <!-- Links para visualizar, editar e excluir o usuario -->
                            <a href="read-usuario.php?id=<?= $usuario['id'] ?>">Visualizar</a>
                            <a href="update-usuario.php?id=<?= $usuario['id'] ?>">Editar</a>
                            <a href="delete-usuario.php?id=<?= $usuario['id'] ?>">Excluir</a>
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
