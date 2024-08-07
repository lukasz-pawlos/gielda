import { User } from "../entities/UsesEntitie";
import { AppError } from "../utils/appError";
import { AppDataSource } from "../database/dataSource";
import { UserRequest } from "../types/request/UserRequest";

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

export const updateUserMoney = async (userId: number, deltaMoney: number) => {
  const entityManager = AppDataSource.manager;

  await entityManager.transaction(async (transactionalEntityManager) => {
    const user = await transactionalEntityManager.findOne(User, {
      where: { id: userId },
      lock: { mode: "pessimistic_write" },
    });

    if (user) {
      user.money += +deltaMoney;
      await transactionalEntityManager.save(user);
    }
  });
};
