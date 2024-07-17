import { check } from "express-validator";
import { validateAllowedFields } from "../utils/typeValidation";

const allowedFields = ["stockId", "userId", "min_price", "start_amount", "date_limit"];

export const createSellOfferValidation = [
  validateAllowedFields(allowedFields),
  check("stockId").exists().withMessage("add companyId").isInt().withMessage("Is not int"),
  check("userId").exists().withMessage("add companyId").isInt().withMessage("Is not int"),
  check("min_price").exists().withMessage("add rate").isDecimal().withMessage("Is not decimal"),
  check("start_amount").exists().withMessage("add companyId").isInt().withMessage("Is not int"),
  check("date_limit").exists().withMessage("add companyId").isISO8601().withMessage("Is not date"),
];
