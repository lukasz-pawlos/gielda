import { SellOfferRequest } from "../dto/request/SellOfferRequest";
import { User } from "../entities/UsesEntitie";
import { Stock } from "../entities/StockEntities";
import { AppError } from "../utils/appError";
import { SellOffer } from "../entities/SellOfferEntitie";
import { In, Not, Raw } from "typeorm";
import { SellOfferRes } from "../dto/response/SellOfferRes";

export const createSellOfferService = async (newSellOfferData: SellOfferRequest) => {
  const { companyId, userId, min_price, amount, date_limit } = newSellOfferData;

  const user = await User.findOne({ where: { id: userId } });
  const stock = await Stock.findOne({ where: { user: { id: userId }, company: { id: companyId } } });

  if (!user || !stock) {
    throw new AppError("User or Company not found", 404);
  }

  if (stock.amount - amount < 0) {
    throw new AppError("Not enough stock", 402);
  }

  stock.amount -= +amount;

  await stock.save();

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
  const sellOffer = await SellOffer.findOne({ where: { id: sellOfferId }, relations: { stock: true } });
  if (!sellOffer) {
    throw new AppError("Buy offer not found", 404);
  }

  sellOffer.stock.amount += sellOffer.amount;

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

export const sellOffersToTradeService = async (
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

export const removeExpiredSellOffersService = async (companyId: number) => {
  const expiredOffers = await SellOffer.find({
    where: { actual: true, date_limit: Raw((date) => `${date} < NOW()`), stock: { company: { id: companyId } } },
    relations: { stock: true },
  });

  if (expiredOffers.length > 0) {
    for (let i = 0; i < expiredOffers.length; i++) {
      console.log(expiredOffers[i].stock.amount);
      console.log(expiredOffers[i].amount);
      expiredOffers[i].stock.amount += expiredOffers[i].amount;
      expiredOffers[i].actual = false;
      console.log(expiredOffers[i].stock.amount);
      await expiredOffers[i].stock.save();
      await expiredOffers[i].save();
    }
  }
};

export const isSellOfferExistService = async (sellOfferId: number): Promise<boolean> => {
  const offer = await SellOffer.findOne({
    where: { id: sellOfferId },
  });

  return !!offer;
};
