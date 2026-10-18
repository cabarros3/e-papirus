# Testes automatizados do backend (e-Papirus)

Este documento registra como a infraestrutura de testes do backend foi montada e como usá-la. Ele acompanha a **issue 1 (Configurar infraestrutura de testes automatizados)** e é atualizado conforme os itens da checklist forem concluídos. Todos os caminhos são relativos à pasta `backend-php/`.

## Visão geral

Os testes são de **integração**: eles chamam os endpoints reais da API (`create.php`, `index.php`, `update.php`) como se fossem um cliente externo, e os dados ficam em um **banco de teste separado**, nunca no banco de desenvolvimento. Não há alteração no código de produção da `api` nesta etapa.

Ferramentas:

- **PHPUnit 12.5**: executa os testes e mostra o resultado. Exige **PHP 8.3 ou superior**.
- **Guzzle 8.2**: cliente HTTP usado pelos testes para chamar a API.
- **MySQL**: o mesmo SGBD do projeto, com um banco exclusivo para testes chamado `epapirus_test`.

Ambos são dependências de desenvolvimento (`require-dev`), então não entram no ambiente de produção.

## Item 1: dependências

PHPUnit e Guzzle foram instalados com `composer require --dev phpunit/phpunit guzzlehttp/guzzle`, e ficaram registrados em `require-dev` no `composer.json`. O `composer.lock` é ignorado pelo `.gitignore` do projeto, por isso cada pessoa gera o dela com `composer install`.

## Item 2: configuração do PHPUnit

- `phpunit.xml`: diz ao PHPUnit onde estão os testes (`tests/Api`), qual arquivo carregar antes de tudo (`tests/bootstrap.php`) e define a variável de ambiente `APP_ENV=testing` durante a execução.
- `tests/bootstrap.php`: carrega o autoload do Composer (`vendor/autoload.php`), que permite ao PHP encontrar as classes do PHPUnit e do Guzzle.
- `tests/Api/.gitkeep`: arquivo vazio que existe só para o Git guardar a pasta enquanto ela não tiver testes.
- `.phpunit.cache/` foi adicionada ao `.gitignore`, porque é gerada localmente.

Para conferir, rode `vendor/bin/phpunit`. Enquanto não houver testes, o resultado esperado é `No tests executed!`.

## Item 3: banco de teste

Os scripts ficam em `tests/banco/`.

**Por que não importar o `db.sql` direto.** O `db/db.sql` tem `CREATE DATABASE IF NOT EXISTS e_papirus;` e `USE e_papirus;` escritos dentro dele, e o `db/seed.sql` também começa com `USE e_papirus;`. Importá-los normalmente alteraria o banco de desenvolvimento.

**Como o problema foi resolvido.** Existem duas proteções:

1. Um usuário MySQL exclusivo, `epapirus_test`, com permissão **somente** no banco `epapirus_test`. Mesmo que algum comando saia errado, o MySQL recusa mexer no `e_papirus`.
2. O script de reset remove as linhas `CREATE DATABASE` e `USE` na hora de importar (usando `sed`), sem alterar os arquivos originais, e escolhe o banco de destino no próprio comando.

**Arquivos:**

- `tests/banco/criar-banco-teste.sql`: cria o banco `epapirus_test` e o usuário `epapirus_test` (senha `epapirus_test`, válida só no MySQL local e só para esse banco descartável).
- `tests/banco/resetar-banco-teste.sh`: apaga e recria o banco de teste do zero, importando `db/db.sql` e `db/seed.sql`.

**Como configurar uma vez por máquina:**

```bash
mysql -u root -p < tests/banco/criar-banco-teste.sql
bash tests/banco/resetar-banco-teste.sh
```

**Como conferir:**

```bash
mysql -u epapirus_test -pepapirus_test epapirus_test -e "SHOW TABLES; SELECT COUNT(*) FROM assunto;"
```

O esperado é uma lista de 11 tabelas (incluindo `notificacao`) e 13 assuntos, que é o que o `seed.sql` insere.

## Como a API vai usar o banco de teste (item 5, a confirmar)

O `config.php` lê as credenciais do banco do arquivo `.env` com `Dotenv::createImmutable`, e o `db/db.php` cria a conexão PDO com elas. Nesse modo, uma variável que já existe no ambiente quando a API sobe tem prioridade sobre o `.env`. A ideia é subir a API de teste em outra porta com as variáveis do banco de teste definidas no ambiente, por exemplo:

```bash
DB_HOST=localhost DB_NAME=epapirus_test DB_USER=epapirus_test DB_PASS=epapirus_test php -S localhost:8001
```

Assim o `.env` de desenvolvimento não é alterado e o código de produção também não. **Isso ainda não foi testado na prática** e deve ser confirmado no item 5.

## Pontos de atenção para os próximos itens

- Os endpoints usam autenticação JWT. O `TestCase.php` provavelmente vai precisar de um helper que faz login e envia o cabeçalho `Authorization: Bearer <token>`.
- O banco de teste deve ser recriado a cada teste (no `setUp`), para que todo teste comece do mesmo estado.
- Regra de segurança: os testes **nunca** rodam contra o banco `e_papirus`. O reset só deve funcionar no `epapirus_test`.

## Itens restantes da issue 1

- Item 4: `tests/Support/TestCase.php` (cliente Guzzle e reset do banco no `setUp`).
- Item 5: definir o ambiente de teste (variáveis apontando para o banco de teste).
- Item 6: adicionar o script `composer test`.
- Item 7: criar um teste de fumaça (a API responde 200 em uma rota simples).
- Item 8: documentar no README como rodar os testes.
