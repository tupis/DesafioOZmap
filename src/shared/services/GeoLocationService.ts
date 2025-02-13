import axios from "axios";
import { AddressRepository } from "@modules/user/repositories/AddressRepository";
import { Address } from "@modules/user/entities/Address";

//TODO: CreateInterface
export interface ResponseGoogleMaps {
  address_components: AddressComponent[];
  formatted_address: string;
  geometry: Geometry;
  navigation_points: NavigationPoint[];
  place_id: string;
  plus_code: PlusCode;
  types: string[];
}

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface Geometry {
  location: Location;
  location_type: string;
  viewport: Viewport;
}

interface Location {
  lat: number;
  lng: number;
}

interface Viewport {
  northeast: Northeast;
  southwest: Southwest;
}

interface Northeast {
  lat: number;
  lng: number;
}

interface Southwest {
  lat: number;
  lng: number;
}

interface NavigationPoint {
  location: Location2;
}

interface Location2 {
  latitude: number;
  longitude: number;
}

interface PlusCode {
  compound_code: string;
  global_code: string;
}

export class GeoLocationService {
  private googleMapsApiKey = process.env.MAPS_API_KEY;
  private googleMapsUrl = "https://maps.googleapis.com/maps/api/geocode/json";

  constructor(private readonly addressRepository: AddressRepository) {}

  /**
   * Busca um endereço a partir das coordenadas usando índice geoespacial do MongoDB.
   * Primeiro tenta encontrar no banco, se não achar, busca no Google Maps e salva no DB.
   */
  async getAddressFromCoordinates(coordinates: {
    latitude: number;
    longitude: number;
  }): Promise<Address | null> {
    const { latitude, longitude } = coordinates;

    const existingAddress = await this.addressRepository.findByCoordinates({
      latitude,
      longitude,
    });

    if (existingAddress) {
      return existingAddress;
    }

    const response = await axios
      .get(this.googleMapsUrl, {
        params: {
          latlng: `${latitude},${longitude}`,
          key: this.googleMapsApiKey,
        },
      })
      .then((res) => res.data.results[0]);

    const result = response.data.results[0];

    const address = this.createModelFromResultGoogleAPI(result);
    return await this.addressRepository.create(address);
  }

  /**
   * Busca as coordenadas de um endereço.
   * Primeiro tenta encontrar no banco pelo endereço formatado, se não achar, busca no Google Maps e salva no DB.
   */
  async getCoordinatesFromAddress(
    address: Omit<
      Address,
      | "location"
      | "fullAddress"
      | "createdAt"
      | "updatedAt"
      | "_id"
      | "deletedAt"
    >,
  ): Promise<Address | null> {
    const existingAddress = await this.addressRepository.findOne(address);

    if (existingAddress) {
      return existingAddress;
    }

    const addressURLParam = `${address.number}, ${address.street}, ${address.city}, ${address.state}, ${address.country}, ${address.zipCode}`;

    const response = await axios
      .get(this.googleMapsUrl, {
        params: {
          address: addressURLParam,
          key: this.googleMapsApiKey,
        },
      })
      .then((res) => res.data.results[0]);

    const addressModel = this.createModelFromResultGoogleAPI(response);

    return await this.addressRepository.create(addressModel);
  }

  private createModelFromResultGoogleAPI(data: ResponseGoogleMaps): Address {
    const address = new Address();

    for (const component of data.address_components) {
      if (component.types.includes("street_number")) {
        address.number = component.long_name;
      }
      if (component.types.includes("route")) {
        address.street = component.long_name;
      }
      if (
        component.types.includes("locality") ||
        component.types.includes("administrative_area_level_2")
      ) {
        address.city = component.long_name;
      }
      if (component.types.includes("administrative_area_level_1")) {
        address.state = component.long_name;
      }
      if (component.types.includes("country")) {
        address.country = component.long_name;
      }
      if (component.types.includes("postal_code")) {
        address.zipCode = component.long_name;
      }
    }

    const fullAddress = data.address_components
      .map(
        (component: { long_name: string; short_name: string }) =>
          component.long_name,
      )
      .join(", ");

    address.fullAddress = fullAddress;

    const { lat, lng } = data.geometry.location;

    address.location = {
      type: "Point",
      coordinates: [lng, lat],
    };

    return address;
  }
}
