import { StormGlass } from "@src/clients/stormGlass";
import stormGlassWeather3HoursFixture from "@test/fixtures/stormGlass_weather_3_hours.json";
import stormGlassNormalized3HoursFixture from "@test/fixtures/stornGlass_normalized_response_3_hours.json";
import axios from "axios";

jest.mock("axios");

describe("StormGlass Client", () => {
  it("should return the normalized forecast from the StormGlass service", async () => {
    const lat = 58.7984;
    const lgn = 17.8081;

    //aqui eu faço um retorno de mock que sobescreve a chamada get do axios
    axios.get = jest
      .fn()
      .mockReturnValue({ data: stormGlassWeather3HoursFixture });

    const stormGlass = new StormGlass(axios);
    const response = await stormGlass.fetchPoints(lat, lgn);
    expect(response).toEqual(stormGlassNormalized3HoursFixture);
  });
});
