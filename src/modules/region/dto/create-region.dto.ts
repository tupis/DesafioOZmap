import {
  IsObject,
  IsArray,
  ValidateNested,
  IsString,
  IsOptional,
} from "class-validator";
import { Type } from "class-transformer";

class LocationDto {
  @IsString()
  type!: "Polygon";

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Array)
  coordinates!: number[][][];
}

export class CreateRegionDto {
  @IsObject()
  @ValidateNested()
  @Type(() => LocationDto)
  location!: LocationDto;

  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  observation?: string;

  @IsString()
  userId!: string;
}
