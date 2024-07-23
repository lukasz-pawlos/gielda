import { NextFunction, Request, Response } from "express";
import { TypedRequestBody } from "../utils/TypedRequestBody";
import { BuyOfferRequest } from "../dto/request/BuyOfferRequest";
import { validationResult } from "express-validator";
import { AppError } from "../utils/appError";
import {
  companysBuyOfferService,
  createBuyOfferService,
  deleteBuyOfferService,
  usersBuyOfferService,
} from "../services/buyOfferService";

export const createBuyOffer = async (req: TypedRequestBody<BuyOfferRequest>, res: Response, next: NextFunction) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(new AppError("Validation  errors", 400, error.array()));
  }
  const result = await createBuyOfferService(req, res, next);
  res.json({ message: "Buy offer added", result });
};

export const deleteBuyOffer = async (req: Request, res: Response, next: NextFunction) => {
  await deleteBuyOfferService(req, res, next);
};

export const usersBuyOffer = async (req: Request, res: Response, next: NextFunction) => {
  const buyOffers = await usersBuyOfferService(req, res, next);
  res.json({ buyOffers });
};
