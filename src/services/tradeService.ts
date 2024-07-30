import { getCompanysIdServices } from "./companyService";
import {
  buyOffersToTradeService,
  isBuyOfferExistService,
  removeExpiredBuyOffersService,
  updateBuyOfferService,
} from "./buyOfferService";
import {
  isSellOfferExistService,
  removeExpiredSellOffersService,
  sellOffersToTradeService,
  updateSellOfferService,
} from "./sellOfferService";
import { TransactionRequest } from "../dto/request/TransactionRequest";
import { createTransactionService } from "./transactionService";
import { BuyOfferRes } from "../dto/response/BuyOfferRes";
import { SellOfferRes } from "../dto/response/SellOfferRes";
import { User } from "../entities/UsesEntitie";
import { updateStockRateByCompanyIdService } from "./stockRateService";
import { updateStockByUserAndCompanyIdService } from "./stockService";
import { getUserService, updateUserService } from "./userService";

let buyOffers: [BuyOfferRes[]] = [[]];
let sellOffers: [SellOfferRes[]] = [[]];

export const trade = async () => {
  console.log("START");
  console.log("Get Companys");
  const companysIds = await getCompanysIdServices();
  console.log("Get Companys DONE");

  for (const companyId of companysIds) {
    await removeExpiredBuyOffersService(companyId);
    await removeExpiredSellOffersService(companyId);

    console.log("Get Offers");
    await updateData(companyId);
    console.log("Get Offers DONE");

    if (!buyOffers[companyId].length || !sellOffers[companyId].length) continue;

    console.log("START TREADING");
    await startTrade(buyOffers[companyId], sellOffers[companyId], companyId);

    buyOffers[companyId] = clearDoneOffers(buyOffers[companyId]);
    sellOffers[companyId] = clearDoneOffers(sellOffers[companyId]);
  }

  console.log("Trade cycle complete. Scheduling next run.");
  setTimeout(trade, 2 * 1000);
};

const updateData = async (companyId: number) => {
  const skipBuyIds: number[] = [];
  const skipSellIds: number[] = [];
  if (buyOffers[companyId] === undefined && sellOffers[companyId] === undefined) {
    buyOffers[companyId] = await buyOffersToTradeService(companyId, skipBuyIds);
    sellOffers[companyId] = await sellOffersToTradeService(companyId, skipSellIds);
  } else {
    const skipBuyIds: number[] = !buyOffers[companyId].length ? [] : buyOffers[companyId].map((offer) => offer.id);
    const skipSellIds: number[] = !sellOffers[companyId].length ? [] : sellOffers[companyId].map((offer) => offer.id);

    buyOffers[companyId] = buyOffers[companyId].concat(await buyOffersToTradeService(companyId, skipBuyIds));
    sellOffers[companyId] = sellOffers[companyId].concat(await sellOffersToTradeService(companyId, skipSellIds));
  }
};

const startTrade = async (buyOffers: BuyOfferRes[], sellOffers: SellOfferRes[], companyId: number) => {
  let i = 0,
    j = 0;
  while (i < buyOffers.length && j < sellOffers.length) {
    if (+buyOffers[i].max_price < +sellOffers[j].min_price || buyOffers[i].userId === sellOffers[j].userId) {
      j++;
    } else {
      const amount = Math.min(buyOffers[i].amount, sellOffers[j].amount);
      if (amount === 0) {
        if (buyOffers[i].amount === 0) i++;
        if (sellOffers[j].amount === 0) j++;
        continue;
      }
      if (!(await isBuyOfferExistService(buyOffers[i].id))) buyOffers.splice(i, 1);
      if (!(await isSellOfferExistService(sellOffers[j].id))) sellOffers.splice(j, 1);

      const price = parseFloat(((+buyOffers[i].max_price + +sellOffers[j].min_price) / 2).toFixed(2));

      let buyer = await getUserService(buyOffers[i].userId);
      let seller = await getUserService(sellOffers[i].userId);

      const newTransaction: TransactionRequest = {
        sellOffer: sellOffers[j],
        buyOffer: buyOffers[i],
        amount,
        price,
        transactionData: new Date(),
      };

      console.log("Create Transactions");
      await createTransactionService(newTransaction);
      console.log("Create Transactions DONE");

      buyOffers[i].amount -= amount;
      sellOffers[j].amount -= amount;

      buyOffers[i].actual = buyOffers[i].amount !== 0;
      sellOffers[j].actual = sellOffers[j].amount !== 0;

      console.log("Update StockRate");
      await updateStockRateByCompanyIdService({ companyId, rate: price });
      console.log("Update StockRate DONE");

      console.log("Update offer");
      await updateBuyOfferService(buyOffers[i]);
      await updateSellOfferService(sellOffers[j]);
      console.log("Update offer DONE");

      ({ buyer, seller } = manageMoney(buyOffers[i], amount, price, buyer, seller));
      console.log("Update User");
      await updateUserService(buyer);
      await updateUserService(seller);
      console.log("Update User DONE");

      console.log("Update Stock");
      await updateStockByUserAndCompanyIdService(buyOffers[i].userId, companyId, amount);
      console.log("Update Stock DONE");

      if (buyOffers[i].amount === 0) i++;
      if (sellOffers[j].amount === 0) j++;
    }
  }
};

const clearDoneOffers = <T extends { actual: boolean }>(offers: T[]): T[] => {
  return offers.filter((offer) => offer.actual !== false);
};

const manageMoney = (buyOffer: BuyOfferRes, amount: number, price: number, buyer: User, seller: User) => {
  const amountN = Number(amount);
  const maxPrice = Number(buyOffer.max_price);
  const priceN = Number(price);
  const buyerMoney = Number(buyer.money);
  const sellerMoney = Number(seller.money);

  const buyerCost = amountN * maxPrice;
  buyer.money = buyerMoney + buyerCost - amountN * priceN;
  seller.money = sellerMoney + amountN * priceN;

  return { buyer, seller };
};
