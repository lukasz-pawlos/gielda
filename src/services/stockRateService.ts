import { NextFunction, Request, Response } from "express";
import { TypedRequestBody } from "../utils/TypedRequestBody";
import { StockRateRequest } from "../dto/request/StockRateRequest";
import { Company } from "../entities/CompanyEntities";
import { AppError } from "../utils/appError";
import { StockRate } from "../entities/StockRateEntitie";

export const allStockRatesService = async (req: Request, res: Response) => {
  const stockRates = await StockRate.find();

  return stockRates;
};

export const createStockRateService = async (
  req: TypedRequestBody<StockRateRequest>,
  res: Response,
  next: NextFunction
) => {
  const { companyId, rate } = req.body;

  const company = await Company.findOne({ where: { id: companyId } });

  if (!company) {
    return next(new AppError("Company not found", 404));
  }

  const newStockRate = StockRate.create({
    company,
    date_inc: new Date().toJSON(),
    actual: true,
    rate,
  });

  return newStockRate.save();
};
