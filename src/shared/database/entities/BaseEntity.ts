import { prop } from "@typegoose/typegoose";
import { SchemaTypes } from "mongoose";

export class BaseEntity {
  @prop({ type: SchemaTypes.ObjectId, auto: true })
  public _id!: string;

  @prop({ type: SchemaTypes.Date, default: () => new Date() })
  public createdAt!: Date;

  @prop({ type: SchemaTypes.Date, default: () => new Date() })
  public updatedAt!: Date;

  @prop({ type: SchemaTypes.Date, default: null })
  public deletedAt!: Date | null;
}
