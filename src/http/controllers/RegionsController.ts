import { CreateRegionDto } from "@modules/region/dto/create-region.dto";
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
}

export default new RegionController();
