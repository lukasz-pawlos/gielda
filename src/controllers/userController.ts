import { NextFunction, Request, Response } from "express";
import {
  createUserService,
  deleteUserService,
  findAllUsersService,
  getUserService,
  updateUserMoney,
} from "../services/userService";
import { validationResult } from "express-validator";
import { AppError } from "../utils/appError";
import { UserRequest } from "../types/request/UserRequest";
import { TypedRequestBody } from "../utils/TypedRequestBody";
import { catchAsync } from "../utils/catchAsync";
import { APILog, createLog } from "../utils/logger/createlog";

export const allUsers = catchAsync(async (req: Request, res: Response) => {
  const start = new Date();
  const { result, databaseTime } = await findAllUsersService();
  const end = new Date();

  res.json({ result });

  const ApiLog: APILog = {
    apiMethod: "GET",
    apiTime: end.getTime() - start.getTime(),
    applicationTime: new Date().getTime() - start.getTime(),
    databaseTime,
    endpointUrl: `/user${req.path}`,
  };

  createLog(ApiLog, "apiUse.csv");
});

export const getUser = catchAsync(async (req: Request, res: Response) => {
  const start = new Date();
  const userId: any = req.params.id;

  const { result, databaseTime } = await getUserService(userId);
  const end = new Date();

  res.json(result);

  const ApiLog: APILog = {
    apiMethod: "GET",
    apiTime: end.getTime() - start.getTime(),
    applicationTime: new Date().getTime() - start.getTime(),
    databaseTime,
    endpointUrl: `/user${req.path}`,
  };

  createLog(ApiLog, "apiUse.csv");
});

export const createUser = catchAsync(async (req: TypedRequestBody<UserRequest>, res: Response, next: NextFunction) => {
  const start = new Date();
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(new AppError("Validation errors", 400, error.array()));
  }
  const { result, databaseTime } = await createUserService(req.body);
  const end = new Date();

  res.json({ message: "User added", result });

  const ApiLog: APILog = {
    apiMethod: "POST",
    apiTime: end.getTime() - start.getTime(),
    applicationTime: new Date().getTime() - start.getTime(),
    databaseTime,
    endpointUrl: `/user${req.path}`,
  };

  createLog(ApiLog, "apiUse.csv");
});

export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const start = new Date();
  const userId: any = req.params.id;
  const databaseTime = await deleteUserService(userId);
  const end = new Date();

  res.status(200).json({ message: "User deleted successfully" });

  const ApiLog: APILog = {
    apiMethod: "DELETE",
    apiTime: end.getTime() - start.getTime(),
    applicationTime: new Date().getTime() - start.getTime(),
    databaseTime,
    endpointUrl: `/user${req.path}`,
  };

  createLog(ApiLog, "apiUse.csv");
});

export const addUserMoney = catchAsync(
  async (req: TypedRequestBody<{ userId: number; money: number }>, res: Response) => {
    const start = new Date();
    const { userId, money } = req.body;
    const databaseTime = await updateUserMoney(userId, money);
    const end = new Date();

    res.status(200).json({ message: "Money added successfully" });

    const ApiLog: APILog = {
      apiMethod: "POST",
      apiTime: end.getTime() - start.getTime(),
      applicationTime: new Date().getTime() - start.getTime(),
      databaseTime,
      endpointUrl: `/user${req.path}`,
    };

    createLog(ApiLog, "apiUse.csv");
  }
);
