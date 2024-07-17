import { NextFunction, Request, Response } from "express";
import { SellOfferRequest } from "../dto/request/SellOfferRequest";
import { TypedRequestBody } from "../utils/TypedRequestBody";
import { User } from "../entities/UsesEntitie";
import { Stock } from "../entities/StockEntities";
import { AppError } from "../utils/appError";
import { SellOffer } from "../entities/SellOfferEntitie";

export const createSellOfferService = async (
  req: TypedRequestBody<SellOfferRequest>,
  res: Response,
  next: NextFunction
) => {
  const { stockId, userId, min_price, start_amount, date_limit } = req.body;

  const user = await User.findOne({ where: { id: userId } });
  const stock = await Stock.findOne({ where: { id: stockId } });

  if (!user || !stock) {
    return next(new AppError("User or Stock not found", 404));
  }

  const newSellOffer = await SellOffer.save({
    user,
    stock,
    min_price,
    start_amount,
    actual: true,
    date_limit,
  });

  return newSellOffer;
};

export const deleteSellOfferService = async (req: Request, res: Response, next: NextFunction) => {
  const id: any = req.params.id;

  const sellOffer = await SellOffer.findOne({ where: { id } });
  if (!sellOffer) {
    return next(new AppError("Buy offer not found", 404));
  }

  await SellOffer.delete({ id });
  res.status(200).json({ message: "Sell offer deleted successfully" });
};

export const usersSellOfferService = async (req: Request, res: Response, next: NextFunction) => {
  const id: any = req.params.id;

  const user = await User.findOne({ where: { id } });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const sellOffers = await SellOffer.find({ where: { user } });

  return sellOffers;
};
