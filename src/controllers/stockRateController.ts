import { validationResult } from "express-validator";
import { AppError } from "../utils/appError";
import { TypedRequestBody } from "../utils/TypedRequestBody";
import { NextFunction, Request, Response } from "express";
import { StockRateRequest } from "../types/request/StockRateRequest";
import { createStockRateService, allActualStockRatesService } from "../services/stockRateService";
import { catchAsync } from "../utils/catchAsync";

export const allActualStockRates = catchAsync(async (req: Request, res: Response) => {
  const stockRates = await allActualStockRatesService();
  res.json({ stockRates });
});

export const createStockRate = catchAsync(
  async (req: TypedRequestBody<StockRateRequest>, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return next(new AppError("Validation errors", 400, errors.array()));
    }

    const result = await createStockRateService(req.body);
    res.json({ message: "Stock added", result });
  }
);
