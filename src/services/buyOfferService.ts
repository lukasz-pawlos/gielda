import { NextFunction, Request, Response } from "express";
import { User } from "../entities/UsesEntitie";
import { AppError } from "../utils/appError";
import { TypedRequestBody } from "../utils/TypedRequestBody";
import { BuyOfferRequest } from "../dto/request/BuyOfferRequest";
import { Company } from "../entities/CompanyEntities";
import { BuyOffer } from "../entities/BuyOfferEntitie";
import { BuyOfferRes } from "../dto/response/BuyOfferRes";
import { In, Not } from "typeorm";

export const createBuyOfferService = async (
  req: TypedRequestBody<BuyOfferRequest>,
  res: Response,
  next: NextFunction
) => {
  const { companyId, userId, max_price, amount, date_limit } = req.body;

  const user = await User.findOne({ where: { id: userId } });
  const company = await Company.findOne({ where: { id: companyId } });

  if (!user || !company) {
    return next(new AppError("User or Company not found", 404));
  }

  const newBuyOffer = await BuyOffer.save({
    user,
    company,
    max_price,
    amount,
    start_amount: amount,
    actual: true,
    date_limit,
  });

  return newBuyOffer;
};

export const deleteBuyOfferService = async (req: Request, res: Response, next: NextFunction) => {
  const id: any = req.params.id;

  const buyOffer = await BuyOffer.findOne({ where: { id } });
  if (!buyOffer) {
    return next(new AppError("Delete offer not found", 404));
  }

  await BuyOffer.delete({ id });
  res.status(200).json({ message: "Sell offer deleted successfully" });
};

export const usersBuyOfferService = async (req: Request, res: Response, next: NextFunction) => {
  const id: any = req.params.id;

  const user = await User.findOne({ where: { id } });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const buyOffers = await BuyOffer.find({ where: { user } });

  return buyOffers;
};

export const companysBuyOfferService = async (
  companyId: number,
  skipIds: number[],
  recordsNumber: number = 100
): Promise<BuyOfferRes[]> => {
  const buyOffers = await BuyOffer.find({
    where: { actual: true, company: { id: companyId }, id: Not(In(skipIds)) },
    order: { id: "ASC", max_price: "ASC" },
    take: recordsNumber,
  });

  if (!buyOffers) {
    throw new AppError("BuyOffers not found", 404);
  }

  return buyOffers;
};

export const updateBuyOfferService = async (buyOffer: any) => {
  await BuyOffer.save(buyOffer);
};
