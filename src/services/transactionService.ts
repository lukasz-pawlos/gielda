import { NextFunction, Request, Response } from "express";
import { TransactionD } from "../entities/TransactionEntitie";

export const allTransactionsService = async (req: Request, res: Response) => {
  const transactions = await TransactionD.find();
  if (transactions) return transactions;
};
