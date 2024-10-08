import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { AppError } from "../utils/appError";
import { TypedRequestBody } from "../utils/TypedRequestBody";
import { createStockService, getStockByUserIdService, getStockService } from "../services/stockService";
import { StockRequest } from "../types/request/StockRequest";
import { catchAsync } from "../utils/catchAsync";
import { createLog } from "../utils/logger/createlog";
import { APILog } from "../database/logDB/services/addLog";
import { ApiMethod } from "../database/logDB/entities/MarketLogEntities";

export const createStock = catchAsync(
  async (req: TypedRequestBody<StockRequest>, res: Response, next: NextFunction) => {
    const start = new Date();
    const requestId: string = Array.isArray(req.headers["x-request-id"])
      ? req.headers["x-request-id"][0]
      : req.headers["x-request-id"] || "default-request-id";
    const errors = validationResult(req);

    if (!errors.isEmpty()) return next(new AppError("Validation errors", 400, errors.array()));

    const { result, databaseTime } = await createStockService(req.body);
    const end = new Date();

    res.json({ message: "Stock added", result });

    const ApiLog: APILog = {
      apiMethod: ApiMethod.POST,
      applicationTime: new Date().getTime() - start.getTime(),
      databaseTime,
      endpointUrl: `/stock${req.path}`,
      requestId,
    };

    createLog(ApiLog, "marketLog");
  }
);

export const getStock = catchAsync(async (req: Request, res: Response) => {
  const stockId: any = req.params.id;
  const stock = await getStockService(stockId);
  res.json(stock);
});

export const getStockByUserId = catchAsync(async (req: Request, res: Response) => {
  const start = new Date();
  const requestId: string = Array.isArray(req.headers["x-request-id"])
    ? req.headers["x-request-id"][0]
    : req.headers["x-request-id"] || "default-request-id";
  const userId: any = req.params.id;

  const { result, databaseTime } = await getStockByUserIdService(userId);
  const end = new Date();

  res.json(result);

  const ApiLog: APILog = {
    apiMethod: ApiMethod.POST,
    applicationTime: new Date().getTime() - start.getTime(),
    databaseTime,
    endpointUrl: `/stock${req.path}`,
    requestId,
  };

  createLog(ApiLog, "marketLog");
});
