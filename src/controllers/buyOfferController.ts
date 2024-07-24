import { NextFunction, Request, Response } from "express";
import { TypedRequestBody } from "../utils/TypedRequestBody";
import { BuyOfferRequest } from "../dto/request/BuyOfferRequest";
import { validationResult } from "express-validator";
import { AppError } from "../utils/appError";
import { createBuyOfferService, deleteBuyOfferService, usersBuyOfferService } from "../services/buyOfferService";
import { catchAsync } from "../utils/catchAsync";

export const createBuyOffer = catchAsync(
  async (req: TypedRequestBody<BuyOfferRequest>, res: Response, next: NextFunction) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return next(new AppError("Validation  errors", 400, error.array()));
    }
    const result = await createBuyOfferService(req.body);
    res.json({ message: "Buy offer added", result });
  }
);

export const deleteBuyOffer = catchAsync(async (req: Request, res: Response) => {
  const buyOfferId: any = req.params.id;

  await deleteBuyOfferService(buyOfferId);

  res.status(200).json({ message: "Buy offer deleted successfully" });
});

export const usersBuyOffer = catchAsync(async (req: Request, res: Response) => {
  const userId: any = req.params.id;

  const buyOffers = await usersBuyOfferService(userId);
  res.json({ buyOffers });
});
