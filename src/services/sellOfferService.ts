import { SellOfferRequest } from "../dto/request/SellOfferRequest";
import { User } from "../entities/UsesEntitie";
import { Stock } from "../entities/StockEntities";
import { AppError } from "../utils/appError";
import { SellOffer } from "../entities/SellOfferEntitie";
import { Company } from "../entities/CompanyEntities";
import { In, Not } from "typeorm";
import { SellOfferRes } from "../dto/response/SellOfferRes";

export const createSellOfferService = async (newSellOfferData: SellOfferRequest) => {
  const { stockId, userId, min_price, amount, date_limit } = newSellOfferData;

  const user = await User.findOne({ where: { id: userId } });
  const stock = await Stock.findOne({ where: { id: stockId } });

  if (!user || !stock) {
    throw new AppError("User or Stock not found", 404);
  }

  const newSellOffer = await SellOffer.save({
    user,
    stock,
    min_price,
    amount,
    start_amount: amount,
    actual: true,
    date_limit,
  });

  return newSellOffer;
};

export const deleteSellOfferService = async (sellOfferId: number) => {
  const sellOffer = await SellOffer.findOne({ where: { id: sellOfferId } });
  if (!sellOffer) {
    throw new AppError("Buy offer not found", 404);
  }

  await SellOffer.delete({ id: sellOfferId });
};

export const usersSellOfferService = async (userId: number) => {
  const user = await User.findOne({ where: { id: userId } });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const sellOffers = await SellOffer.find({ where: { user } });

  return sellOffers;
};

export const companysSellOfferService = async (
  companyId: number,
  skipIds: number[],
  recordsNumber: number = 100
): Promise<SellOfferRes[]> => {
  const company = await SellOffer.find({
    where: {
      actual: true,
      stock: { company: { id: companyId } },
      id: Not(In(skipIds)),
    },
    order: { id: "ASC", min_price: "ASC" },
    take: recordsNumber,
  });

  if (!company) {
    throw new AppError("Offers not found", 404);
  }

  return company;
};

export const updateSellOfferService = async (sellOffer: any) => {
  await SellOffer.save(sellOffer);
};
