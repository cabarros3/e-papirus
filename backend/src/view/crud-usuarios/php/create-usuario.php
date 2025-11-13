<?php

require_once 'db.php';


if ($_SERVER['REQUEST_METHOD'] == 'POST') {

    $nome = $_POST['nome'];
    $email = $_POST['email'];
    $cpf = $_POST['cpf'];
    $telefone = $_POST['telefone'];
   
    
    // Prepara a instrução SQL para inserir um novo livro no banco de dados
    $stmt = $pdo->prepare("INSERT INTO usuarios (nome, email, cpf, telefone) VALUES (?, ?, ?, ?)");
    
    // Executa a instrução SQL com os dados do formulário
    $stmt->execute([$nome, $email, $cpf, $telefone]);
    
    // Redireciona para a página de listagem de usuarios após a inserção
    header('Location: index-aluno.php');
}
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Adicionar aluno</title>
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
        <h2>Adicionar usuario</h2>
        <!-- Formulário para adicionar um novo usuario -->
        <form method="POST">
            <label for="nome">nome:</label>
            <input type="text" id="nome" name="nome" required>
            
            <label for="email">email:</label>
            <input type="text" id="email" name="email" required>

            <label for="cpf">cpf:</label>
            <input type="text" id="cpf" name="cpf" required>

            <label for="telefone">telefone:</label>
            <input type="telefone" id="telefone" name="telefone" required>
            
            
            
            
            <!-- Botão para submeter o formulário -->
            <button type="submit">Adicionar</button>
        </form>
    </main>

    <footer>
        <p>&copy; 2024 - Sistema de Gerenciamento de usuarios</p>
    </footer>
</body>
</html>
