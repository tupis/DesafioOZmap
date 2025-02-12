import { IsObject, IsArray, ValidateNested, IsString } from "class-validator";
import { Type } from "class-transformer";

class LocationDto {
  @IsString()
  type!: "Polygon";

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Array)
  coordinates!: number[][][];
}

export class UpdateRegionDto {
  @IsObject()
  @ValidateNested()
  @Type(() => LocationDto)
  location!: LocationDto;
}
