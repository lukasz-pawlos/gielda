import { CompanyRequest } from "../dto/request/CompanyRequest";
import { TypedRequestBody } from "../utils/TypedRequestBody";
import { Company } from "../entities/CompanyEntities";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/appError";

export const findAllCompaniesService = async (req: Request, res: Response) => {
  const company = await Company.find();
  if (company) return company;
};

export const getCompanyService = async (req: Request, res: Response, next: NextFunction) => {
  const id: any = req.params.id;

  const company = await Company.findOne({ where: { id } });
  if (!company) {
    return next(new AppError("Company not found", 404));
  }

  return company;
};

export const getCompanysIdServices = async () => {
  const companysId = await Company.find();

  // if (!companysId.length) {
  //   throw new Error("Companys not found");
  // }

  return companysId.map((obj) => obj.id);
};

export const createCompanyService = async (req: TypedRequestBody<CompanyRequest>, res: Response) => {
  const { name } = req.body;

  const newCompany = await Company.save({ name });

  return newCompany;
};

export const deleteCompanyService = async (req: Request, res: Response, next: NextFunction) => {
  const id: any = req.params.id;

  const company = await Company.findOne({ where: { id } });
  if (!company) {
    return next(new AppError("Company not found", 404));
  }

  await Company.delete({ id });
  res.status(200).json({ message: "Company deleted successfully" });
};
