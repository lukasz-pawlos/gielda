import { CompanyRequest } from "../dto/request/CompanyRequest";
import { Company } from "../entities/CompanyEntities";
import { AppError } from "../utils/appError";

export const findAllCompaniesService = async () => {
  const company = await Company.find();
  return company;
};

export const getCompanyService = async (companyId: number) => {
  const company = await Company.findOne({ where: { id: companyId } });

  if (!company) {
    throw new AppError("Company not found", 404);
  }

  return company;
};

export const getCompanysIdServices = async () => {
  const companysId = await Company.find();

  if (!companysId.length) {
    return [];
  }

  return companysId.map((obj) => obj.id);
};

export const createCompanyService = async (newComapnyData: CompanyRequest) => {
  const { name } = newComapnyData;

  const newCompany = await Company.save({ name });

  return newCompany;
};

export const deleteCompanyService = async (companyId: number) => {
  const company = await Company.findOne({ where: { id: companyId } });
  if (!company) {
    throw new AppError("Company not found", 404);
  }

  await Company.delete({ id: companyId });
};
