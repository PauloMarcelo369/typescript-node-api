import { StormGlass } from "@src/clients/stormGlass";
import { ForecastPoint } from "@src/clients/stormGlass";

export enum BeachPosition {
  S = "S",
  N = "N",
  E = "E",
  W = "W",
}

export interface Beach {
  lat: number;
  lng: number;
  name: string;
  position: BeachPosition;
  user: string;
}

export interface BeachsWhithRating extends Omit<Beach, "user">, ForecastPoint {}

export class Forecast {
  constructor(protected stormGlass = new StormGlass()) {}

  public async processForecastForBeachs(
    beaches: Beach[]
  ): Promise<BeachsWhithRating[]> {
    const pointsWithCorrectSource: BeachsWhithRating[] = [];
    for (const beach of beaches) {
      const points = await this.stormGlass.fetchPoints(beach.lat, beach.lng);
      const enrichedBeachData = points.map((point) => ({
        ...{
          lat: beach.lat,
          lng: beach.lng,
          name: beach.name,
          position: beach.position,
          rating: 1,
        },
        ...point,
      }));
      pointsWithCorrectSource.push(...enrichedBeachData);
    }

    return pointsWithCorrectSource;
  }
}
