/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserService } from "../services/UserService";
import { UserRepository } from "../repositories/UserRepository";
import { GeoLocationService } from "@shared/services/GeoLocationService";
import { User } from "../entities/User";
import { RegisterUserDto } from "../dto/register-user.dto";
import { LoginUserDto } from "../dto/login-user.dto";
import { ResponseDto } from "@shared/dto/response.dto";
import { HttpStatus } from "@statusCode";
import bcrypt from "bcryptjs";
import { generateToken } from "@utils/jwt";
import { Address } from "../entities/Address";

jest.mock("bcryptjs");
jest.mock("@utils/jwt");

describe("UserService", () => {
  let userService: UserService;
  let userRepository: jest.Mocked<UserRepository>;
  let geoLocationService: jest.Mocked<GeoLocationService>;

  beforeEach(() => {
    userRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      softDelete: jest.fn(),
      updateById: jest.fn(),
    } as any;

    geoLocationService = {
      getAddressFromCoordinates: jest.fn(),
      getCoordinatesFromAddress: jest.fn(),
    } as any;

    userService = new UserService(userRepository, geoLocationService);
  });

  function generateUser(index: number = 1): User {
    return {
      _id: index.toString(),
      name: `User ${index}`,
      email: `user${index}@example.com`,
      password: `hashedPassword${index}`,
      address: `addressId${index}`,
    } as User;
  }

  function generateCreateUserDto(
    { withAdress = false, withCoordinates = false } = {},
    index: number = 1,
  ): RegisterUserDto {
    const obj: RegisterUserDto = {
      email: `email${index}@email.com`,
      password: `password${index}`,
    };

    if (withAdress) {
      obj.address = {
        city: "City",
        state: "State",
        country: "Country",
        street: "Street",
        number: "123",
        zipCode: "12345678",
      };
    }

    if (withCoordinates) {
      obj.coordinates = {
        latitude: 1,
        longitude: 2,
      };
    }

    return obj;
  }

  function generateAddressSaved(index: number = 1): Address {
    return {
      _id: "addressId" + index,
      city: "City",
      state: "State",
      country: "Country",
      street: "Street",
      number: "123",
      zipCode: "12345678",
      createdAt: new Date(),
      deletedAt: null,
      fullAddress: "Street, 123 - City, State, Country",
      updatedAt: new Date(),
      location: {
        type: "Point",
        coordinates: [1, 2],
      },
    };
  }

  describe("createUser", () => {
    it("deve criar um usuário com sucesso apenas com endereço", async () => {
      const dto: RegisterUserDto = generateCreateUserDto({ withAdress: true });

      userRepository.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword123");
      geoLocationService.getCoordinatesFromAddress.mockResolvedValue(
        generateAddressSaved(),
      );
      userRepository.create.mockResolvedValue(generateUser(1));
      (generateToken as jest.Mock).mockReturnValue("mockedToken");

      const response = await userService.createUser(dto);

      expect(response).toEqual(
        new ResponseDto({
          data: { user: generateUser(1), token: "mockedToken" },
          status: HttpStatus.CREATED,
        }),
      );
    });

    it("deve criar um usuário com sucesso apenas com as coordenadas", async () => {
      const dto: RegisterUserDto = generateCreateUserDto({
        withCoordinates: true,
      });

      userRepository.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword123");
      geoLocationService.getAddressFromCoordinates.mockResolvedValue(
        generateAddressSaved(),
      );
      userRepository.create.mockResolvedValue(generateUser());
      (generateToken as jest.Mock).mockReturnValue("mockedToken");

      const response = await userService.createUser(dto);

      expect(response).toEqual(
        new ResponseDto({
          data: { user: generateUser(), token: "mockedToken" },
          status: HttpStatus.CREATED,
        }),
      );
    });

    it("deve retornar erro ao tentar criar um usuário já existente", async () => {
      const dto: RegisterUserDto = generateCreateUserDto({ withAdress: true });

      userRepository.findByEmail.mockResolvedValue(generateUser(1));

      const response = await userService.createUser(dto);

      expect(response).toEqual(
        new ResponseDto({
          data: "Usuário já cadastrado",
          status: HttpStatus.BAD_REQUEST,
        }),
      );
    });

    it("deve retornar erro se o endereço não for encontrado", async () => {
      const dto = {
        name: "User",
        email: "user@example.com",
        password: "password123",
      };

      userRepository.findByEmail.mockResolvedValue(null);
      geoLocationService.getCoordinatesFromAddress.mockResolvedValue(null);

      const response = await userService.createUser(dto);

      expect(response).toEqual(
        new ResponseDto({
          data: "Endereço não encontrado",
          status: HttpStatus.BAD_REQUEST,
        }),
      );
    });
  });

  describe("authenticateUser", () => {
    it("deve autenticar um usuário com sucesso", async () => {
      const dto: LoginUserDto = {
        email: "user@example.com",
        password: "password123",
      };
      const user = generateUser(1);

      userRepository.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (generateToken as jest.Mock).mockReturnValue("mockedToken");

      const response = await userService.authenticateUser(dto);

      expect(response).toEqual(
        new ResponseDto({
          data: { user, token: "mockedToken" },
          status: HttpStatus.OK,
        }),
      );
    });

    it("deve retornar erro se o usuário não for encontrado", async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      const response = await userService.authenticateUser({
        email: "notfound@example.com",
        password: "password123",
      });

      expect(response).toEqual(
        new ResponseDto({
          data: "Usuário não encontrado",
          status: HttpStatus.NOT_FOUND,
        }),
      );
    });

    it("deve retornar erro se a senha estiver incorreta", async () => {
      const user = generateUser(1);
      userRepository.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const response = await userService.authenticateUser({
        email: "user@example.com",
        password: "wrongpassword",
      });

      expect(response).toEqual(
        new ResponseDto({
          data: "Email ou Senha inválidos",
          status: HttpStatus.BAD_REQUEST,
        }),
      );
    });
  });

  describe("getAllUsers", () => {
    it("deve retornar uma lista de usuários", async () => {
      const users = [generateUser(1), generateUser(2)];
      userRepository.findAll.mockResolvedValue(users);

      const response = await userService.getAllUsers();

      expect(response.data).toEqual(users);
    });
  });

  describe("getUserById", () => {
    it("deve retornar um usuário pelo ID", async () => {
      const user = generateUser(1);
      userRepository.findById.mockResolvedValue(user);

      const response = await userService.getUserById("1");

      expect(response.data).toEqual(user);
    });
  });

  describe("deleteUserById", () => {
    it("deve deletar um usuário com sucesso", async () => {
      const user = generateUser(1);
      userRepository.findById.mockResolvedValue(user);
      userRepository.softDelete.mockResolvedValue(undefined);

      await userService.deleteUserById("1");

      expect(userRepository.softDelete).toHaveBeenCalledWith("1");
    });
  });

  describe("updateUserById", () => {
    it("deve atualizar um usuário com sucesso", async () => {
      const dto = generateCreateUserDto({ withAdress: true });

      const user = generateUser(1);
      (bcrypt.hash as jest.Mock).mockResolvedValue("newhashedpassword");
      geoLocationService.getCoordinatesFromAddress.mockResolvedValue(
        generateAddressSaved(),
      );
      userRepository.updateById.mockResolvedValue({
        ...user,
        name: "Updated User",
        password: "newhashedpassword",
      });

      const response = await userService.updateUserById("1", dto);

      expect(response.data).toEqual({
        ...user,
        name: "Updated User",
        password: "newhashedpassword",
      });
    });
  });
});
