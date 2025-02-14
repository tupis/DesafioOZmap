import { UserRepository } from "../repositories/UserRepository";
import bcrypt from "bcryptjs";
import { generateToken } from "@utils/jwt";
import { LoginUserDto } from "../dto/login-user.dto";
import { RegisterUserDto } from "../dto/register-user.dto";
import { ResponseDto } from "@shared/dto/response.dto";
import { HttpStatus } from "@statusCode";
import { GeoLocationService } from "@shared/services/GeoLocationService";
import { UpdateUserDto } from "../dto/update-user.dto";

export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly geoLocationService: GeoLocationService,
  ) {}

  async createUser({
    address,
    coordinates,
    ...data
  }: RegisterUserDto): Promise<ResponseDto> {
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

    let registerAddress = null;

    if (coordinates) {
      registerAddress =
        await this.geoLocationService.getAddressFromCoordinates(coordinates);
    } else if (address) {
      registerAddress =
        await this.geoLocationService.getCoordinatesFromAddress(address);
    }

    if (!registerAddress) {
      return new ResponseDto({
        data: "Endereço não encontrado",
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const user = await this.userRepository.create({
      ...data,
      address: registerAddress._id,
    });

    const token = generateToken({ email: data.email, id: user._id });

    return new ResponseDto({
      data: {
        user,
        token,
      },
      status: HttpStatus.CREATED,
    });
  }

  async getAllUsers(): Promise<ResponseDto> {
    return new ResponseDto({
      data: await this.userRepository.findAll(),
      status: HttpStatus.OK,
    });
  }

  async authenticateUser(data: LoginUserDto): Promise<ResponseDto> {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      return new ResponseDto({
        data: "Usuário não encontrado",
        status: HttpStatus.NOT_FOUND,
      });
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      return new ResponseDto({
        data: "Email ou Senha inválidos",
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const token = generateToken({ id: user._id, email: user.email });
    return new ResponseDto({
      data: {
        user,
        token,
      },
      status: HttpStatus.OK,
    });
  }

  async getUserById(id: string): Promise<ResponseDto> {
    return new ResponseDto({
      data: await this.userRepository.findById(id),
      status: HttpStatus.OK,
    });
  }

  async getUserByEmail(email: string): Promise<ResponseDto> {
    return new ResponseDto({
      data: await this.userRepository.findByEmail(email),
      status: HttpStatus.OK,
    });
  }

  async deleteUserById(id: string): Promise<ResponseDto> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      return new ResponseDto({
        data: "Usuário não encontrado",
        status: HttpStatus.NOT_FOUND,
      });
    }

    await this.userRepository.softDelete(user!._id);

    return new ResponseDto({
      data: "Usuário deletado",
      status: HttpStatus.NO_CONTENT,
    });
  }

  async updateUserById(
    id: string,
    { address, coordinates, ...data }: UpdateUserDto,
  ): Promise<ResponseDto> {
    let registerAddress = null;

    if (coordinates) {
      registerAddress =
        await this.geoLocationService.getAddressFromCoordinates(coordinates);
    } else if (address) {
      registerAddress =
        await this.geoLocationService.getCoordinatesFromAddress(address);
    }

    if (!registerAddress) {
      return new ResponseDto({
        data: "Endereço não encontrado",
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const userData = {
      ...data,
      password: await bcrypt.hash(data.password, 8),
      address: registerAddress._id,
    };

    const savedUser = await this.userRepository.updateById(id, userData);

    return new ResponseDto({
      data: savedUser,
      status: HttpStatus.OK,
    });
  }
}
