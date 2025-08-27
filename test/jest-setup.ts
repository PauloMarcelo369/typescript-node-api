import "reflect-metadata";
import { SetupServer } from "@src/api/api";
import supertest from "supertest";

beforeAll(() => {
  const server = new SetupServer(3000);
  server.init();
  global.testRequest = supertest(server.getApp());
});
