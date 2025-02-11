/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Express, Request, Response, NextFunction } from "express";
import { authMiddleware } from "@shared/middleware/auth";

type RouteHandler = {
  path: string;
  method: "get" | "post" | "put" | "delete" | "patch";
  handler: (
    req: Request,
    res: Response,
  ) => Promise<{ statusCode?: number; body: any } | Response>;
  middleware?: ((req: Request, res: Response, next: NextFunction) => void)[];
  public?: boolean;
};

export class HttpServer {
  private app: Express;

  constructor() {
    this.app = express();
    this.app.use(express.json());
  }

  on(route: RouteHandler) {
    const { path, method, handler, public: isPublic = false } = route;
    const middlewares: any[] = [];

    if (!isPublic) {
      middlewares.push(authMiddleware);
    }

    (this.app as any)[method](
      path,
      ...middlewares,
      async (req: Request, res: Response) => {
        try {
          const result = await handler(req, res);
          if ("body" in result) {
            res.status(result.statusCode || 200).json(result.body);
          } else {
            res.status(200).json(result);
          }
        } catch (error) {
          res.status(500).json({ message: "Erro interno no servidor", error });
        }
      },
    );
  }

  getApp() {
    return this.app;
  }
}
