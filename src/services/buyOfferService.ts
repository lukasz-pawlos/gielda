import { NextFunction, Request, Response } from "express";
import { User } from "../entities/UsesEntitie";
import { AppError } from "../utils/appError";
import { TypedRequestBody } from "../utils/TypedRequestBody";
import { BuyOfferRequest } from "../dto/request/BuyOfferRequest";
import { Company } from "../entities/CompanyEntities";
import { BuyOffer } from "../entities/BuyOfferEntitie";
import { BuyOfferRes } from "../dto/response/BuyOfferRes";
import { In, Not } from "typeorm";

export const createBuyOfferService = async (newBuyOfferData: BuyOfferRequest) => {
  const { companyId, userId, max_price, amount, date_limit } = newBuyOfferData;

  const user = await User.findOne({ where: { id: userId } });
  const company = await Company.findOne({ where: { id: companyId } });

  if (!user || !company) {
    throw new AppError("User or Company not found", 404);
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

export const deleteBuyOfferService = async (buyOfferId: number) => {
  const buyOffer = await BuyOffer.findOne({ where: { id: buyOfferId } });
  if (!buyOffer) {
    throw new AppError("Delete offer not found", 404);
  }

  await BuyOffer.delete({ id: buyOfferId });
};

export const usersBuyOfferService = async (userId: number) => {
  const user = await User.findOne({ where: { id: userId } });

  if (!user) {
    throw new AppError("User not found", 404);
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
