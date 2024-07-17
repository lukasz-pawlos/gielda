import { NextFunction, Request, Response } from "express";
import { TypedRequestBody } from "../utils/TypedRequestBody";
import { StockRequest } from "../dto/request/StockRequest";
import { Stock } from "../entities/StockEntities";
import { User } from "../entities/UsesEntitie";
import { Company } from "../entities/CompanyEntities";
import { AppError } from "../utils/appError";

export const createStockService = async (req: TypedRequestBody<StockRequest>, res: Response, next: NextFunction) => {
  const { companyId, userId, amount } = req.body;

  const user = await User.findOne({ where: { id: userId } });
  const company = await Company.findOne({ where: { id: companyId } });

  if (!user || !company) {
    return next(new AppError("User or Company not found", 404));
  }

  const newStock = Stock.save({
    user,
    company,
    amount,
  });

  return newStock;
};

export const getStockService = async (req: Request, res: Response, next: NextFunction) => {
  const id: any = req.params.id;

  const stock = await Stock.findOne({ where: { id } });
  if (!stock) {
    next(new AppError("Stock not found", 404));
  }

  return stock;
};

export const getStockByUserIdService = async (req: Request, res: Response, next: NextFunction) => {
  const id: any = req.params.id;

  const user = await User.findOne({ where: { id } });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const stock = await Stock.find({ where: { user } });

  if (!stock) {
    next(new AppError("Stock not found", 404));
  }

  return { stock, user };
};
