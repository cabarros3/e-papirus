<?php
// Servidor SMTP falso para os testes (porta 1025)
// Aceita a conexão, lê os comandos e responde OK em tudo.

$sock = stream_socket_server("tcp://127.0.0.1:1025", $errno, $errstr);
if (!$sock) {
    fwrite(STDERR, "Erro ao abrir porta 1025: $errstr\n");
    exit(1);
}

echo "SMTP falso escutando em 127.0.0.1:1025\n";

while (true) {
    $client = @stream_socket_accept($sock, 10);
    if (!$client) continue;

    fwrite($client, "220 localhost SMTP\r\n");

    while (!feof($client)) {
        $linha = fgets($client, 1024);
        if ($linha === false) break;
        $cmd = strtoupper(trim($linha));

        if (strpos($cmd, 'EHLO') === 0 || strpos($cmd, 'HELO') === 0) {
            fwrite($client, "250-localhost\r\n250 OK\r\n");
        } elseif (strpos($cmd, 'MAIL FROM') === 0) {
            fwrite($client, "250 OK\r\n");
        } elseif (strpos($cmd, 'RCPT TO') === 0) {
            fwrite($client, "250 OK\r\n");
        } elseif (strpos($cmd, 'DATA') === 0) {
            fwrite($client, "354 Start mail input; end with <CRLF>.<CRLF>\r\n");
            while (($dataLinha = fgets($client, 1024)) !== false) {
                if (trim($dataLinha) === '.') {
                    fwrite($client, "250 OK\r\n");
                    break;
                }
            }
        } elseif (strpos($cmd, 'QUIT') === 0) {
            fwrite($client, "221 Bye\r\n");
            break;
        } elseif (strpos($cmd, 'AUTH') === 0) {
            fwrite($client, "235 Authentication successful\r\n");
        } else {
            fwrite($client, "250 OK\r\n");
        }
    }

    fclose($client);
}
