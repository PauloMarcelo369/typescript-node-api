import type supertest from "supertest";

declare global {
  var testRequest:
    | supertest.SuperTest<supertest.Test>
    | supertest.TestAgent<supertest.Test>;
}

export {};
