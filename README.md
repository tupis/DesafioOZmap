# OzMAP API

Bem-vindo à documentação da **OzMAP API**. Este repositório contém a implementação de uma API desenvolvida com Node.js, TypeScript e MongoDB, utilizando Docker para fácil implantação e testes automatizados com Jest.

## 📋 Pré-requisitos

Antes de iniciar, certifique-se de ter os seguintes programas instalados:

- **[Node.js](https://nodejs.org/)** (versão **20 ou superior**)
- **[Docker](https://www.docker.com/)**
- **[Docker Compose](https://docs.docker.com/compose/)**
- **[Yarn](https://yarnpkg.com/) (opcional)**
- **[Postman](https://www.postman.com/downloads/)** (para testar as rotas)

## 🚀 Instalação e Configuração

1. Clone o repositório:

   ```sh
   git clone https://github.com/tupis/DesafioOZmap.git
   cd ozmap-api
   ```

2. Copie o arquivo de variáveis de ambiente e configure-o com **suas credenciais**:

   ```sh
   cp .env.example .env
   ```

3. Abra o arquivo **.env** e preencha **suas variáveis de ambiente**, incluindo a chave obrigatória da API do Google Maps:

   ```env
   MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
   ```

   ⚠️ **A variável `MAPS_API_KEY` é essencial para o funcionamento da API!**  
   Veja como obter sua chave **[neste vídeo](https://youtu.be/hsNlz7-abd0?si=kifufTF2LYuK7Bgk)**.

4. Instale as dependências:

   ```sh
   npm install
   # ou
   yarn install
   ```

## 🐳 Execução com Docker

Para rodar a API com **Docker** e **MongoDB**:

```sh
docker compose up --build -d
```

Para verificar os logs:

```sh
docker compose logs -f
```

Para parar e remover os containers:

```sh
docker compose down
```

## ⚡ Executando Localmente

Se preferir rodar a API sem Docker:

1. Inicie um banco MongoDB localmente ou use um serviço como MongoDB Atlas.
2. Atualize a variável `MONGO_URI` no `.env` com a conexão do seu banco.
3. Rode a API:

   ```sh
   npm run dev
   ```

A aplicação será executada em `http://localhost:3000`.

## 🧪 Testes

O projeto usa **Jest** para testes automatizados.

- Para rodar todos os testes:

  ```sh
  npm test
  ```

- Para rodar testes continuamente em modo watch:

  ```sh
  npm run test:watch
  ```

- Para verificar a cobertura dos testes:
  ```sh
  npm run test:coverage
  ```

## 📡 Rotas da API

A API segue a arquitetura REST e possui rotas para autenticação, usuários e regiões.

### **🛠️ Autenticação**

| Método | Rota        | Descrição                                           |
| ------ | ----------- | --------------------------------------------------- |
| `POST` | `/register` | Cria um novo usuário (com coordenadas ou endereço). |
| `POST` | `/login`    | Autentica um usuário e retorna um token JWT.        |

### **👤 Usuários**

| Método   | Rota                   | Descrição                                 |
| -------- | ---------------------- | ----------------------------------------- |
| `GET`    | `/users`               | Retorna todos os usuários cadastrados.    |
| `GET`    | `/users/{id}`          | Busca um usuário por ID.                  |
| `GET`    | `/users/email/{email}` | Busca um usuário por e-mail.              |
| `DELETE` | `/users/{id}`          | Remove um usuário pelo ID.                |
| `PUT`    | `/users/{id}`          | Atualiza um usuário (latitude/longitude). |

### **📍 Regiões**

| Método   | Rota                                     | Descrição                                                              |
| -------- | ---------------------------------------- | ---------------------------------------------------------------------- |
| `GET`    | `/regions`                               | Retorna todas as regiões cadastradas.                                  |
| `POST`   | `/regions`                               | Cria uma nova região.                                                  |
| `GET`    | `/regions/{id}`                          | Busca uma região pelo ID.                                              |
| `POST`   | `/regions/find-regions-containing-point` | Encontra regiões que contêm um determinado ponto.                      |
| `POST`   | `/regions/find-regions-near-point`       | Encontra regiões próximas a um ponto com base em uma distância máxima. |
| `DELETE` | `/regions/{id}`                          | Remove uma região pelo ID.                                             |

## 📜 Documentação Swagger

A API possui uma documentação interativa com **Swagger**, que pode ser acessada após iniciar o servidor:

- **Acesse:** [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

O Swagger permite testar as rotas diretamente no navegador.

## 📥 Importando Rotas no Postman

Você pode testar todas as rotas diretamente no **Postman**. Para isso, baixe os seguintes arquivos e importe-os no Postman:

- **[Download da coleção de rotas](./docs/OzMAP.postman_collection.json)**
- **[Download do environment](./docs/Ozmap.postman_environment.json)**

Caso não tenha o Postman instalado, baixe-o [aqui](https://www.postman.com/downloads/).

## 📩 Contato

Caso tenha dúvidas ou precise de suporte, entre em contato:

📧 **E-mail:** [joaoh.tupinamba@gmail.com](mailto:joaoh.tupinamba@gmail.com)

## 📄 Licença

Este projeto está sob a licença MIT.

Para mais informações, entre em contato pelo e-mail acima.
