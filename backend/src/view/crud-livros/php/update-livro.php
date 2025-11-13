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

// Verifica se o formulário foi submetido através do método POST
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Obtém os dados enviados pelo formulário
    $titulo = $_POST['titulo'];
    $editora = $_POST['editora'];
    $ano = $_POST['ano'];
    
    // Prepara a instrução SQL para atualizar os dados do livro
    $stmt = $pdo->prepare("UPDATE livros SET titulo = ?, editora = ?, ano = ? WHERE id = ?");
    
    // Executa a instrução SQL com os novos dados do formulário
    $stmt->execute([$titulo, $editora, $ano, $id]);
    
    // Redireciona para a página de listagem de livros após a atualização
    header('Location: index-livro.php');
}
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Editar livro</title>
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
        <h2>Editar livro</h2>
        <!-- Formulário para editar os dados do livro -->
        <form method="POST">
            <label for="titulo">Titulo:</label>
            <!-- Campo para inserir o titulo do livro -->
            <input type="text" id="titulo" name="titulo" value="<?= $livro['titulo'] ?>" required>
            
            <label for="editora">Editora:</label>
            <!-- Campo para inserir a matrícula do livro -->
            <input type="text" id="editora" name="editora" value="<?= $livro['editora'] ?>" required>
            
            <label for="ano">Ano:</label>
            <!-- Campo para inserir a data de nascimento do livro -->
            <input type="date" id="ano" name="ano" value="<?= $livro['ano'] ?>" required>
            
            
            <!-- Botão para submeter o formulário -->
            <button type="submit">Atualizar</button>
        </form>
    </main>

    <footer>
        <p>&copy; 2024 - Sistema de Gerenciamento de livros</p>
    </footer>
</body>
</html>
