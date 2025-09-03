import { StormGlass } from "@src/clients/stormGlass";
import stormGlassWeather3HoursFixture from "@test/fixtures/stormGlass_weather_3_hours.json";
import stormGlassNormalized3HoursFixture from "@test/fixtures/stornGlass_normalized_response_3_hours.json";
import axios from "axios";
import { response } from "express";

jest.mock("axios");

describe("StormGlass Client", () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  it("should return the normalized forecast from the StormGlass service", async () => {
    const lat = 58.7984;
    const lgn = 17.8081;

    //aqui eu faço um retorno de mock que sobescreve a chamada get do axios
    // mockedAxios.get.mockReturnValue({ data: stormGlassWeather3HoursFixture });
    mockedAxios.get.mockResolvedValue({ data: stormGlassWeather3HoursFixture });

    const stormGlass = new StormGlass(mockedAxios);

    const response = await stormGlass.fetchPoints(lat, lgn);
    expect(response).toEqual(stormGlassNormalized3HoursFixture);
  });

  it("should exclude incomplete data points", async () => {
    const lat = 58.7984;
    const lgn = 17.8081;
    const imcompleteResponse = {
      hours: [
        {
          windDirection: {
            noaa: 300,
          },
          time: "2020-04-26T00:00:00+00:00",
        },
      ],
    };
    mockedAxios.get.mockResolvedValue({ data: imcompleteResponse });
    const stormGlass = new StormGlass(mockedAxios);
    const response = await stormGlass.fetchPoints(lat, lgn);
    expect(response).toEqual([]);
  });

  it("should get a generic error from StormGlass Service when the request fail before reaching the service", async () => {
    const lat = 58.7984;
    const lgn = 17.8081;

    mockedAxios.get.mockRejectedValue({ message: "Network Error" });
    const stormGlass = new StormGlass(mockedAxios);
    await expect(stormGlass.fetchPoints(lat, lgn)).rejects.toThrow(
      "Unexpected Error when trying to communicate to StormGlass: Network Error"
    );
  });

  it("should get an StormGlassResponseError when the StormGlass service response with error", async () => {
    const lat = 58.7984;
    const lgn = 17.8081;

    mockedAxios.get.mockRejectedValue({
      response: {
        status: 402,
        data: {
          errors: [
            "Payment Required – You’ve exceeded the daily request limit for your subscription. Please consider upgrading if this happens frequently.",
          ],
        },
      },
    });

    const stormGlass = new StormGlass(mockedAxios);
    await expect(stormGlass.fetchPoints(lat, lgn)).rejects.toThrow(
      `Unexpected Error returned by the StormGlass service: Error: {"errors":["Payment Required – You’ve exceeded the daily request limit for your subscription. Please consider upgrading if this happens frequently."]} Code: 402`
    );
  });
});
