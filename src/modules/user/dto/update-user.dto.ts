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
  Max,
  Min,
} from "class-validator";

class Coordinates {
  @IsNumber()
  @Min(-90, { message: "Latitude deve ser maior que -90." })
  @Max(90, { message: "Latitude deve ser menor que 90." })
  latitude: number;

  @IsNumber()
  @Min(-180, { message: "Longitude deve ser maior que -180." })
  @Max(180, { message: "Longitude deve ser menor que 180." })
  longitude: number;
}

class Address {
  @IsString()
  street: string;

  @IsString()
  number: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  country: string;

  @IsString()
  zipCode: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => Coordinates)
  location?: Coordinates;
}

export class UpdateUserDto {
  @IsString()
  @IsEmail()
  @IsOptional()
  email: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  password: string;

  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => Address)
  @IsOptional()
  address?: Address;

  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => Coordinates)
  @IsOptional()
  coordinates?: Coordinates;

  @IsAddressOrCoordinates()
  validation?: boolean;
}

export function IsAddressOrCoordinates(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "IsAddressOrCoordinates",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(_: any, args: ValidationArguments): boolean {
          const obj = args.object as UpdateUserDto;
          return (
            (!!obj.address && !obj.coordinates) ||
            (!obj.address && !!obj.coordinates)
          );
        },
        defaultMessage() {
          return "Você deve fornecer **apenas um** entre endereço e coordenadas.";
        },
      },
    });
  };
}
