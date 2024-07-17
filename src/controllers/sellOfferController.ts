import { NextFunction, Request, Response } from "express";
import { TypedRequestBody } from "../utils/TypedRequestBody";
import { validationResult } from "express-validator";
import { AppError } from "../utils/appError";
import { SellOfferRequest } from "../dto/request/SellOfferRequest";
import { createSellOfferService, usersSellOfferService } from "../services/sellOfferService";
import { deleteBuyOfferService } from "../services/buyOfferService";

export const createSellOffer = async (req: TypedRequestBody<SellOfferRequest>, res: Response, next: NextFunction) => {
  const error = validationResult(req);
  if (!error.isEmpty()) return next(new AppError("Validation errors", 400, error.array()));

  const result = await createSellOfferService(req, res, next);
  res.json({ message: "Sell offer added", result });
};

export const deleteSellOffer = async (req: Request, res: Response, next: NextFunction) => {
  await deleteBuyOfferService(req, res, next);
};

export const usersSellOffer = async (req: Request, res: Response, next: NextFunction) => {
  const sellOffers = await usersSellOfferService(req, res, next);
  res.json({ sellOffers });
};
