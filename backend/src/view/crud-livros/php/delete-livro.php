<?php
// Inclui o arquivo de conexão com o banco de dados
require_once 'db.php';

// Obtém o ID do livro a ser excluído a partir da URL usando o método GET
$id = $_GET['id'];

// Prepara a instrução SQL para excluir o livro pelo ID
$stmt = $pdo->prepare("DELETE FROM livros WHERE id = ?");

// Executa a instrução SQL com o ID do livro
$stmt->execute([$id]);

// Redireciona para a página de listagem de livros após a exclusão
header('Location: index-livro.php');
?>
