import { NextFunction, Request, Response } from "express";
import { createUserService, deleteUserService, findAllUsersService, getUserService } from "../services/userService";
import { validationResult } from "express-validator";
import { AppError } from "../utils/appError";
import { UserRequest } from "../dto/request/userRequest";
import { TypedRequestBody } from "../utils/TypedRequestBody";

export const allUsers = async (req: Request, res: Response) => {
  const users = await findAllUsersService(req, res);
  res.json({ users });
};

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  const user = await getUserService(req, res, next);
  res.json(user);
};

export const createUser = async (req: TypedRequestBody<UserRequest>, res: Response, next: NextFunction) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(new AppError("Validation errors", 400, error.array()));
  }
  const result = await createUserService(req, res);
  res.json({ message: "User added", result });
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  await deleteUserService(req, res, next);
};
