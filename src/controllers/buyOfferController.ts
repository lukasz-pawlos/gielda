import { NextFunction, Request, Response } from "express";
import { TypedRequestBody } from "../utils/TypedRequestBody";
import { BuyOfferRequest } from "../types/request/BuyOfferRequest";
import { validationResult } from "express-validator";
import { AppError } from "../utils/appError";
import { createBuyOfferService, deleteBuyOfferService, usersBuyOfferService } from "../services/buyOfferService";
import { catchAsync } from "../utils/catchAsync";
import { APILog, createLog } from "../utils/logger/createlog";

export const createBuyOffer = catchAsync(
  async (req: TypedRequestBody<BuyOfferRequest>, res: Response, next: NextFunction) => {
    const start = new Date();
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return next(new AppError("Validation  errors", 400, error.array()));
    }
    const { result, databaseTime } = await createBuyOfferService(req.body);
    const end = new Date();

    res.json({ message: "Buy offer added", result });

    const ApiLog: APILog = {
      apiMethod: "POST",
      apiTime: end.getTime() - start.getTime(),
      applicationTime: new Date().getTime() - start.getTime(),
      databaseTime,
      endpointUrl: `/buyoffer${req.path}`,
    };

    createLog(ApiLog, "apiUse.csv");
  }
);

export const deleteBuyOffer = catchAsync(async (req: Request, res: Response) => {
  const start = new Date();
  const buyOfferId: any = req.params.id;

  const databaseTime = await deleteBuyOfferService(buyOfferId);
  const end = new Date();

  res.status(200).json({ message: "Buy offer deleted successfully" });

  const ApiLog: APILog = {
    apiMethod: "DELETE",
    apiTime: end.getTime() - start.getTime(),
    applicationTime: new Date().getTime() - start.getTime(),
    databaseTime,
    endpointUrl: `/buyoffer${req.path}`,
  };

  createLog(ApiLog, "apiUse.csv");
});

export const usersBuyOffer = catchAsync(async (req: Request, res: Response) => {
  const start = new Date();
  const userId: any = req.params.id;

  const { result, databaseTime } = await usersBuyOfferService(userId);
  const end = new Date();

  res.json({ result });

  const ApiLog: APILog = {
    apiMethod: "GET",
    apiTime: end.getTime() - start.getTime(),
    applicationTime: new Date().getTime() - start.getTime(),
    databaseTime,
    endpointUrl: `/buyoffer${req.path}`,
  };

  createLog(ApiLog, "apiUse.csv");
});
