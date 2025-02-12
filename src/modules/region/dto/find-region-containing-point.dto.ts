import { IsNumber, Min } from "class-validator";

export class FindRegionsContainingPointDto {
  @IsNumber()
  @Min(-90, { message: "Latitude must be greater than -90" })
  latitude: number;

  @IsNumber()
  @Min(-180, { message: "Longitude must be greater than -180" })
  longitude: number;
}
