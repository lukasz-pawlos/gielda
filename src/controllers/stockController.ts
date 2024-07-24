import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { AppError } from "../utils/appError";
import { TypedRequestBody } from "../utils/TypedRequestBody";
import { createStockService, getStockByUserIdService, getStockService } from "../services/stockService";
import { StockRequest } from "../dto/request/StockRequest";
import { catchAsync } from "../utils/catchAsync";

export const createStock = catchAsync(
  async (req: TypedRequestBody<StockRequest>, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) return next(new AppError("Validation errors", 400, errors.array()));

    const result = await createStockService(req.body);
    res.json({ message: "Stock added", result });
  }
);

export const getStock = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const stockId: any = req.params.id;
  const stock = await getStockService(stockId);
  res.json(stock);
});

export const getStockByUserId = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId: any = req.params.id;

  const { stock } = await getStockByUserIdService(userId);
  res.json(stock);
});
