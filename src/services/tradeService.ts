import { NextFunction, Request, Response } from "express";

import { getCompanysIdServices } from "./companyService";
import { companysBuyOfferService, updateBuyOfferService } from "./buyOfferService";
import { companysSellOfferService, updateSellOfferService } from "./sellOfferService";
import { TransactionRequest } from "../dto/request/TransactionRequest";
import { createTransactionService } from "./transactionService";
import { BuyOfferRes } from "../dto/response/BuyOfferRes";
import { SellOfferRes } from "../dto/response/SellOfferRes";

let buyOffers: [BuyOfferRes[]] = [[]];
let sellOffers: [SellOfferRes[]] = [[]];

export const trade = async () => {
  console.log("START");
  const companysIds = await getCompanysIdServices();

  console.log("Start treading Offers");
  for (const companyId of companysIds) {
    await updateData(companyId);

    console.log("Get Offers DONE");

    if (!buyOffers[companyId].length || !sellOffers[companyId].length) continue;

    for (let buyOffer of buyOffers[companyId]) {
      // console.log(buyOffer.max_price < sellOffers[companyId][sellOffers[companyId].length - 1].min_price);
      // if (buyOffer.max_price < sellOffers[companyId][sellOffers[companyId].length - 1].min_price) continue;

      for (let sellOffer of sellOffers[companyId]) {
        if (buyOffer.max_price < sellOffer.min_price) {
          continue;
        }
        const amount = Math.min(buyOffer.amount, sellOffer.amount);
        const price = (+buyOffer.max_price + +sellOffer.min_price) / 2;
        console.log("Create Transactions");
        const newTransaction: TransactionRequest = {
          sellOffer: sellOffer,
          buyOffer: buyOffer,
          amount,
          price,
          transactionData: new Date(),
        };

        await createTransactionService(newTransaction);
        console.log("Create Transactions DONE");

        buyOffer.amount -= amount;
        sellOffer.amount -= amount;

        if (buyOffer.amount === 0) {
          buyOffer.actual = false;
        }

        if (sellOffer.amount === 0) {
          sellOffer.actual = false;
        }

        console.log("Update data in DB");
        await updateSellOfferService(sellOffer);
        // TODO update stock, user.monye, create new table,
        // sellOfferHistory (on create sellOfera create the same in history,
        // and if amount === 0, set actual to false)
        await updateBuyOfferService(buyOffer);
        // TODO update stock_rate
        // sellOfferBuy (on create buyOfera create the same in history,
        // and if amount === 0, set actual to false)
        console.log("Update data in DB");
        if (buyOffer.amount === 0) break;
      }
    }

    // Clear done transaction from array
    buyOffers[companyId] = clearDoneOffers(buyOffers[companyId]);
    sellOffers[companyId] = clearDoneOffers(sellOffers[companyId]);
  }
};

const updateData = async (companyId: number) => {
  const skipBuyIds: number[] = [];
  const skipSellIds: number[] = [];
  if (buyOffers[companyId] === undefined && sellOffers[companyId] === undefined) {
    buyOffers[companyId] = await companysBuyOfferService(companyId, skipBuyIds);
    sellOffers[companyId] = await companysSellOfferService(companyId, skipSellIds);
  } else {
    const skipBuyIds: number[] = !buyOffers[companyId].length ? [] : buyOffers[companyId].map((offer) => offer.id);
    const skipSellIds: number[] = !sellOffers[companyId].length ? [] : sellOffers[companyId].map((offer) => offer.id);

    console.log("Get Offers");
    buyOffers[companyId] = buyOffers[companyId].concat(await companysBuyOfferService(companyId, skipBuyIds));
    sellOffers[companyId] = sellOffers[companyId].concat(await companysSellOfferService(companyId, skipSellIds));
  }
};

const clearDoneOffers = <T extends { actual: boolean }>(offers: T[]): T[] => {
  return offers.filter((offer) => offer.actual !== false);
};
