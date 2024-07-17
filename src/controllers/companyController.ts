import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { AppError } from "../utils/appError";
import {
  createCompanyService,
  deleteCompanyService,
  findAllCompaniesService,
  getCompanyService,
} from "../services/companyService";
import { CompanyRequest } from "../dto/request/CompanyRequest";
import { TypedRequestBody } from "../utils/TypedRequestBody";

export const allCompanies = async (req: Request, res: Response) => {
  const result = await findAllCompaniesService(req, res);
  res.json(result);
};

export const getCompany = async (req: Request, res: Response, next: NextFunction) => {
  const company = await getCompanyService(req, res, next);
  res.json(company);
};

export const createCompany = async (req: TypedRequestBody<CompanyRequest>, res: any, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError("Validation errors", 400, errors.array()));
  }

  const result = await createCompanyService(req, res);
  res.json({ message: "Company added", result });
};

export const deleteCompany = async (req: Request, res: Response, next: NextFunction) => {
  await deleteCompanyService(req, res, next);
};
