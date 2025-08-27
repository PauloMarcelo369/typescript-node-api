import express from "express";
import { injectable, inject } from "tsyringe";
import { TOKENS } from "@src/util/dt-tokens";
import { json } from "body-parser";
import { ForecastController } from "@src/controllers/forecast";
import { attachControllers } from "@decorators/express";

@injectable()
export class SetupServer {
  private app = express();

  constructor(
    @inject(TOKENS.setupServerTokenPort) private readonly PORT: number
  ) {}

  public init(): void {
    this.setupExpress();
    this.setupControllers();
  }

  private setupExpress(): void {
    this.app.use(json());
  }

  private setupControllers(): void {
    attachControllers(this.app, [ForecastController]);
  }

  public getApp(): express.Express {
    return this.app;
  }
}
