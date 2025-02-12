import { BaseRepository } from "@shared/database/repository/base-respository";
import { Region, RegionModel } from "@modules/region/entity/Region";

export class RegionRepository extends BaseRepository<Region> {
  constructor() {
    super(RegionModel);
  }
}
