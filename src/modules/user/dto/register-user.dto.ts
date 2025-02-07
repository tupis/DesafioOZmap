/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-wrapper-object-types */
import { Type } from "class-transformer";
import {
  IsEmail,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from "class-validator";

class Coordinates {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}

class Address {
  @IsString()
  street: string;

  @IsNumber()
  number: number;

  @IsString()
  city: string;

  @IsString()
  state: string;
}

export class RegisterUserDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => Address)
  @IsOptional()
  address: Address;

  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => Coordinates)
  @IsOptional()
  coordinates: Coordinates;

  @IsAddressOrCoordinates()
  validation: boolean;
}

export function IsAddressOrCoordinates(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "IsAddressOrCoordinates",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const object = args.object as any;
          if (
            (object.address && object.coordinates) || // Ambos fornecidos
            (!object.address && !object.coordinates) // Nenhum fornecido
          ) {
            return false; // Invalid
          }
          return true; // Valid
        },
        defaultMessage() {
          return "Você deve fornecer apenas um endereço ou coordenadas, não ambos ou nenhum.";
        },
      },
    });
  };
}
