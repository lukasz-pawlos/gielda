import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { AppError } from "../utils/appError";
import {
  createCompanyService,
  deleteCompanyService,
  findAllCompaniesService,
  getCompanyService,
} from "../services/companyService";
import { CompanyRequest } from "../types/request/CompanyRequest";
import { TypedRequestBody } from "../utils/TypedRequestBody";
import { catchAsync } from "../utils/catchAsync";
import { APILog, createLog } from "../utils/logger/createlog";

export const allCompanies = catchAsync(async (req: Request, res: Response) => {
  const start = new Date();
  const { result, databaseTime } = await findAllCompaniesService();
  const end = new Date();

  res.json(result);

  const ApiLog: APILog = {
    apiMethod: "GET",
    apiTime: end.getTime() - start.getTime(),
    applicationTime: new Date().getTime() - start.getTime(),
    databaseTime,
    endpointUrl: `/company${req.path}`,
  };

  createLog(ApiLog, "apiUse.csv");
});

export const getCompany = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const start = new Date();
  const companyId: any = req.params.id;

  const { result, databaseTime } = await getCompanyService(companyId);
  const end = new Date();

  res.json(result);

  const ApiLog: APILog = {
    apiMethod: "GET",
    apiTime: end.getTime() - start.getTime(),
    applicationTime: new Date().getTime() - start.getTime(),
    databaseTime,
    endpointUrl: `/company${req.path}`,
  };

  createLog(ApiLog, "apiUse.csv");
});

export const createCompany = catchAsync(async (req: TypedRequestBody<CompanyRequest>, res: any, next: NextFunction) => {
  const start = new Date();
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError("Validation errors", 400, errors.array()));
  }

  const { result, databaseTime } = await createCompanyService(req.body);
  const end = new Date();

  res.json({ message: "Company added", result });

  const ApiLog: APILog = {
    apiMethod: "POST",
    apiTime: end.getTime() - start.getTime(),
    applicationTime: new Date().getTime() - start.getTime(),
    databaseTime,
    endpointUrl: `/company${req.path}`,
  };

  createLog(ApiLog, "apiUse.csv");
});

export const deleteCompany = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const start = new Date();
  const companyId: any = req.params.id;

  const databaseTime = await deleteCompanyService(companyId);
  const end = new Date();

  res.status(200).json({ message: "Company deleted successfully" });

  const ApiLog: APILog = {
    apiMethod: "DELETE",
    apiTime: end.getTime() - start.getTime(),
    applicationTime: new Date().getTime() - start.getTime(),
    databaseTime,
    endpointUrl: `/company${req.path}`,
  };

  createLog(ApiLog, "apiUse.csv");
});
