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
import { TransactionRequest } from "../types/request/TransactionRequest";
import { createTransactionService } from "./transactionService";
import { BuyOfferRes } from "../types/response/BuyOfferRes";
import { SellOfferRes } from "../types/response/SellOfferRes";
import { updateStockRateByCompanyIdService } from "./stockRateService";
import { updateStockByUserAndCompanyIdService } from "./stockService";
import { updateUserMoney } from "./userService";
import { getCache, removeCache, setCache } from "../utils/useCache";
import dotenv from "dotenv";
import { createLog, TradeLog } from "../utils/logger/createlog";

dotenv.config({ path: `${process.cwd()}/./.env` });

const BUY_OFFERS_KEY = "buyOffers";
const SELL_OFFERS_KEY = "sellOffers";
const SIZE_COMPANY_CACHE = Number(process.env.CASHE_TIME);
let companiesIds: number[] = [];

export const trade = async () => {
  if (process.env.COMPANIES_IDS) {
    companiesIds = process.env.COMPANIES_IDS.split(",").map((id) => Number(id));
    if (companiesIds.some(isNaN)) {
      console.error("Some COMPANY_ID values are not valid numbers");
      companiesIds = [];
    }
  }

  for (const companyId of companiesIds) {
    await removeExpiredBuyOffersService(companyId);
    await removeExpiredSellOffersService(companyId);

    await updateData(companyId);

    const buyOffers = getCache<BuyOfferRes>(`${BUY_OFFERS_KEY}-${companyId}`);
    const sellOffers = getCache<SellOfferRes>(`${SELL_OFFERS_KEY}-${companyId}`);

    if (!buyOffers.length || !sellOffers.length) continue;

    await startTrade(buyOffers, sellOffers, companyId);
  }

  setTimeout(trade, 2 * 1000);
};

export const updateData = async (companyId: number) => {
  const buyOffers = getCache<BuyOfferRes>(`${BUY_OFFERS_KEY}-${companyId}`);
  const sellOffers = getCache<SellOfferRes>(`${SELL_OFFERS_KEY}-${companyId}`);

  const skipBuyIds = buyOffers.map((offer) => offer.id);
  const skipSellIds = sellOffers.map((offer) => offer.id);

  const newBuyOffers = await buyOffersToTradeService(companyId, skipBuyIds, SIZE_COMPANY_CACHE - skipBuyIds.length);
  const newSellOffers = await sellOffersToTradeService(companyId, skipSellIds, SIZE_COMPANY_CACHE - skipSellIds.length);

  newBuyOffers.forEach((offer) => setCache(`${BUY_OFFERS_KEY}-${companyId}-${offer.id}`, offer));
  newSellOffers.forEach((offer) => setCache(`${SELL_OFFERS_KEY}-${companyId}-${offer.id}`, offer));
};

const startTrade = async (buyOffers: BuyOfferRes[], sellOffers: SellOfferRes[], companyId: number) => {
  let i = 0,
    j = 0;
  while (i < buyOffers.length && j < sellOffers.length) {
    if (+buyOffers[i].max_price < +sellOffers[j].min_price || buyOffers[i].userId === sellOffers[j].userId) {
      j++;
    } else {
      const start = new Date();

      const amount = Math.min(buyOffers[i].amount, sellOffers[j].amount);
      if (amount === 0) {
        if (buyOffers[i].amount === 0) i++;
        if (sellOffers[j].amount === 0) j++;
        continue;
      }
      if (!(await isBuyOfferExistService(buyOffers[i].id))) buyOffers.splice(i, 1);
      if (!(await isSellOfferExistService(sellOffers[j].id))) sellOffers.splice(j, 1);

      const price = parseFloat(((+buyOffers[i].max_price + +sellOffers[j].min_price) / 2).toFixed(2));

      const newTransaction: TransactionRequest = {
        sellOffer: sellOffers[j],
        buyOffer: buyOffers[i],
        amount,
        price,
        transactionData: new Date(),
      };

      await createTransactionService(newTransaction);

      buyOffers[i].amount = Number(buyOffers[i].amount) - Number(amount);
      sellOffers[j].amount = Number(sellOffers[j].amount) - Number(amount);

      buyOffers[i].actual = buyOffers[i].amount !== 0;
      sellOffers[j].actual = sellOffers[j].amount !== 0;

      setCache(`${BUY_OFFERS_KEY}-${companyId}-${buyOffers[i].id}`, buyOffers[i]);
      setCache(`${SELL_OFFERS_KEY}-${companyId}-${sellOffers[j].id}`, sellOffers[j]);

      await updateStockRateByCompanyIdService({ companyId, rate: price });

      await updateBuyOfferService(buyOffers[i]);
      await updateSellOfferService(sellOffers[j]);

      await manageMoney(buyOffers[i], amount, price, buyOffers[i].userId, sellOffers[i].userId);

      await updateStockByUserAndCompanyIdService(buyOffers[i].userId, companyId, amount);

      if (buyOffers[i].amount === 0) {
        removeCache(`${BUY_OFFERS_KEY}-${companyId}-${buyOffers[i].id}`);
        i++;
      }
      if (sellOffers[j].amount === 0) {
        removeCache(`${SELL_OFFERS_KEY}-${companyId}-${buyOffers[j].id}`);
        j++;
      }

      const end = new Date();

      // const message:TradeLog = {
      //   applicationTime: 8,
      //   databaseTime: 8,
      //   numberOfSellOffers: 8,
      //   numberOfBuyOffers: 8,
      // }
      // await createLog();
    }
  }
};

const clearDoneOffers = <T extends { actual: boolean }>(offers: T[]): T[] => {
  return offers.filter((offer) => offer.actual !== false);
};

const manageMoney = async (buyOffer: BuyOfferRes, amount: number, price: number, bayerId: number, sellerId: number) => {
  const amountN = Number(amount);
  const maxPrice = Number(buyOffer.max_price);
  const priceN = Number(price);

  const buyerCost = amountN * maxPrice;
  const buyerMoney = buyerCost - amountN * priceN;
  const sellerMoney = amountN * priceN;

  await updateUserMoney(bayerId, buyerMoney);
  await updateUserMoney(sellerId, sellerMoney);
};
