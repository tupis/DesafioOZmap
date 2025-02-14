/* eslint-disable @typescript-eslint/no-explicit-any */
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import fs from "fs";
import path from "path";

/**
 * Captura automaticamente todas as rotas registradas no Router.ts e associa DTOs ao requestBody
 */
function loadRoutes() {
  const routerPath = path.resolve(__dirname, "http/routes/router.ts");
  const paths: Record<string, any> = {};

  if (!fs.existsSync(routerPath)) {
    console.error("❌ Arquivo de rotas não encontrado!");
    return paths;
  }

  const fileContent = fs.readFileSync(routerPath, "utf-8");

  // 🔹 Expressão para capturar cada bloco de rota corretamente
  const routeRegex = /this\.server\.on\s*\(\s*{([\s\S]*?)}\s*\)/g;

  let match;
  let foundRoutes = false; // Flag para ver se a regex encontrou algo

  while ((match = routeRegex.exec(fileContent)) !== null) {
    foundRoutes = true;
    const routeBlock = match[1];

    // 🔹 Extraindo path, method e middleware separadamente
    const pathMatch = /path:\s*["'`](.*?)["'`]/.exec(routeBlock);
    const methodMatch = /method:\s*["'`](.*?)["'`]/.exec(routeBlock);
    const middlewareMatch =
      /validationMiddlewareDto\(\s*([a-zA-Z0-9_]+)\s*\)/.exec(routeBlock);

    if (!pathMatch || !methodMatch) continue; // Se não tem path/method, ignora

    const routePath = pathMatch[1];
    const method = methodMatch[1].toLowerCase();
    const dtoName = middlewareMatch ? middlewareMatch[1] : null;

    if (!paths[routePath]) {
      paths[routePath] = {};
    }

    paths[routePath][method] = {
      summary: `${method.toUpperCase()} ${routePath}`,
      tags: [routePath.split("/")[1] || "General"],
      requestBody: dtoName
        ? {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: `#/components/schemas/${dtoName}` },
              },
            },
          }
        : undefined,
      responses: {
        200: { description: "Sucesso" },
        400: { description: "Erro de validação" },
      },
    };
  }

  if (!foundRoutes) {
    console.error(
      "❌ Nenhuma rota foi encontrada! Verifique se o formato do arquivo está correto.",
    );
  }

  return paths;
}

/**
 * Captura automaticamente os DTOs da pasta `/modules/user/dto/`
 */
function loadDTOs() {
  const modulesPath = path.resolve(__dirname, "modules");
  const schemas: Record<string, any> = {};

  function readDTOFiles(dir: string) {
    fs.readdirSync(dir).forEach((fileOrDir) => {
      const fullPath = path.join(dir, fileOrDir);

      if (fs.statSync(fullPath).isDirectory()) {
        // Se encontrar a pasta `dto`, processa seus arquivos
        if (fileOrDir === "dto") {
          readFiles(fullPath);
        } else {
          // Continua a busca recursivamente
          readDTOFiles(fullPath);
        }
      }
    });
  }

  function readFiles(dtoDir: string) {
    fs.readdirSync(dtoDir).forEach((file) => {
      const fullPath = path.join(dtoDir, file);
      if (fs.statSync(fullPath).isFile() && file.endsWith(".dto.ts")) {
        const capitalize = (phrase: string) =>
          phrase
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join("") + "Dto";

        const dtoName = capitalize(file.replace(".dto.ts", ""));

        schemas[dtoName] = {
          type: "object",
          properties: extractDTOFields(fullPath),
          required: extractRequiredFields(fullPath),
        };
      }
    });
  }

  readDTOFiles(modulesPath);

  return schemas;
}

/**
 * Extrai automaticamente os campos dos DTOs, incluindo decoradores do class-validator
 */
function extractDTOFields(filePath: string) {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const lines = fileContent.split("\n");

  const properties: Record<string, any> = {};

  lines.forEach((line) => {
    const propertyMatch = line.match(/@(\w+)\(\)?\s*\n?\s*(\w+):\s*(\w+)/);
    if (propertyMatch) {
      const [, decorator, propertyName, propertyType] = propertyMatch;
      properties[propertyName] = { type: mapType(propertyType, decorator) };
    } else {
      const basicMatch = line.match(/(\w+):\s*(\w+);/);
      if (basicMatch) {
        const [, propertyName, propertyType] = basicMatch;
        properties[propertyName] = { type: mapType(propertyType) };
      }
    }
  });

  return properties;
}

/**
 * Extrai os campos obrigatórios do DTO
 */
function extractRequiredFields(filePath: string) {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const requiredFields: string[] = [];

  fileContent.split("\n").forEach((line) => {
    if (line.includes("@IsNotEmpty")) {
      const fieldMatch = line.match(/\s*(\w+):/);
      if (fieldMatch) {
        requiredFields.push(fieldMatch[1]);
      }
    }
  });

  return requiredFields;
}

/**
 * Mapeia os tipos do TypeScript para os tipos do Swagger
 */
function mapType(tsType: string, decorator?: string) {
  const typeMap: Record<string, string> = {
    string: "string",
    number: "number",
    boolean: "boolean",
    object: "object",
    array: "array",
  };

  if (decorator === "IsArray") {
    return "array";
  }

  return typeMap[tsType] || "string";
}

/**
 * Configuração do Swagger
 */
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Minha API",
    version: "1.0.0",
    description: "Documentação automática da API",
  },
  // servers: [],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: loadDTOs(),
  },
  paths: loadRoutes(),
};

// Opções do Swagger
const options = {
  swaggerDefinition,
  apis: ["./src/http/routes/router.ts"], // Captura todas as rotas e DTOs
};

const swaggerSpec = swaggerJSDoc(options);

/**
 * Função para configurar o Swagger no Express
 */
export function setupSwagger(app: Express) {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
