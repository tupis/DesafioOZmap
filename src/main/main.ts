import "reflect-metadata";
import "dotenv/config";
import { HttpServer } from "@http/routes/httpRouter";
import { Router } from "@http/routes/router";
import { Logger } from "@shared/logger";
import { connectDatabase } from "@shared/database/mongodb";
import { setupSwagger } from "src/swagger";

const PORT = process.env.PORT || 3000;

const server = new HttpServer();

const router = new Router(server);
router.init();

setupSwagger(server.getApp());

connectDatabase()
  .then(() => {
    Logger.info("Conexão com o banco de dados estabelecida com sucesso.");
    server.getApp().listen(PORT, () => {
      Logger.info(`🚀 Servidor rodando na porta ${PORT}`);
      Logger.info(`📄 Swagger disponível em http://localhost:${PORT}/api/docs`);
    });
  })
  .catch((error) => {
    Logger.error("Erro ao conectar ao banco de dados:", error);
    process.exit(1);
  });
