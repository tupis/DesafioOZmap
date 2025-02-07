import "reflect-metadata";
import "dotenv/config";
import express from "express";
import { AppRouter, PublicRouter } from "@http/routes";
import { Logger } from "@shared/logger";
import { authMiddleware } from "@shared/middleware/auth";
import { connectDatabase } from "@shared/database/mongodb";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(PublicRouter);
app.use(authMiddleware);
app.use("/api", AppRouter);

connectDatabase()
  .then(() => {
    Logger.info("Conexão com o banco de dados estabelecida com sucesso.");
    app.listen(PORT, () => {
      Logger.info("Servidor rodando na porta " + PORT);
    });
  })
  .catch((error) => {
    Logger.error("Erro ao conectar ao banco de dados:", error);
    process.exit(1);
  });
