import { User, UserModel } from "@modules/user/entities/User";
import { BaseRepository } from "@shared/database/repository/base-respository";

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(UserModel);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await UserModel.findOne({ email, deletedAt: null }).exec();
  }
}
