import { Request, Response } from "express";
import { allTransactionsService } from "../services/transactionService";

export const allTransactions = async (req: Request, res: Response) => {
  const transactions = await allTransactionsService(req, res);
  res.json({ transactions });
};
