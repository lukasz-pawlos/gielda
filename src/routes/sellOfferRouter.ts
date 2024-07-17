import { Router } from "express";
import { createSellOffer, deleteSellOffer, usersSellOffer } from "../controllers/sellOfferController";
import { createSellOfferValidation } from "../validations/sellOfferValidation";

export const sellOfferRouter = Router();

sellOfferRouter.get("/user/:id", usersSellOffer);
sellOfferRouter.post("/create", createSellOfferValidation, createSellOffer);
sellOfferRouter.post("/delete/:id", deleteSellOffer);
