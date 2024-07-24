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
import { catchAsync } from "../utils/catchAsync";

export const allCompanies = catchAsync(async (req: Request, res: Response) => {
  const result = await findAllCompaniesService();
  res.json(result);
});

export const getCompany = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const companyId: any = req.params.id;

  const company = await getCompanyService(companyId);
  res.json(company);
});

export const createCompany = catchAsync(async (req: TypedRequestBody<CompanyRequest>, res: any, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError("Validation errors", 400, errors.array()));
  }

  const result = await createCompanyService(req.body);
  res.json({ message: "Company added", result });
});

export const deleteCompany = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const companyId: any = req.params.id;

  await deleteCompanyService(companyId);
  res.status(200).json({ message: "Company deleted successfully" });
});
