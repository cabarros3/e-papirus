# 📚 e_papirus API

API RESTful desenvolvida em PHP nativo para gerenciamento de bibliotecas. O sistema controla acervo (livros, autores, exemplares), usuários (pessoas), circulação (empréstimos, devoluções, renovações) e dashboards administrativos.

## 🚀 Tecnologias

- **Linguagem:** PHP 7.4+ (Sem frameworks)
- **Banco de Dados:** MySQL / MariaDB
- **Driver:** PDO (PHP Data Objects)
- **Arquitetura:** Script-based Routing (Endpoints organizados por pastas)
- **Formato de Dados:** JSON

---

## 📂 Estrutura do Projeto

```text
/api
│
├── config/
│   ├── cors.php          # Cabeçalhos de permissão (CORS)
│   ├── utils.php         # Funções auxiliares (respostas JSON, validações)
│   ├── db.php            # Conexão com banco de dados (PDO)
│   └── constants.php     # Configurações globais (Prazos, multas)
│
├── auth/                 # Autenticação e Sessão
├── pessoas/              # Gestão de Usuários/Leitores
├── livros/               # Catálogo Bibliográfico
├── autores/              # Gestão de Autores
├── assuntos/             # Categorias/Gêneros
├── exemplares/           # Inventário Físico (Tombo)
├── emprestimos/          # Circulação (Saída e Devolução)
├── renovacoes/           # Prorrogação de prazos
└── dashboard/            # Dados estatísticos para gráficos
```

## ⚙️ Instalação e Configuração

### 1. Banco de Dados

Crie um banco de dados MySQL chamado e_papirus e importe as tabelas. Certifique-se de adicionar a coluna sequencial na tabela exemplar:

```sql
ALTER TABLE exemplar ADD COLUMN numero INT NOT NULL DEFAULT 1;
```

### 2. Configuração

Edite o arquivo api/config/db.php com suas credenciais:

```php
$host = 'localhost';
$dbname = 'e_papirus';
$username = 'root';
$password = ''; // insira a senho do seu db
```

### 3. Rodando o Servidor

Para desenvolvimento local, você pode usar o servidor embutido do PHP na raiz do projeto:

```bash
php -S localhost:8000
```

A API estará acessível em: http://localhost:8000/api/

## 📡 Documentação dos Endpoints

A API segue o padrão REST. Todas as requisições devem enviar o header Content-Type: application/json.

### 🔐 Autenticação (`/api/auth/`)

| Método   | URL (Endpoint)           | Descrição                            | Exemplo de JSON (Body)                                                                                                    |
| :------- | :----------------------- | :----------------------------------- | :------------------------------------------------------------------------------------------------------------------------ |
| **POST** | `/api/auth/login.php`    | Autentica o usuário e retorna dados. | `{"email": "maria@email.com", "senha": "123"}`                                                                            |
| **POST** | `/api/auth/register.php` | Cadastra novo usuário e pessoa.      | `{"nome": "João", "matricula": "2024", "cpf": "11122233344", "email": "joao@email.com", "senha": "123", "tipo": "aluno"}` |
| **GET**  | `/api/auth/me.php?id=1`  | Retorna dados do usuário logado.     | _(Vazio)_                                                                                                                 |

### 👥 Pessoas (`/api/pessoas/`)

| Método     | URL (Endpoint)                      | Descrição                           | Exemplo de JSON (Body)                                                                                                 |
| :--------- | :---------------------------------- | :---------------------------------- | :--------------------------------------------------------------------------------------------------------------------- |
| **GET**    | `/api/pessoas/read.php`             | Lista todas as pessoas.             | _(Vazio)_                                                                                                              |
| **GET**    | `/api/pessoas/read.php?termo=maria` | Busca por nome, CPF ou matrícula.   | _(Vazio)_                                                                                                              |
| **GET**    | `/api/pessoas/read.php?id=1`        | Detalhes de uma pessoa específica.  | _(Vazio)_                                                                                                              |
| **POST**   | `/api/pessoas/create.php`           | Cadastra pessoa sem login (Balcão). | `{"nome": "Visitante", "matricula": "EXT01", "cpf": "99988877766", "email": "vis@email.com", "telefone": "9999-8888"}` |
| **PUT**    | `/api/pessoas/update.php`           | Atualiza dados cadastrais.          | `{"id_pessoa": 1, "nome": "Maria S.", "telefone": "81 9999-0000"}`                                                     |
| **DELETE** | `/api/pessoas/delete.php?id=1`      | Remove uma pessoa do sistema.       | _(Vazio)_                                                                                                              |

