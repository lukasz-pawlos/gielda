import { validationResult } from "express-validator";
import { AppError } from "../utils/appError";
import { TypedRequestBody } from "../utils/TypedRequestBody";
import { NextFunction, Request, Response } from "express";
import { StockRateRequest } from "../dto/request/StockRateRequest";
import { createStockRateService, allStockRatesService } from "../services/stockRateService";

export const allStockRates = async (req: Request, res: Response) => {
  const stockRates = await allStockRatesService(req, res);
  res.json({ stockRates });
};

export const createStockRate = async (req: TypedRequestBody<StockRateRequest>, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new AppError("Validation errors", 400, errors.array()));
  }

  const result = await createStockRateService(req, res, next);
  res.json({ message: "Stock added", result });
};
