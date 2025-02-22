import { validationMiddlewareDto } from "@shared/middleware/validation";
import { HttpServer } from "./httpRouter";
import AuthController from "@http/controllers/AuthController";
import { LoginUserDto } from "@modules/user/dto/login-user.dto";
import { RegisterUserDto } from "@modules/user/dto/register-user.dto";
import UserController from "@http/controllers/UserController";
import RegionsController from "@http/controllers/RegionsController";
import { FindRegionsContainingPointDto } from "@modules/region/dto/find-regions-containing-point.dto";
import { FindRegionsNearPointDto } from "@modules/region/dto/find-regions-near-point.dto";

export class Router {
  private server: HttpServer;

  constructor(server: HttpServer) {
    this.server = server;
  }

  init() {
    this.server.on({
      path: "",
      method: "get",
      handler: async () => {
        return { body: "Funcionando", statusCode: 200 };
      },
      public: true,
    });

    this.server.on({
      path: "/auth/login",
      method: "post",
      handler: async (req, res) => {
        return await AuthController.login(req, res);
      },
      middleware: [validationMiddlewareDto(LoginUserDto)],
      public: true,
    });

    this.server.on({
      path: "/auth/register",
      method: "post",
      handler: async (req, res) => {
        return await AuthController.register(req, res);
      },
      middleware: [validationMiddlewareDto(RegisterUserDto)],
      public: true,
    });

    // USERS
    this.server.on({
      path: "/users",
      method: "get",
      handler: async (req, res) => {
        return await UserController.getAll(req, res);
      },
    });

    this.server.on({
      path: "/users/:id",
      method: "get",
      handler: async (req, res) => {
        return await UserController.getById(req, res);
      },
    });

    this.server.on({
      path: "/users/:id",
      method: "delete",
      handler: async (req, res) => {
        return await UserController.deleteById(req, res);
      },
    });

    this.server.on({
      path: "/users/:id",
      method: "put",
      handler: async (req, res) => {
        return await UserController.updateById(req, res);
      },
    });
    //
    //
    // Regions
    this.server.on({
      path: "/regions",
      method: "get",
      handler: async (req, res) => {
        return await RegionsController.getAll(req, res);
      },
    });

    this.server.on({
      path: "/regions/:id",
      method: "get",
      handler: async (req, res) => {
        return await RegionsController.findById(req, res);
      },
    });

    this.server.on({
      path: "/regions/:id",
      method: "put",
      handler: async (req, res) => {
        return await RegionsController.update(req, res);
      },
    });

    this.server.on({
      path: "/regions",
      method: "post",
      handler: async (req, res) => {
        return await RegionsController.create(req, res);
      },
    });

    this.server.on({
      path: "/regions/find-regions-containing-point",
      method: "post",
      handler: async (req, res) => {
        return await RegionsController.findRegionsContainingPoint(req, res);
      },
      middleware: [validationMiddlewareDto(FindRegionsContainingPointDto)],
    });

    this.server.on({
      path: "/regions/find-regions-near-point",
      method: "post",
      handler: async (req, res) => {
        return await RegionsController.findRegionsNearPointDto(req, res);
      },
      middleware: [validationMiddlewareDto(FindRegionsNearPointDto)],
    });
  }
}
