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

  if (fs.existsSync(routerPath)) {
    const fileContent = fs.readFileSync(routerPath, "utf-8");

    //FIXME: arrumar regex para capturar DTOs
    const routeRegex =
      /this\.server\.on\(\s*{\s*path:\s*["'`](.*?)["'`],\s*method:\s*["'`](.*?)["'`](?:[^}]*?middleware:\s*\[\s*validationMiddlewareDto\(([^)]+)\)\s*\])?/g;

    let match;

    while ((match = routeRegex.exec(fileContent)) !== null) {
      const routePath = match[1];
      const method = match[2].toLowerCase();
      const dtoName = match[3] || null;

      if (!paths[routePath]) {
        paths[routePath] = {};
      }

      const parameters: any[] = [];
      const paramRegex = /:([a-zA-Z0-9_]+)/g;
      let paramMatch;
      while ((paramMatch = paramRegex.exec(routePath)) !== null) {
        parameters.push({
          name: paramMatch[1],
          in: "path",
          required: true,
          schema: {
            type: "string",
          },
        });
      }

      const schemaReference = dtoName
        ? { $ref: `#/components/schemas/${dtoName.toLowerCase()}` }
        : null;

      paths[routePath][method] = {
        summary: `${method.toUpperCase()} ${routePath}`,
        tags: [routePath.split("/")[1] || "General"],
        parameters: parameters.length > 0 ? parameters : undefined,
        requestBody: schemaReference
          ? {
              required: true,
              content: {
                "application/json": {
                  schema: schemaReference,
                },
              },
            }
          : undefined,
        responses: {
          200: {
            description: "Sucesso",
          },
          400: {
            description: "Erro de validação",
          },
        },
      };
    }
  }

  return paths;
}

/**
 * Captura automaticamente os DTOs da pasta `/modules/user/dto/`
 */
function loadDTOs() {
  const dtosPath = path.resolve(__dirname, "modules/user/dto");
  const schemas: Record<string, any> = {};

  function readFiles(dir: string) {
    fs.readdirSync(dir).forEach((file) => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        readFiles(fullPath);
      } else if (file.endsWith(".dto.ts")) {
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

  readFiles(dtosPath);

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
    // Captura propriedades que usam decoradores do class-validator (@IsString(), @IsEmail(), etc.)
    const propertyMatch = line.match(/@(\w+)\(\)?\s*\n?\s*(\w+):\s*(\w+)/);
    if (propertyMatch) {
      const [, decorator, propertyName, propertyType] = propertyMatch;
      properties[propertyName] = { type: mapType(propertyType, decorator) };
    }
    // Captura propriedades sem decoradores
    else {
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
