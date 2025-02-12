import { BaseRepository } from "@shared/database/repository/base-respository";
import { Region, RegionModel } from "@modules/region/entity/Region";

export class RegionRepository extends BaseRepository<Region> {
  constructor() {
    super(RegionModel);
  }

  public async findRegionsContainingPoint(point: {
    type: "Point";
    coordinates: [number, number];
  }): Promise<Region[]> {
    return this.model.find({
      location: {
        $geoIntersects: {
          $geometry: point,
        },
      },
      deletedAt: null,
    }) as unknown as Region[];
  }

  public async findRegionsNearPoint(
    point: {
      type: "Point";
      coordinates: [number, number];
    },
    maxDistance: number,
    excludeUserId: string,
  ): Promise<Region[]> {
    type Query = {
      location: {
        $geoIntersects: {
          $geometry: {
            type: "Polygon";
            coordinates: number[][][];
          };
        };
      };
      deletedAt: null;
      userId: { $ne: string };
    };

    const bufferPolygon = this.createBufferPolygon(
      point.coordinates,
      maxDistance,
    );

    const query: Query = {
      location: {
        $geoIntersects: {
          $geometry: bufferPolygon,
        },
      },
      deletedAt: null,
      userId: { $ne: excludeUserId },
    };

    return this.model.find(query) as unknown as Region[];
  }

  private createBufferPolygon(
    coordinates: [number, number],
    distance: number,
  ): { type: "Polygon"; coordinates: number[][][] } {
    const earthRadius = 6371000;
    const lat = coordinates[1] * (Math.PI / 180);
    const lon = coordinates[0] * (Math.PI / 180);
    const angularDistance = distance / earthRadius;

    const points: [number, number][] = [];
    for (let angle = 0; angle <= 360; angle += 10) {
      const bearing = (angle * Math.PI) / 180;
      const lat2 = Math.asin(
        Math.sin(lat) * Math.cos(angularDistance) +
          Math.cos(lat) * Math.sin(angularDistance) * Math.cos(bearing),
      );
      const lon2 =
        lon +
        Math.atan2(
          Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat),
          Math.cos(angularDistance) - Math.sin(lat) * Math.sin(lat2),
        );

      points.push([lon2 * (180 / Math.PI), lat2 * (180 / Math.PI)]);
    }
    points.push(points[0]);

    return {
      type: "Polygon",
      coordinates: [points],
    } as const;
  }
}
