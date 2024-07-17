import { Router } from "express";
import { createStockRateValidation } from "../validations/stockRateValidation";
import { createStockRate, allStockRates } from "../controllers/stockRateController";

export const stockRateRouter = Router();

stockRateRouter.post("/create", createStockRateValidation, createStockRate);
stockRateRouter.get("/all", allStockRates);
