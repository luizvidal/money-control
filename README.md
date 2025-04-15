# Money Control API

API para controle financeiro pessoal desenvolvida com Spring Boot.

## Funcionalidades

- Autenticação com Spring Security e JWT
- CRUD de Transações, Categorias e Metas
- Validações com Bean Validation
- Documentação com Swagger
- Configuração para Docker

## Tecnologias Utilizadas

- Java 17
- Spring Boot 3.2.3
- Spring Security
- Spring Data JPA
- PostgreSQL
- JWT
- Swagger/OpenAPI
- Docker

## Estrutura do Projeto

- **config**: Configurações do Spring e Swagger
- **controller**: Endpoints da API
- **dto**: Objetos de transferência de dados
- **exception**: Tratamento de exceções
- **model**: Entidades JPA
- **repository**: Repositórios JPA
- **security**: Configurações de segurança e JWT
- **service**: Camada de serviço

## Executando o Projeto

### Com Maven

```bash
./mvnw spring-boot:run
```

### Com Docker

```bash
docker-compose up
```

## Documentação da API

A documentação da API está disponível em:

```
http://localhost:8080/swagger-ui.html
```

## Endpoints Principais

### Autenticação

- POST /api/auth/register - Registrar novo usuário
- POST /api/auth/login - Autenticar usuário

### Transações

- GET /api/transactions - Listar todas as transações
- GET /api/transactions/{id} - Obter transação por ID
- POST /api/transactions - Criar nova transação
- PUT /api/transactions/{id} - Atualizar transação
- DELETE /api/transactions/{id} - Excluir transação

### Categorias

- GET /api/categories - Listar todas as categorias
- GET /api/categories/{id} - Obter categoria por ID
- POST /api/categories - Criar nova categoria
- PUT /api/categories/{id} - Atualizar categoria
- DELETE /api/categories/{id} - Excluir categoria

### Metas

- GET /api/goals - Listar todas as metas
- GET /api/goals/{id} - Obter meta por ID
- POST /api/goals - Criar nova meta
- PUT /api/goals/{id} - Atualizar meta
- DELETE /api/goals/{id} - Excluir meta
