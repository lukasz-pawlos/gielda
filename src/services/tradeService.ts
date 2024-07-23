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

  console.log("Get treading Offers");
  for (const companyId of companysIds) {
    await updateData(companyId);

    console.log("Get Offers DONE");

    if (!buyOffers[companyId].length || !sellOffers[companyId].length) continue;

    console.log("START TREADING");
    await startTrade(buyOffers[companyId], sellOffers[companyId]);

    // Clear done transaction from array
    buyOffers[companyId] = clearDoneOffers(buyOffers[companyId]);
    sellOffers[companyId] = clearDoneOffers(sellOffers[companyId]);
  }

  console.log("Trade cycle complete. Scheduling next run.");
  setTimeout(trade, 5 * 1000); // Trade again after 5 s
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
    console.log(buyOffers[companyId].length);
    buyOffers[companyId] = buyOffers[companyId].concat(await companysBuyOfferService(companyId, skipBuyIds));
    sellOffers[companyId] = sellOffers[companyId].concat(await companysSellOfferService(companyId, skipSellIds));
    console.log(buyOffers[companyId].length);
  }
};

const startTrade = async (buyOffers: BuyOfferRes[], sellOffers: SellOfferRes[]) => {
  let i = 0,
    j = 0;
  while (i < buyOffers.length && j < sellOffers.length) {
    if (+buyOffers[i].max_price < +sellOffers[j].min_price) {
      j++;
    } else {
      const amount = Math.min(buyOffers[i].amount, sellOffers[j].amount);
      if (amount === 0) {
        if (buyOffers[i].amount === 0) i++;
        if (sellOffers[j].amount === 0) j++;
        continue;
      }
      const price = parseFloat(((+buyOffers[i].max_price + +sellOffers[j].min_price) / 2).toFixed(2));

      console.log("Create Transactions");

      const newTransaction: TransactionRequest = {
        sellOffer: sellOffers[j],
        buyOffer: buyOffers[i],
        amount,
        price,
        transactionData: new Date(),
      };

      await createTransactionService(newTransaction);

      buyOffers[i].amount -= amount;
      sellOffers[j].amount -= amount;

      buyOffers[i].actual = buyOffers[i].amount !== 0;
      sellOffers[j].actual = sellOffers[j].amount !== 0;

      await updateBuyOfferService(buyOffers[i]);
      await updateSellOfferService(sellOffers[j]);

      if (buyOffers[i].amount === 0) i++;
      if (sellOffers[j].amount === 0) j++;
    }
  }
};

const clearDoneOffers = <T extends { actual: boolean }>(offers: T[]): T[] => {
  return offers.filter((offer) => offer.actual !== false);
};
