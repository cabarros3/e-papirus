<?php
// Inclui o arquivo de conexão com o banco de dados
require_once 'db.php';

// Obtém o ID do usuario a partir da URL usando o método GET
$id = $_GET['id'];

// Prepara a instrução SQL para selecionar o aluno pelo ID
$stmt = $pdo->prepare("SELECT * FROM usuarios WHERE id = ?");

// Executa a instrução SQL, passando o ID do usuario como parâmetro
$stmt->execute([$id]);

// Recupera os dados do usuario como um array associativo
$usuario = $stmt->fetch(PDO::FETCH_ASSOC);

// Verifica se o formulário foi submetido através do método POST
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Obtém os dados enviados pelo formulário
    $nome = $_POST['nome'];
    $email = $_POST['email'];
    $cpf = $_POST['cpf'];
    $telefone = $_POST['telefone'];
    
    // Prepara a instrução SQL para atualizar os dados do usuario
    $stmt = $pdo->prepare("UPDATE usuarios SET nome = ?, email = ?, cpf = ?, telefone = ? WHERE id = ?");
    
    // Executa a instrução SQL com os novos dados do formulário
    $stmt->execute([$nome, $email, $cpf, $telefone, $id]);
    
    // Redireciona para a página de listagem de usuarios após a atualização
    header('Location: index-usuario.php');
}
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Editar usuario</title>
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
        <h2>Editar usuario</h2>
        <!-- Formulário para editar os dados do usuario -->
        <form method="POST">
            <label for="nome">nome:</label>
            <!-- Campo para inserir o nome do usuario -->
            <input type="text" id="nome" name="nome" value="<?= $usuario['nome'] ?>" required>
            
            <label for="email">email:</label>
            <!-- Campo para inserir a matrícula do usuario -->
            <input type="text" id="email" name="email" value="<?= $usuario['email'] ?>" required>
            
            <label for="cpf">cpf:</label>
            <!-- Campo para inserir a data de nascimento do usuario -->
            <input type="text" id="cpf" name="cpf" value="<?= $usuario['cpf'] ?>" required>

            <label for="telefone">telefone:</label>
            <!-- Campo para inserir a matrícula do usuario -->
            <input type="text" id="telefone" name="telefone" value="<?= $usuario['telefone'] ?>" required>
            
            
            <!-- Botão para submeter o formulário -->
            <button type="submit">Atualizar</button>
        </form>
    </main>

    <footer>
        <p>&copy; 2024 - Sistema de Gerenciamento de usuarios</p>
    </footer>
</body>
</html>