---

### 📚 Livros (`/api/livros/`)

| Método     | URL (Endpoint)                | Descrição                              | Exemplo de JSON (Body)                                                                                                     |
| :--------- | :---------------------------- | :------------------------------------- | :------------------------------------------------------------------------------------------------------------------------- |
| **GET**    | `/api/livros/read.php`        | Lista todos os livros.                 | _(Vazio)_                                                                                                                  |
| **GET**    | `/api/livros/read.php?id=1`   | Detalhes de um livro (com autores).    | _(Vazio)_                                                                                                                  |
| **POST**   | `/api/livros/create.php`      | Cadastra livro e vincula autores.      | `{"titulo": "Duna", "id_assunto": 1, "editora": "Aleph", "ano_publicacao": 1965, "autores": [1, 2]}`                       |
| **PUT**    | `/api/livros/update.php`      | Atualiza livro e autores.              | `{"id_livro": 1, "titulo": "Duna Capa Dura", "id_assunto": 1, "editora": "Aleph", "ano_publicacao": 2020, "autores": [1]}` |
| **DELETE** | `/api/livros/delete.php?id=1` | Remove um livro (se não tiver cópias). | _(Vazio)_                                                                                                                  |

---

### ✍️ Autores (`/api/autores/`)

| Método     | URL (Endpoint)                 | Descrição                           | Exemplo de JSON (Body)                            |
| :--------- | :----------------------------- | :---------------------------------- | :------------------------------------------------ |
| **GET**    | `/api/autores/read.php`        | Lista todos os autores.             | _(Vazio)_                                         |
| **POST**   | `/api/autores/create.php`      | Cadastra novo autor.                | `{"nome_autor": "Frank Herbert"}`                 |
| **PUT**    | `/api/autores/update.php`      | Atualiza nome do autor.             | `{"id_autor": 1, "nome_autor": "J.R.R. Tolkien"}` |
| **DELETE** | `/api/autores/delete.php?id=1` | Remove autor (se não tiver livros). | _(Vazio)_                                         |

---

### 🏷️ Assuntos (`/api/assuntos/`)

| Método   | URL (Endpoint)             | Descrição                       | Exemplo de JSON (Body)                  |
| :------- | :------------------------- | :------------------------------ | :-------------------------------------- |
| **GET**  | `/api/assuntos/read.php`   | Lista categorias (para select). | _(Vazio)_                               |
| **POST** | `/api/assuntos/create.php` | Cria nova categoria/assunto.    | `{"nome_assunto": "Ficção Científica"}` |

---

### 📦 Exemplares / Estoque (`/api/exemplares/`)

| Método     | URL (Endpoint)                        | Descrição                            | Exemplo de JSON (Body)                                                                 |
| :--------- | :------------------------------------ | :----------------------------------- | :------------------------------------------------------------------------------------- |
| **GET**    | `/api/exemplares/read.php?id_livro=1` | Lista cópias de um livro específico. | _(Vazio)_                                                                              |
| **POST**   | `/api/exemplares/create.php`          | Cria nova cópia física.              | `{"id_livro": 1, "localizacao": "Estante B3"}`                                         |
| **PUT**    | `/api/exemplares/update.php`          | Atualiza localização ou status.      | `{"id_exemplar": 1, "localizacao": "Reserva Técnica", "disponibilidade": "reservado"}` |
| **DELETE** | `/api/exemplares/delete.php?id=1`     | Remove um exemplar.                  | _(Vazio)_                                                                              |

---

### 🔄 Empréstimos (`/api/emprestimos/`)

| Método   | URL (Endpoint)                              | Descrição                           | Exemplo de JSON (Body)               |
| :------- | :------------------------------------------ | :---------------------------------- | :----------------------------------- |
| **GET**  | `/api/emprestimos/read.php?status=pendente` | Lista livros que estão na rua.      | _(Vazio)_                            |
| **GET**  | `/api/emprestimos/read.php?status=atrasado` | Lista apenas os atrasados.          | _(Vazio)_                            |
| **GET**  | `/api/emprestimos/read.php?id_pessoa=1`     | Histórico de um usuário.            | _(Vazio)_                            |
| **POST** | `/api/emprestimos/create.php`               | Realiza o **Checkout** (Saída).     | `{"id_exemplar": 5, "id_pessoa": 1}` |
| **PUT**  | `/api/emprestimos/devolucao.php`            | Realiza o **Check-in** (Devolução). | `{"id_emprestimo": 100}`             |

