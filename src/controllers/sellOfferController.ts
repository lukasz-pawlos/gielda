import { NextFunction, Request, Response } from "express";
import { TypedRequestBody } from "../utils/TypedRequestBody";
import { validationResult } from "express-validator";
import { AppError } from "../utils/appError";
import { SellOfferRequest } from "../types/request/SellOfferRequest";
import { createSellOfferService, deleteSellOfferService, usersSellOfferService } from "../services/sellOfferService";
import { catchAsync } from "../utils/catchAsync";

export const createSellOffer = catchAsync(
  async (req: TypedRequestBody<SellOfferRequest>, res: Response, next: NextFunction) => {
    const error = validationResult(req);
    if (!error.isEmpty()) return next(new AppError("Validation errors", 400, error.array()));

    const result = await createSellOfferService(req.body);
    res.json({ message: "Sell offer added", result });
  }
);

export const deleteSellOffer = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const sellOfferId: any = req.params.id;
  await deleteSellOfferService(sellOfferId);
  res.status(200).json({ message: "Sell offer deleted successfully" });
});

export const usersSellOffer = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId: any = req.params.id;

  const sellOffers = await usersSellOfferService(userId);
  res.json({ sellOffers });
});
