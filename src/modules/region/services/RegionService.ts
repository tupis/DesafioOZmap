import { ResponseDto } from "@shared/dto/response.dto";
import { CreateRegionDto } from "../dto/create-region.dto";
import { RegionRepository } from "../repositories/RegionRepository";
import { HttpStatus } from "@statusCode";
import { FindRegionsContainingPointDto } from "../dto/find-regions-containing-point.dto";
import { FindRegionsNearPointDto } from "../dto/find-regions-near-point.dto";

export class RegionService {
  constructor(private readonly regionRepository: RegionRepository) {}

  async create(data: CreateRegionDto) {
    const region = await this.regionRepository.create(data);

    if (!region)
      return new ResponseDto({
        data: "Region not created",
        status: HttpStatus.BAD_REQUEST,
      });

    return new ResponseDto({
      data: region,
      status: HttpStatus.CREATED,
    });
  }

  async update(id: string, data: CreateRegionDto) {
    const region = await this.regionRepository.updateById(id, data);

    if (!region)
      return new ResponseDto({
        data: "Region not found",
        status: HttpStatus.NOT_FOUND,
      });

    return new ResponseDto({
      data: region,
      status: HttpStatus.OK,
    });
  }

  async listAll() {
    const regions = await this.regionRepository.findAll();

    return new ResponseDto({
      data: regions,
      status: HttpStatus.OK,
    });
  }

  async findById(id: string) {
    const region = await this.regionRepository.findById(id);

    if (!region)
      return new ResponseDto({
        data: "Region not created",
        status: HttpStatus.NOT_FOUND,
      });

    return new ResponseDto({
      data: region,
      status: HttpStatus.OK,
    });
  }

  async delete(id: string) {
    const region = await this.regionRepository.findById(id);

    if (!region)
      return new ResponseDto({
        data: "Region not found",
        status: HttpStatus.NOT_FOUND,
      });

    await this.regionRepository.softDelete(id);

    return new ResponseDto({
      data: "Region deleted",
      status: HttpStatus.OK,
    });
  }

  async findRegionsContainingPoint({
    latitude,
    longitude,
  }: FindRegionsContainingPointDto) {
    const regions = await this.regionRepository.findRegionsContainingPoint({
      type: "Point",
      coordinates: [latitude, longitude],
    });

    return new ResponseDto({
      data: regions,
      status: HttpStatus.OK,
    });
  }

  async findRegionsNearPoint(
    { latitude, longitude, maxDistance }: FindRegionsNearPointDto,
    userId: string,
  ) {
    const regions = await this.regionRepository.findRegionsNearPoint(
      { coordinates: [latitude, longitude], type: "Point" },
      maxDistance,
      userId,
    );

    return new ResponseDto({
      data: regions,
      status: HttpStatus.OK,
    });
  }
}
