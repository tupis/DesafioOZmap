import { RegionRepository } from "./repositories/RegionRepository";
import { RegionService } from "./services/RegionService";

export function getRegionService(): RegionService {
  const regionRepository = new RegionRepository();
  return new RegionService(regionRepository);
}
