import { User } from "../entities/UsesEntitie";
import { AppError } from "../utils/appError";
import { UserRequest } from "../dto/request/userRequest";

export const createUserService = async (newUserData: UserRequest) => {
  const { name, surname, username, password, email } = newUserData;

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

export const getUserService = async (userId: number) => {
  const user = await User.findOne({ where: { id: userId } });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

export const findAllUsersService = async () => {
  const users = await User.find();
  return users;
};

export const deleteUserService = async (userId: number) => {
  const user = await User.findOne({ where: { id: userId } });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  await User.delete({ id: userId });
};

export const updateUserService = async (user: User) => {
  await User.save(user);
};
