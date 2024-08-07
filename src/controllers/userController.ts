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

export const allUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await findAllUsersService();
  res.json({ users });
});

export const getUser = catchAsync(async (req: Request, res: Response) => {
  const userId: any = req.params.id;

  const user = await getUserService(userId);
  res.json(user);
});

export const createUser = catchAsync(async (req: TypedRequestBody<UserRequest>, res: Response, next: NextFunction) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(new AppError("Validation errors", 400, error.array()));
  }
  const result = await createUserService(req.body);
  res.json({ message: "User added", result });
});

export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const userId: any = req.params.id;
  await deleteUserService(userId);
  res.status(200).json({ message: "User deleted successfully" });
});

export const addUserMoney = catchAsync(
  async (req: TypedRequestBody<{ userId: number; money: number }>, res: Response) => {
    const { userId, money } = req.body;
    await updateUserMoney(userId, money);
    res.status(200).json({ message: "Money added successfully" });
  }
);
