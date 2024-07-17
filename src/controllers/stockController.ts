import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { AppError } from "../utils/appError";
import { TypedRequestBody } from "../utils/TypedRequestBody";
import { createStockService, getStockByUserIdService, getStockService } from "../services/stockService";
import { StockRequest } from "../dto/request/StockRequest";

export const createStock = async (req: TypedRequestBody<StockRequest>, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) return next(new AppError("Validation errors", 400, errors.array()));

  const result = await createStockService(req, res, next);
  res.json({ message: "Stock added", result });
};

export const getStock = async (req: Request, res: Response, next: NextFunction) => {
  const stock = await getStockService(req, res, next);
  res.json(stock);
};

export const getStockByUserId = async (req: Request, res: Response, next: NextFunction) => {
  const stock = await getStockByUserIdService(req, res, next);
  res.json(stock);
};
