# E-Papirus

O E-Papirus é um sistema de gestão de biblioteca desenvolvido durante nossa graduação em Tecnologia para Sistemas em Internet (TSI) no IFPE - Campus Igarassu.
O projeto nasceu da necessidade de modernizar o acesso ao acervo acadêmico, facilitando tanto o trabalho administrativo quanto a consulta de livros, documentos e mídias pela comunidade escolar.

## Funcionalidades

O sistema foi projetado para cobrir todo o fluxo de operação de uma biblioteca moderna:

- Gestão de Usuários: Cadastro e controle de perfis da comunidade acadêmica.
- Catálogo Digital: Cadastro detalhado de livros, documentos e mídias.
- Controle de Circulação: Gerenciamento ágil de empréstimos e devoluções.
- Sistema de Alertas: Notificações automáticas sobre prazos de devolução.
- Inteligência de Dados: Geração de relatórios para análise de uso do acervo.
- Comunicação: Avisos sobre horários e funcionamento da biblioteca.

## Tecnologias

O projeto utiliza uma arquitetura desacoplada, com um frontend moderno em Nextjs/React e um backend em PHP.

### Frontend

- Framework: Next.js 16 (App Router)
- Biblioteca UI: React 19
- Estilização: Tailwind CSS 4 com Radix UI
- Componentes de Interface: Lucide React (ícones), Sonner (notificações toast)
- Experiência do Usuário: Embla Carousel e Swiper para componentes interativos.

### Backend

- Linguagem: PHP
- Segurança & Autenticação: Firebase PHP-JWT para implementação de tokens de acesso seguros.
- Comunicação: PHPMailer para gestão e envio de notificações por e-mail.
- Configuração: PHP Dotenv para gerenciamento de variáveis de ambiente e credenciais sensíveis.

## Arquitetura do Sistema

O sistema opera no modelo Cliente-Servidor, onde o Frontend em Next.js consome a API desenvolvida em PHP.

## Como Executar o Projeto

### Frontend

No terminal:

1. Acesse a pasta:

cd frontend


2. Instale as dependências:

npm install


3. Configure seu arquivo .env.local

NEXT_PUBLIC_API_URL=http://localhost:8000/api

# se usar XAMPP / WAMP / Apache clássico DESCOMENTE ISSO AQUI
# NEXT_PUBLIC_API_URL=http://localhost/nome-da-sua-pasta-backend/api


3. Inicie o projeto dentro da pasta frontend:

npm run dev



### Backend

No terminal:

1. Certifique-se de ter o Composer instalado.

2. Acesse a pasta do servidor/api.

cd backend-php

3. Instale as dependências do PHP:

composer install

4. Configure seu arquivo .env com as credenciais de banco de dados e e-mail (PHPMailer)

Exemplo de .env:

DB_HOST=localhost:3306
DB_NAME=e_papirus
DB_USER=seu_user
DB_PASS=sua_senha

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587                       
MAIL_USER=email_user_do_epapirus
MAIL_PASS=senha_de_app

JWT_SECRET=secret_jwt_aqui
JWT_EXPIRATION=86400

# Para o MAIL_PORT, as portas do SMTP recomendada para o gmail é 587
# O email atual do e-Papirus é epapirus.biblioteca@gmail.com que deve ser colocado no MAIL_USER,
# O MAIL_PASS é a senha de app gerada após o login da conta no seu dispositivo.
# A chave secreta do JWT (JSON Web Token) serve como uma assinatura digital. Ela garante que os dados do token não foram alterados por terceiros após a emissão. Nunca use palavras comuns, nomes do projeto ou sequências simples. Use uma chave com pelo menos 32 ou 64 caracteres
# Verificar se há algum espaçamento desnecessário no arquivo 

5. **Importe o banco de dados:**

⚠️ **Importante:** Certifique-se de estar na pasta `backend-php` e que os arquivos estão em `db/db.sql` e `db/seed.sql`

No terminal MySQL ou em sua ferramenta de gerenciamento (phpMyAdmin, MySQL Workbench):

mysql -u seu_user -p < db/db.sql
mysql -u seu_user -p < db/seed.sql

# Acesse o MySQL
mysql -u seu_user -p

# Dentro do MySQL, execute os scripts:
source db/db.sql
source db/seed.sql

Ou, se preferir via linha de comando:
mysql -u seu_user -p < db/db.sql
mysql -u seu_user -p < db/seed.sql

6. Inicie o projeto

php -S localhost:8000

## Documentação - Endpoints da API

A API é estruturada de forma modular, onde cada recurso possui seu próprio conjunto de rotas. As rotas são acessadas através do caminho base do backend (ex: api/modulo/arquivo.php). Abaixo estão os prefixos base para cada módulo:

| Módulo       | Prefixo Base       | Descrição                                               |
| ------------ | ------------------ | ------------------------------------------------------- |
| Autenticação | `/api/auth`        | Login, registro e verificação de token (me)             |
| Livros       | `/api/livros`      | Gestão do catálogo principal de obras                   |
| Exemplares   | `/api/exemplares`  | Controle das unidades físicas individuais de cada livro |
| Pessoas      | `/api/pessoas`     | Gestão de alunos, professores e usuários da biblioteca  |
| Empréstimos  | `/api/emprestimos` | Realização de empréstimos, devoluções e estatísticas    |
| Renovações   | `/api/renovacoes`  | Gestão de solicitações de extensão de prazo             |
| Dashboards   | `/api/dashboards`  | Métricas específicas para Admin e visão do Usuário      |
| Autores      | `/api/autores`     | Cadastro e listagem de autores das obras                |
| Assuntos     | `/api/assuntos`    | Categorização por temas e assuntos do acervo            |
| Reservas     | `/api/reservas`    | Solicitação e controle de reservas de livros            |

### 🔒 Segurança e Acesso

Muitas dessas rotas (especialmente login) exigem que o Token JWT seja enviado no cabeçalho da requisição para autorizar o acesso:

```http
Authorization: Bearer <seu_token_jwt_aqui>
```

## Desenvolvedores

- [Alan](https://github.com/alan-santosBS)
- [Camilla](https://github.com/cabarros3)
- [Dayvson](https://github.com/Devs097518)
- [João Vitor](https://github.com/vitorcorreiia)
- [Luhan](https://github.com/luhanfelipe)
- [Luisa](https://github.com/luisavmf0)
- [Yuri](https://github.com/yuriceleste)
