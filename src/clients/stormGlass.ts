import { InternalError } from "@src/util/errors/internal-error";
import { AxiosStatic } from "axios";
import config, { IConfig } from "config";
import * as HTTPUtil from "@src/util/request";

export interface StormGlassPointSource {
  [key: string]: number;
}

export interface StormGlassPoint {
  readonly swellDirection: StormGlassPointSource;
  readonly swellHeight: StormGlassPointSource;
  readonly swellPeriod: StormGlassPointSource;
  readonly time: string;
  readonly waveDirection: StormGlassPointSource;
  readonly waveHeight: StormGlassPointSource;
  readonly windDirection: StormGlassPointSource;
  readonly windSpeed: StormGlassPointSource;
}

export interface ForecastPoint {
  swellDirection: number;
  swellHeight: number;
  swellPeriod: number;
  time: string;
  waveDirection: number;
  waveHeight: number;
  windDirection: number;
  windSpeed: number;
}

export interface StormGlassForecastResponse {
  hours: StormGlassPoint[];
}

export class ClientRequestError extends InternalError {
  constructor(message: string) {
    const internalMessage = `Unexpected Error when trying to communicate to StormGlass`;
    super(`${internalMessage}: ${message}`);
  }
}

export class StormGlassResponseError extends InternalError {
  constructor(message: string) {
    const internalMessage = `Unexpected Error returned by the StormGlass service`;
    super(`${internalMessage}: ${message}`);
  }
}

const stormGlassResourceConfig: IConfig = config.get(
  "App.resources.StormGlass"
);

export class StormGlass {
  constructor(protected request = new HTTPUtil.Request()) {}
  readonly stormGlassApiParams =
    "swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection,windSpeed";
  readonly stormGlassAPISource = "noaa";

  public async fetchPoints(lat: number, lng: number): Promise<ForecastPoint[]> {
    try {
      const data = await this.request.get<StormGlassForecastResponse>(
        `${stormGlassResourceConfig.get("apiUrl")}/weather/point?params=${
          this.stormGlassApiParams
        }&source=${this.stormGlassAPISource}&lat=${lat}&lng=${lng}`,
        {
          headers: {
            Authorization: stormGlassResourceConfig.get("apiToken"),
          },
        }
      );

      return this.normalizeResponse(data.data);
    } catch (error: any) {
      if (HTTPUtil.Request.isRequestError(error)) {
        console.log("entrei");
        throw new StormGlassResponseError(
          `Error: ${JSON.stringify(error.response.data)} Code: ${
            error.response.status
          }`
        );
      }
      throw new ClientRequestError(error.message);
    }
  }

  private normalizeResponse(
    points: StormGlassForecastResponse
  ): ForecastPoint[] {
    return points.hours.filter(this.isValidPoint.bind(this)).map((point) => ({
      swellDirection: point.swellDirection[this.stormGlassAPISource] as number,
      swellHeight: point.swellHeight[this.stormGlassAPISource] as number,
      swellPeriod: point.swellPeriod[this.stormGlassAPISource] as number,
      time: point.time,
      waveDirection: point.waveDirection[this.stormGlassAPISource] as number,
      waveHeight: point.waveHeight[this.stormGlassAPISource] as number,
      windDirection: point.windDirection[this.stormGlassAPISource] as number,
      windSpeed: point.windSpeed[this.stormGlassAPISource] as number,
    }));
  }

  private isValidPoint(point: Partial<StormGlassPoint>): boolean {
    return !!(
      point.time &&
      point.swellDirection?.[this.stormGlassAPISource] &&
      point.swellHeight?.[this.stormGlassAPISource] &&
      point.swellPeriod?.[this.stormGlassAPISource] &&
      point.waveDirection?.[this.stormGlassAPISource] &&
      point.waveHeight?.[this.stormGlassAPISource] &&
      point.windDirection?.[this.stormGlassAPISource] &&
      point.windSpeed?.[this.stormGlassAPISource]
    );
  }
}
