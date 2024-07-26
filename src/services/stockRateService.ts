import { StockRateRequest } from "../dto/request/StockRateRequest";
import { Company } from "../entities/CompanyEntities";
import { AppError } from "../utils/appError";
import { StockRate } from "../entities/StockRateEntitie";

export const allActualStockRatesService = async () => {
  const stockRates = await StockRate.find({ where: { actual: true } });

  return stockRates;
};

export const createStockRateService = async (newStockRateDate: StockRateRequest) => {
  const { companyId, rate } = newStockRateDate;

  const company = await Company.findOne({ where: { id: companyId } });

  if (!company) {
    throw new AppError("Company not found", 404);
  }

  const newStockRate = StockRate.create({
    company,
    date_inc: new Date().toJSON(),
    actual: true,
    rate,
  });

  return newStockRate.save();
};

export const updateStockRateByCompanyIdService = async (stockRateDate: StockRateRequest) => {
  const { companyId, rate } = stockRateDate;

  const company = await Company.findOne({ where: { id: companyId } });

  if (!company) {
    throw new AppError("Company not found", 404);
  }

  await StockRate.update({ company, actual: true }, { actual: false });

  const newStockRate = StockRate.create({
    company,
    date_inc: new Date().toISOString(),
    actual: true,
    rate,
  });

  return newStockRate.save();
};