---

### ⏳ Renovações (`/api/renovacoes/`)

| Método   | URL (Endpoint)                               | Descrição                      | Exemplo de JSON (Body)   |
| :------- | :------------------------------------------- | :----------------------------- | :----------------------- |
| **POST** | `/api/renovacoes/create.php`                 | Renova por mais 14 dias.       | `{"id_emprestimo": 100}` |
| **GET**  | `/api/renovacoes/read.php?id_emprestimo=100` | Vê quantas vezes foi renovado. | _(Vazio)_                |

---

### 📊 Dashboards (`/api/dashboard/`)

| Método  | URL (Endpoint)                        | Descrição                    | Exemplo de JSON (Body) |
| :------ | :------------------------------------ | :--------------------------- | :--------------------- |
| **GET** | `/api/dashboard/user.php?id_pessoa=1` | Resumo para o aluno (Home).  | _(Vazio)_              |
| **GET** | `/api/dashboard/admin.php`            | Resumo para o bibliotecário. | _(Vazio)_              |

## 📝 Formato das Respostas

A API sempre retorna um JSON padronizado:

Sucesso (200/201):

```json
{
  "status": "sucesso",
  "mensagem": "Operação realizada.",
  "dados": { ...objeto ou array... }
}
```

Erro (400/404/500):

```json
{
  "status": "erro",
  "mensagem": "Descrição detalhada do erro.",
  "dados": null
}
```

## 🧪 Como rodar os testes

### Primeira vez na máquina

1. Instale as dependências: `composer install`.
2. Crie o usuário e o banco de teste (uma vez por máquina):

```bash
   mysql -u root -p < tests/banco/criar-banco-teste.sql
```

   Se o root do MySQL não usa senha, use `sudo mysql < tests/banco/criar-banco-teste.sql`.
3. Confirme que o usuário de teste consegue entrar:

```bash
   mysql -u epapirus_test -pepapirus_test -e "SELECT 1;"
```

   Se der `Access denied` porque o usuário já existia com outra senha, corrija com:

```bash
   sudo mysql -e "ALTER USER 'epapirus_test'@'localhost' IDENTIFIED BY 'epapirus_test'; FLUSH PRIVILEGES;"
```
4. O `.env` normal do backend (modelo em `env-exemple.txt`) precisa existir, pois a API de teste ainda lê dele o que não é sobrescrito (ex.: segredo do JWT). Não é preciso criar nenhum `.env` dentro de `tests/`.

### Rodar tudo

```bash
composer test
```

O comando sobe a API de teste (porta 8001), roda o PHPUnit e encerra a API ao final. A API de desenvolvimento (porta 8000) não é afetada. Para rodar um teste específico: `composer test -- --filter NomeDoTeste`. Requer bash (Linux ou WSL).

Resultado esperado: `OK (1 test, ...)`.

### Rodar sem o composer

Em um terminal, `bash tests/subir-api-teste.sh`. Em outro, `vendor/bin/phpunit`.

### Problemas comuns

| Mensagem | Causa e solução |
|---|---|
| `Access denied for user 'epapirus_test'` | O usuário de teste não existe nesta máquina. Refaça os passos 2 e 3 acima |
| `já existe um servidor na porta 8001` | Há outra API de teste rodando. Encerre-a (Ctrl+C) e rode de novo |
| `Undefined array key "DB_HOST"` | A API foi subida sem `-d variables_order=EGPCS`. Use `tests/subir-api-teste.sh` |
| `Class "Tests\..." not found` | Rode `composer dump-autoload` |
| `$'\r': command not found` | Final de linha do Windows nos scripts. Rode `sed -i 's/\r$//' tests/*.sh` |

## ⚠️ Regras de Negócio Importantes

- Integridade: Não é possível excluir Autores com Livros, Livros com Exemplares, ou Pessoas com Empréstimos.

- Disponibilidade: O sistema usa travas (FOR UPDATE) para impedir que duas pessoas peguem o mesmo exemplar ao mesmo tempo.

- Renovação: Só é permitida se o livro não estiver atrasado e ainda não tiver sido devolvido.

- Numeração: Os exemplares possuem um ID global (banco) e um Número Sequencial (visual) por título.

## 🧪 Como Testar (Insomnia/Postman)

- Crie um usuário em /auth/register.php.

- Crie um autor e um assunto.

- Crie um livro (vincule o autor e assunto).

- Crie exemplares para este livro.

- Faça o empréstimo em /emprestimos/create.php usando o id_pessoa (não o id_usuario).
