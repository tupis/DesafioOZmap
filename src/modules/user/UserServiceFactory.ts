import { GeoLocationService } from "@shared/services/GeoLocationService";
import { AddressRepository } from "./repositories/AddressRepository";
import { UserRepository } from "./repositories/UserRepository";
import { UserService } from "./services/UserService";

export function getUserService(): UserService {
  const userRepository = new UserRepository();
  const addressRepository = new AddressRepository();
  const geoLocationService = new GeoLocationService(addressRepository);

  return new UserService(userRepository, geoLocationService);
}
