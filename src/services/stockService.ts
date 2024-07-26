import { StockRequest } from "../dto/request/StockRequest";
import { Stock } from "../entities/StockEntities";
import { User } from "../entities/UsesEntitie";
import { Company } from "../entities/CompanyEntities";
import { AppError } from "../utils/appError";

export const createStockService = async (newStockData: StockRequest) => {
  const { companyId, userId, amount } = newStockData;

  const user = await User.findOne({ where: { id: userId } });
  const company = await Company.findOne({ where: { id: companyId } });

  if (!user || !company) {
    throw new AppError("User or Company not found", 404);
  }

  const newStock = Stock.save({
    user,
    company,
    amount,
  });

  return newStock;
};

export const getStockService = async (stockId: number) => {
  const stock = await Stock.findOne({ where: { id: stockId } });
  if (!stock) {
    throw new AppError("Stock not found", 404);
  }

  return stock;
};

export const getStockByUserIdService = async (userId: number) => {
  const user = await User.findOne({ where: { id: userId } });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const stock = await Stock.find({ where: { user } });

  if (!stock) {
    throw new AppError("Stock not found", 404);
  }

  return { stock, user };
};

export const updateStockByUserAndCompanyIdService = async (userId: number, companyId: number, amount: number) => {
  const stock = await Stock.findOne({
    where: { company: { id: companyId }, user: { id: userId } },
    relations: { user: true, company: true },
  });

  if (!stock) {
    await createStockService({ companyId, userId, amount });
    return;
  }

  stock.amount = +stock.amount + +amount;
  await stock.save();
};
