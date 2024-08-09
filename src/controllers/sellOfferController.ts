import { NextFunction, Request, Response } from "express";
import { TypedRequestBody } from "../utils/TypedRequestBody";
import { validationResult } from "express-validator";
import { AppError } from "../utils/appError";
import { SellOfferRequest } from "../types/request/SellOfferRequest";
import { createSellOfferService, deleteSellOfferService, usersSellOfferService } from "../services/sellOfferService";
import { catchAsync } from "../utils/catchAsync";
import { APILog, createLog } from "../utils/logger/createlog";

export const createSellOffer = catchAsync(
  async (req: TypedRequestBody<SellOfferRequest>, res: Response, next: NextFunction) => {
    const start = new Date();
    const error = validationResult(req);
    if (!error.isEmpty()) return next(new AppError("Validation errors", 400, error.array()));

    const { result, databaseTime } = await createSellOfferService(req.body);
    const end = new Date();

    res.json({ message: "Sell offer added", result });

    const ApiLog: APILog = {
      apiMethod: "POST",
      apiTime: end.getTime() - start.getTime(),
      applicationTime: new Date().getTime() - start.getTime(),
      databaseTime,
      endpointUrl: `/selloffer${req.path}`,
    };

    createLog(ApiLog, "apiUse.csv");
  }
);

export const deleteSellOffer = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const start = new Date();
  const sellOfferId: any = req.params.id;
  const databaseTime = await deleteSellOfferService(sellOfferId);
  const end = new Date();

  res.status(200).json({ message: "Sell offer deleted successfully" });

  const ApiLog: APILog = {
    apiMethod: "DELETE",
    apiTime: end.getTime() - start.getTime(),
    applicationTime: new Date().getTime() - start.getTime(),
    databaseTime,
    endpointUrl: `/selloffer${req.path}`,
  };

  createLog(ApiLog, "apiUse.csv");
});

export const usersSellOffer = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const start = new Date();
  const userId: any = req.params.id;

  const { result, databaseTime } = await usersSellOfferService(userId);
  const end = new Date();

  res.json({ result });

  const ApiLog: APILog = {
    apiMethod: "GET",
    apiTime: end.getTime() - start.getTime(),
    applicationTime: new Date().getTime() - start.getTime(),
    databaseTime,
    endpointUrl: `/selloffer${req.path}`,
  };

  createLog(ApiLog, "apiUse.csv");
});
