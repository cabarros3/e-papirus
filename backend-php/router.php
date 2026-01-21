<?php
// Router para o servidor PHP embutido

$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Remove query string da URI
$path = parse_url($requestUri, PHP_URL_PATH);

// Remove a barra final se existir (exceto para a raiz)
if ($path !== '/' && substr($path, -1) === '/') {
    $path = substr($path, 0, -1);
}

// Mapeamento de rotas
$routes = [
    '/api/pessoas' => __DIR__ . '/api/pessoas/index.php',
    '/api/livros' => __DIR__ . '/api/livros/index.php',
    '/api/exemplares' => __DIR__ . '/api/exemplares/index.php',
    '/api/assuntos' => __DIR__ . '/api/assuntos/index.php',
    '/api/autores' => __DIR__ . '/api/autores/index.php',
    '/api/emprestimos' => __DIR__ . '/api/emprestimos/index.php',
    '/api/renovacoes' => __DIR__ . '/api/renovacoes/index.php',
    '/api/auth/login' => __DIR__ . '/api/auth/login.php',
    '/api/auth/register' => __DIR__ . '/api/auth/register.php',
    '/api/auth/me' => __DIR__ . '/api/auth/me.php',
    '/api/emprestimos/emprestar' => __DIR__ . '/api/emprestimos/emprestar.php',
    '/api/emprestimos/devolver' => __DIR__ . '/api/emprestimos/devolver.php',
    '/api/emprestimos/mais-lidos' => __DIR__ . '/api/emprestimos/mais-lidos.php',
    '/api/dashboards/admin' => __DIR__ . '/api/dashboards/admin.php',
    '/api/dashboards/user' => __DIR__ . '/api/dashboards/user.php',
];

// Roteamento dinâmico para CREATE, UPDATE, DELETE
if (preg_match('#^/api/(pessoas|livros|exemplares|assuntos|autores|renovacoes)/(create|update|delete)$#', $path, $matches)) {
    $recurso = $matches[1];
    $acao = $matches[2];
    $arquivo = __DIR__ . "/api/{$recurso}/{$acao}.php";
    
    if (file_exists($arquivo)) {
        require $arquivo;
        return;
    }
}

// Verifica se a rota existe no mapeamento
if (isset($routes[$path]) && file_exists($routes[$path])) {
    require $routes[$path];
    return;
}

// Se for um arquivo estático, deixa o servidor PHP lidar
if (file_exists(__DIR__ . $path)) {
    return false;
}

// Rota não encontrada
header("Content-Type: application/json");
http_response_code(404);
echo json_encode([
    "status" => "erro",
    "message" => "Rota não encontrada: {$path}",
    "data" => null
]);
?>
