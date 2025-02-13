import { ReturnModelType } from "@typegoose/typegoose";

export class BaseRepository<T> {
  public readonly model: ReturnModelType<new () => T>;

  constructor(model: ReturnModelType<new () => T>) {
    this.model = model;
  }

  public async create(doc: Partial<T>): Promise<T> {
    return this.model.create(doc) as unknown as T;
  }

  public async findById(id: string): Promise<T | null> {
    const result = await this.model
      .findById(id)
      .where({ deletedAt: null })
      .lean()
      .exec();
    return result as unknown as T | null;
  }

  public async findAll(): Promise<T[]> {
    const result = await this.model.find({ deletedAt: null }).lean().exec();
    return result as unknown as T[];
  }

  public async softDelete(id: string): Promise<void> {
    await this.model
      .findByIdAndUpdate(id, { deletedAt: new Date() })
      .lean()
      .exec();
  }

  public async restore(id: string): Promise<void> {
    await this.model.findByIdAndUpdate(id, { deletedAt: null }).lean().exec();
  }

  public async updateById(id: string, doc: Partial<T>): Promise<T | null> {
    const document = await this.findById(id);

    if (!document) return null;

    (await this.model
      .findOneAndUpdate({ _id: id }, doc)
      .lean()
      .exec()) as unknown as T;

    return await this.findById(id);
  }
}

// import { ReturnModelType } from "@typegoose/typegoose";
// import { ClientSession, startSession } from "mongoose";

// export class BaseRepository<T> {
//   private readonly model: ReturnModelType<new () => T>;

//   constructor(model: ReturnModelType<new () => T>) {
//     this.model = model;
//   }

//   private async withTransaction<R>(
//     fn: (session: ClientSession) => Promise<R>,
//     existingSession?: ClientSession,
//   ): Promise<R> {
//     if (existingSession) {
//       if (existingSession.inTransaction()) {
//         return fn(existingSession);
//       }
//       return existingSession.withTransaction(fn);
//     }

//     const session = await startSession();
//     try {
//       return await session.withTransaction(() => fn(session));
//     } finally {
//       session.endSession();
//     }
//   }

//   public async create(doc: Partial<T>, session?: ClientSession): Promise<T> {
//     return this.withTransaction(async (session) => {
//       const createdDoc = await this.model.create([doc], { session });
//       return createdDoc[0] as unknown as T;
//     }, session);
//   }

//   public async findById(
//     id: string,
//     session?: ClientSession,
//   ): Promise<T | null> {
//     return this.withTransaction(async (session) => {
//       const result = await this.model
//         .findById(id)
//         .where({ deletedAt: null })
//         .session(session)
//         .lean().exec();
//       return result as unknown as T | null;
//     }, session);
//   }

//   public async findAll(session?: ClientSession): Promise<T[]> {
//     return this.withTransaction(async (session) => {
//       const result = await this.model
//         .find({ deletedAt: null })
//         .session(session)
//         .lean().exec();
//       return result as unknown as T[];
//     }, session);
//   }

//   public async softDelete(id: string, session?: ClientSession): Promise<void> {
//     await this.withTransaction(async (session) => {
//       await this.model
//         .findByIdAndUpdate(id, { deletedAt: new Date() })
//         .session(session)
//         .lean().exec();
//     }, session);
//   }

//   public async restore(id: string, session?: ClientSession): Promise<void> {
//     await this.withTransaction(async (session) => {
//       await this.model
//         .findByIdAndUpdate(id, { deletedAt: null })
//         .session(session)
//         .lean().exec();
//     }, session);
//   }
// }
