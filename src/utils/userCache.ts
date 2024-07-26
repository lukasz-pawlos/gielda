import NodeCache from "node-cache";
import { getUserService } from "../services/userService";
import { User } from "../entities/UsesEntitie";
import { AppError } from "./appError";

export const userCache = new NodeCache({ stdTTL: 100, checkperiod: 120 });

export const getUserFromCacheOrDb = async (userId: number): Promise<User> => {
  let user: User | undefined = userCache.get<User>(userId.toString());

  if (!user) {
    user = await getUserService(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    userCache.set(userId.toString(), user);
  }

  return user;
};

export const updateUserCache = (userId: number, updatedUser: User): void => {
  userCache.set(userId.toString(), updatedUser);
};
