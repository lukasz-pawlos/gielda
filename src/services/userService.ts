import { NextFunction, Request, Response } from "express";
import { User } from "../entities/UsesEntitie";
import { AppError } from "../utils/appError";
import { TypedRequestBody } from "../utils/TypedRequestBody";
import { UserRequest } from "../dto/request/userRequest";

export const createUserService = async (req: TypedRequestBody<UserRequest>, res: Response) => {
  const { name, surname, username, password, email } = req.body;

  const newUser = await User.save({
    name,
    surname,
    username,
    password,
    email,
    money: 0,
  });

  return newUser;
};

export const getUserService = async (req: Request, res: Response, next: NextFunction) => {
  const id: any = req.params.id;
  const user = await User.findOne({ where: { id } });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  return user;
};

export const findAllUsersService = async (req: Request, res: Response) => {
  const users = await User.find();
  if (users) return users;
};

export const deleteUserService = async (req: Request, res: Response, next: NextFunction) => {
  const id: any = req.params.id;

  const user = await User.findOne({ where: { id } });
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  await User.delete({ id });
  res.status(200).json({ message: "User deleted successfully" });
};
