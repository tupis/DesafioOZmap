import { Address, AddressModel } from "@modules/user/entities/Address";
import { BaseRepository } from "@shared/database/repository/base-respository";

export class AddressRepository extends BaseRepository<Address> {
  constructor() {
    super(AddressModel);
  }

  async findByCoordinates(coordinates: {
    latitude: number;
    longitude: number;
  }): Promise<Address | null> {
    const { latitude, longitude } = coordinates;

    const existingAddress = await AddressModel.findOne({
      location: {
        $geoWithin: {
          $centerSphere: [[longitude, latitude], 5 / (6378.1 * 1000)], // Precisão de 5 metros
        },
      },
    });

    return existingAddress;
  }

  async findByFullAddress(fullAddress: string): Promise<Address | null> {
    const existingAddress = await AddressModel.findOne({ fullAddress });
    return existingAddress;
  }

  async findOne(query: Partial<Address>): Promise<Address | null> {
    const existingAddress = await AddressModel.findOne(query);
    return existingAddress;
  }
}
