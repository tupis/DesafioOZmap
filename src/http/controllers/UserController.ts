import { Request, Response } from "express";
import { getUserService } from "@modules/user/UserServiceFactory";
import { UserService } from "@modules/user/services/UserService";
import { UpdateUserDto } from "@modules/user/dto/update-user.dto";

class UserController {
  constructor(private readonly userService: UserService = getUserService()) {}
  async getAll(request: Request, response: Response): Promise<Response> {
    const { data, status } = await this.userService.getAllUsers();
    return response.status(status).json(data);
  }
  async getById(request: Request, response: Response): Promise<Response> {
    const { data, status } = await this.userService.getUserById(
      request.params.id as string,
    );
    return response.status(status).json(data);
  }

  async getByEmail(request: Request, response: Response): Promise<Response> {
    const { data, status } = await this.userService.getUserByEmail(
      request.params.email,
    );
    return response.status(status).json(data);
  }

  async deleteById(request: Request, response: Response): Promise<Response> {
    const { data, status } = await this.userService.deleteUserById(
      request.params.id as string,
    );
    return response.status(status).json(data);
  }

  async updateById(request: Request, response: Response): Promise<Response> {
    const { data, status } = await this.userService.updateUserById(
      request.params.id as string,
      request.body as UpdateUserDto,
    );
    return response.status(status).json(data);
  }
}

export default new UserController();
