import { CreateRegionDto } from "@modules/region/dto/create-region.dto";
import { FindRegionsContainingPointDto } from "@modules/region/dto/find-region-containing-point.dto";
import { FindRegionsNearPointDto } from "@modules/region/dto/find-regions-near-point.dto";
import { UpdateRegionDto } from "@modules/region/dto/update-region.dto";
import { getRegionService } from "@modules/region/RegionServiceFactory";
import { RegionService } from "@modules/region/services/RegionService";
import { HttpStatus } from "@statusCode";
import { Request, Response } from "express";

class RegionController {
  constructor(
    private readonly regionService: RegionService = getRegionService(),
  ) {}

  async create(request: Request, response: Response) {
    const { data, status } = await this.regionService.create(
      request.body as CreateRegionDto,
    );
    return response.status(status).json(data);
  }

  async update(request: Request, response: Response) {
    const id = request.params.id;

    if (!id) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        data: "ID is required",
      });
    }

    const { data, status } = await this.regionService.update(
      id,
      request.body as UpdateRegionDto,
    );

    return response.status(status).json(data);
  }

  async getAll(request: Request, response: Response) {
    const { data, status } = await this.regionService.listAll();
    return response.status(status).json(data);
  }

  async findById(request: Request, response: Response) {
    const id = request.params.id;

    if (!id) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        data: "ID is required",
      });
    }

    const { data, status } = await this.regionService.findById(id);

    return response.status(status).json(data);
  }

  async findRegionsContainingPoint(request: Request, response: Response) {
    const region = request.body as FindRegionsContainingPointDto;

    if (!region) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        data: "Region is required",
      });
    }

    const { data, status } =
      await this.regionService.findRegionsContainingPoint(region);

    return response.status(status).json(data);
  }

  async findRegionsNearPointDto(request: Request, response: Response) {
    const region = request.body as FindRegionsNearPointDto;

    if (!request.user) {
      return response.status(HttpStatus.UNAUTHORIZED).json({
        data: "User is not authenticated",
      });
    }

    const { data, status } = await this.regionService.findRegionsNearPoint(
      region,
      request.user.id,
    );

    return response.status(status).json(data);
  }
}

export default new RegionController();
