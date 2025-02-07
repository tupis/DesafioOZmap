import { UserRepository } from "../repositories/UserRepository";
import { User } from "../entities/User";
import bcrypt from "bcryptjs";
import { generateToken } from "@utils/jwt";
import { LoginUserDto } from "../dto/login-user.dto";
import { RegisterUserDto } from "../dto/register-user.dto";
import { ResponseDto } from "@shared/dto/response.dto";
import { HttpStatus } from "@statusCode";

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async createUser(data: RegisterUserDto): Promise<ResponseDto> {
    const existingUser = await this.userRepository.findByEmail(
      data.email as string,
    );

    if (existingUser) {
      return new ResponseDto({
        data: "Usuário já cadastrado",
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const hashedPassword = await bcrypt.hash(data.password, 8);

    data.password = hashedPassword;

    const user = await this.userRepository.create(data);

    const token = generateToken({ email: data.email, id: user._id });

    return new ResponseDto({
      data: {
        user,
        token,
      },
      status: HttpStatus.OK,
    });
  }

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.findAll();
  }

  async authenticateUser(data: LoginUserDto): Promise<ResponseDto> {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new Error("Senha inválida");
    }

    const token = generateToken({ id: user._id, email: user.email });
    return new ResponseDto({
      data: {
        user,
        token,
      },
      status: 200,
    });
  }

  async getUserById(id: string): Promise<User | null> {
    return await this.userRepository.findById(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }

  async deleteUserById(id: string) {
    const user = await this.getUserById(id);
    return await this.userRepository.softDelete(user!._id);
  }
}
