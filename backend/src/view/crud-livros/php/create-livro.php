<?php
// Inclui o arquivo de conexão com o banco de dados
require_once 'db.php';

// Verifica se o formulário foi submetido através do método POST
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Obtém os dados enviados pelo formulário
    $titulo = $_POST['titulo'];
    $editora = $_POST['editora'];
    $ano = $_POST['ano'];
   
    
    // Prepara a instrução SQL para inserir um novo livro no banco de dados
    $stmt = $pdo->prepare("INSERT INTO Livros (titulo, editora, ano) VALUES (?, ?, ?)");
    
    // Executa a instrução SQL com os dados do formulário
    $stmt->execute([$titulo, $editora, $ano]);
    
    // Redireciona para a página de listagem de Livros após a inserção
    header('Location: index-livro.php');
}
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Adicionar livro</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <header>
        <h1>Bem-vindo ao Sistema de Gerenciamento de Livros</h1>
        <nav>
            <ul>
                <li><a href="../index.php">Home</a></li>
                <li><a href="index-livro.php">Listar Livros</a></li>
                <li><a href="create-livro.php">Adicionar livro</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <h2>Adicionar livro</h2>
        <!-- Formulário para adicionar um novo livro -->
        <form method="POST">
            <label for="titulo">titulo:</label>
            <input type="text" id="titulo" name="titulo" required>
            
            <label for="editora">editora:</label>
            <input type="text" id="editora" name="editora" required>
            
            <label for="ano">Ano:</label>
            <input type="date" id="ano" name="ano" required>
            
            
            <!-- Botão para submeter o formulário -->
            <button type="submit">Adicionar</button>
        </form>
    </main>

    <footer>
        <p>&copy; 2024 - Sistema de Gerenciamento de Livros</p>
    </footer>
</body>
</html>
