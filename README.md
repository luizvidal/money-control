# Money Control - Sistema de Controle Financeiro Pessoal

Este projeto é um sistema de controle financeiro pessoal completo, com backend em Java Spring Boot e banco de dados PostgreSQL.

## Estrutura do Projeto

O projeto está organizado da seguinte forma:

- **backend/** - Contém a API RESTful desenvolvida com Spring Boot
- **frontend/** - Interface de usuário desenvolvida com React e Tailwind CSS

## Backend

O backend é uma API RESTful com as seguintes características:

- Java 17 com Spring Boot 3.2.3
- Autenticação com JWT
- Banco de dados PostgreSQL
- Documentação com Swagger

Para mais detalhes sobre o backend, consulte o [README do backend](backend/README.md).

## Executando o Projeto

Para executar o projeto completo:

```bash
docker-compose up -d
```

### Acessando a Aplicação

- **Frontend**: http://localhost:5173
- **API**: http://localhost:8080
- **Documentação Swagger**: http://localhost:8080/swagger-ui.html

### Portas

- **Frontend**: 5173
- **Backend**: 8080
- **PostgreSQL**: 5433 (mapeado para 5432 dentro do container)

## Desenvolvimento

Para desenvolvimento, você pode executar o backend e o frontend separadamente:

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend estará disponível em http://localhost:5173
