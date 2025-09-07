import { StormGlass } from "@src/clients/stormGlass";
import stormGlassWeather3HoursFixture from "@test/fixtures/stormGlass_weather_3_hours.json";
import stormGlassNormalized3HoursFixture from "@test/fixtures/stornGlass_normalized_response_3_hours.json";

import * as HTTPUtil from "@src/util/request";

jest.mock("@src/util/request");

describe("StormGlass Client", () => {
  const mockedRequestClass = HTTPUtil.Request as jest.Mocked<
    typeof HTTPUtil.Request
  >;
  const mockedRequest = new HTTPUtil.Request() as jest.Mocked<HTTPUtil.Request>;
  it("should return the normalized forecast from the StormGlass service", async () => {
    const lat = 58.7984;
    const lgn = 17.8081;

    //aqui eu faço um retorno de mock que sobescreve a chamada get do axios
    // mockedAxios.get.mockReturnValue({ data: stormGlassWeather3HoursFixture });
    mockedRequest.get.mockResolvedValue({
      data: stormGlassWeather3HoursFixture,
    } as HTTPUtil.Response);

    const stormGlass = new StormGlass(mockedRequest);

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
    mockedRequest.get.mockResolvedValue({
      data: imcompleteResponse,
    } as HTTPUtil.Response);
    const stormGlass = new StormGlass(mockedRequest);
    const response = await stormGlass.fetchPoints(lat, lgn);
    expect(response).toEqual([]);
  });

  it("should get a generic error from StormGlass Service when the request fail before reaching the service", async () => {
    const lat = 58.7984;
    const lgn = 17.8081;

    mockedRequest.get.mockRejectedValue({ message: "Network Error" });
    const stormGlass = new StormGlass(mockedRequest);
    await expect(stormGlass.fetchPoints(lat, lgn)).rejects.toThrow(
      "Unexpected Error when trying to communicate to StormGlass: Network Error"
    );
  });

  it("should get an StormGlassResponseError when the StormGlass service response with error", async () => {
    const lat = 58.7984;
    const lgn = 17.8081;

    mockedRequestClass.isRequestError.mockReturnValue(true);

    mockedRequest.get.mockRejectedValue({
      response: {
        status: 402,
        data: {
          errors: [
            "Payment Required – You’ve exceeded the daily request limit for your subscription. Please consider upgrading if this happens frequently.",
          ],
        },
      },
    });

    const stormGlass = new StormGlass(mockedRequest);
    await expect(stormGlass.fetchPoints(lat, lgn)).rejects.toThrow(
      `Unexpected Error returned by the StormGlass service: Error: {"errors":["Payment Required – You’ve exceeded the daily request limit for your subscription. Please consider upgrading if this happens frequently."]} Code: 402`
    );
  });
});
