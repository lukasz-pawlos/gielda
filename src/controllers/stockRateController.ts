import { validationResult } from "express-validator";
import { AppError } from "../utils/appError";
import { TypedRequestBody } from "../utils/TypedRequestBody";
import { NextFunction, Request, Response } from "express";
import { StockRateRequest } from "../types/request/StockRateRequest";
import {
  createStockRateService,
  allActualStockRatesService,
  actualCompanyStockRateService,
} from "../services/stockRateService";
import { catchAsync } from "../utils/catchAsync";
import { APILog, createLog } from "../utils/logger/createlog";

export const allActualStockRates = catchAsync(async (req: Request, res: Response) => {
  const start = new Date();
  const { result, databaseTime } = await allActualStockRatesService();
  const end = new Date();

  res.json({ result });

  const ApiLog: APILog = {
    apiMethod: "GET",
    apiTime: end.getTime() - start.getTime(),
    applicationTime: new Date().getTime() - start.getTime(),
    databaseTime,
    endpointUrl: `/stockrate${req.path}`,
  };

  createLog(ApiLog, "apiUse.csv");
});

export const actualCompanyStockRate = catchAsync(async (req: Request, res: Response) => {
  const start = new Date();
  const companyId: any = req.params.id;
  const { result, databaseTime } = await actualCompanyStockRateService(companyId);
  const end = new Date();

  res.json(result);

  const ApiLog: APILog = {
    apiMethod: "GET",
    apiTime: end.getTime() - start.getTime(),
    applicationTime: new Date().getTime() - start.getTime(),
    databaseTime,
    endpointUrl: `/stockrate${req.path}`,
  };

  createLog(ApiLog, "apiUse.csv");
});

export const createStockRate = catchAsync(
  async (req: TypedRequestBody<StockRateRequest>, res: Response, next: NextFunction) => {
    const start = new Date();

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return next(new AppError("Validation errors", 400, errors.array()));
    }

    const { result, databaseTime } = await createStockRateService(req.body);
    const end = new Date();

    res.json({ message: "Stock added", result });

    const ApiLog: APILog = {
      apiMethod: "POST",
      apiTime: end.getTime() - start.getTime(),
      applicationTime: new Date().getTime() - start.getTime(),
      databaseTime,
      endpointUrl: `/stockrate${req.path}`,
    };

    createLog(ApiLog, "apiUse.csv");
  }
);
