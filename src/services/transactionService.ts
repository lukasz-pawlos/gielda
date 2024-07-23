import { NextFunction, Request, Response } from "express";
import { TransactionD } from "../entities/TransactionEntitie";
import { TransactionRequest } from "../dto/request/TransactionRequest";

export const allTransactionsService = async (req: Request, res: Response) => {
  const transactions = await TransactionD.find();
  if (transactions) return transactions;
};

export const createTransactionService = async (req: TransactionRequest) => {
  const { sellOffer, buyOffer, amount, price, transactionData } = req;
  TransactionD.save({ sellOffer, buyOffer, amount, price, transactionData });
};
