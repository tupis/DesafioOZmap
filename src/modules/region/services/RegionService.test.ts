/* eslint-disable @typescript-eslint/no-explicit-any */
import { RegionService } from "@modules/region/services/RegionService";
import { RegionRepository } from "@modules/region/repositories/RegionRepository";
import { CreateRegionDto } from "@modules/region/dto/create-region.dto";
import { ResponseDto } from "@shared/dto/response.dto";
import { HttpStatus } from "@statusCode";
import { FindRegionsContainingPointDto } from "@modules/region/dto/find-region-containing-point.dto";
import { FindRegionsNearPointDto } from "@modules/region/dto/find-regions-near-point.dto";
import { Region } from "@modules/region/entity/Region";

function generateRegion(index: number = 1): Region {
  const region = new Region();
  region._id = index.toString();
  region.name = "Region" + index;
  region.location = {
    type: "Polygon",
    coordinates: [
      [
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 5],
      ],
    ],
  };
  region.createdAt = new Date();
  region.updatedAt = new Date();
  region.deletedAt = null;

  return region;
}

describe("RegionService", () => {
  let regionService: RegionService;
  let regionRepository: jest.Mocked<RegionRepository>;

  beforeEach(() => {
    regionRepository = {
      create: jest.fn(),
      updateById: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      softDelete: jest.fn(),
      findRegionsContainingPoint: jest.fn(),
      findRegionsNearPoint: jest.fn(),
    } as any;

    regionService = new RegionService(regionRepository);
  });

  describe("create", () => {
    it("deve criar uma região e retornar os dados", async () => {
      const dto: CreateRegionDto = {
        name: "Test Region",
        location: {
          coordinates: [
            [
              [1, 2],
              [2, 3],
              [3, 4],
              [4, 5],
            ],
          ],
          type: "Polygon",
        },
        userId: "123",
      };
      const region = generateRegion();

      regionRepository.create.mockResolvedValue(region);

      const response = await regionService.create(dto);

      expect(response).toEqual(
        new ResponseDto({ data: region, status: HttpStatus.CREATED }),
      );
      expect(regionRepository.create).toHaveBeenCalledWith(dto);
    });
  });

  describe("update", () => {
    it("deve atualizar uma região existente", async () => {
      const dto: CreateRegionDto = {
        name: "Updated Region",
        location: {
          coordinates: [
            [
              [1, 2],
              [2, 3],
              [3, 4],
              [4, 5],
            ],
          ],
          type: "Polygon",
        },
        userId: "123",
      };
      const region = generateRegion();

      regionRepository.updateById.mockResolvedValue(region);

      const response = await regionService.update("1", dto);

      expect(response).toEqual(
        new ResponseDto({ data: region, status: HttpStatus.OK }),
      );
      expect(regionRepository.updateById).toHaveBeenCalledWith("1", dto);
    });

    it("deve retornar erro se a região não for encontrada", async () => {
      regionRepository.updateById.mockResolvedValue(null);

      const response = await regionService.update("1", {
        name: "Updated Region",
        location: {
          coordinates: [],
          type: "Polygon",
        },
        userId: "123",
      });

      expect(response).toEqual(
        new ResponseDto({
          data: "Region not found",
          status: HttpStatus.NOT_FOUND,
        }),
      );
    });
  });

  describe("listAll", () => {
    it("deve retornar todas as regiões", async () => {
      const regions = [];

      for (let i = 1; i <= 3; i++) {
        regions.push(generateRegion(i));
      }

      regionRepository.findAll.mockResolvedValue(regions);

      const response = await regionService.listAll();

      expect(response).toEqual(
        new ResponseDto({ data: regions, status: HttpStatus.OK }),
      );
    });
  });

  describe("findById", () => {
    it("deve retornar uma região pelo ID", async () => {
      const region = generateRegion();

      regionRepository.findById.mockResolvedValue(region);

      const response = await regionService.findById("1");

      expect(response).toEqual(
        new ResponseDto({ data: region, status: HttpStatus.OK }),
      );
    });

    it("deve retornar erro se a região não for encontrada", async () => {
      regionRepository.findById.mockResolvedValue(null);

      const response = await regionService.findById("1");

      expect(response).toEqual(
        new ResponseDto({
          data: "Region not created",
          status: HttpStatus.BAD_REQUEST,
        }),
      );
    });
  });

  describe("delete", () => {
    it("deve deletar uma região existente", async () => {
      const region = generateRegion();

      regionRepository.findById.mockResolvedValue(region);
      regionRepository.softDelete.mockResolvedValue(undefined);

      const response = await regionService.delete("1");

      expect(response).toEqual(
        new ResponseDto({ data: "Region deleted", status: HttpStatus.OK }),
      );
    });

    it("deve retornar erro se a região não for encontrada", async () => {
      regionRepository.findById.mockResolvedValue(null);

      const response = await regionService.delete("1");

      expect(response).toEqual(
        new ResponseDto({
          data: "Region not found",
          status: HttpStatus.NOT_FOUND,
        }),
      );
    });
  });

  describe("findRegionsContainingPoint", () => {
    it("deve encontrar regiões contendo um ponto", async () => {
      const dto: FindRegionsContainingPointDto = {
        latitude: -23.56,
        longitude: -46.64,
      };
      const regions = [];

      for (let i = 1; i <= 3; i++) {
        regions.push(generateRegion(i));
      }

      regionRepository.findRegionsContainingPoint.mockResolvedValue(regions);

      const response = await regionService.findRegionsContainingPoint(dto);

      expect(response).toEqual(
        new ResponseDto({ data: regions, status: HttpStatus.OK }),
      );
    });
  });

  describe("findRegionsNearPoint", () => {
    it("deve encontrar regiões próximas a um ponto", async () => {
      const dto: FindRegionsNearPointDto = {
        latitude: -23.56,
        longitude: -46.64,
        maxDistance: 5000,
      };
      const userId = "123";
      const regions = [];

      for (let i = 1; i <= 3; i++) {
        regions.push(generateRegion(i));
      }

      regionRepository.findRegionsNearPoint.mockResolvedValue(regions);

      const response = await regionService.findRegionsNearPoint(dto, userId);

      expect(response).toEqual(
        new ResponseDto({ data: regions, status: HttpStatus.OK }),
      );
    });
  });
});
