import { UserRepository } from "../repositories/UserRepository";
import { User } from "../entities/User";
import bcrypt from "bcryptjs";
import { generateToken } from "@utils/jwt";
import { LoginUserDto } from "../dto/login-user.dto";
import { RegisterUserDto } from "../dto/register-user.dto";
import { ResponseDto } from "@shared/dto/response.dto";
import { HttpStatus } from "@statusCode";
import { AddressRepository } from "../repositories/AddressRepository";
import { GeoLocationService } from "@shared/services/GeoLocationService";
import { UpdateUserDto } from "../dto/update-user.dto";

export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly addressRepository: AddressRepository,
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

  async updateUserById(
    id: string,
    { address, coordinates, ...data }: UpdateUserDto,
  ): Promise<User | null> {
    let registerAddress = null;

    if (coordinates) {
      registerAddress =
        await this.geoLocationService.getAddressFromCoordinates(coordinates);
    } else if (address) {
      registerAddress =
        await this.geoLocationService.getCoordinatesFromAddress(address);
    }

    if (!registerAddress) {
      return null;
    }

    return await this.userRepository.updateById(id, {
      ...data,
      password: await bcrypt.hash(data.password, 8),
      address: registerAddress._id,
    });
  }
}
