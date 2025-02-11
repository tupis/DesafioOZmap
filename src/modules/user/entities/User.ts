import { prop, getModelForClass, Ref } from "@typegoose/typegoose";
import { BaseEntity } from "@shared/database/entities/BaseEntity";
import { SchemaTypes } from "mongoose";
import { Address } from "./Address";

export class User extends BaseEntity {
  @prop({ type: SchemaTypes.String, required: true })
  public name!: string;

  @prop({ type: SchemaTypes.String, unique: true, required: true })
  public email!: string;

  @prop({ type: SchemaTypes.String, required: true })
  public password!: string;

  @prop({ ref: () => Address, required: false })
  public address?: Ref<Address>;
}

const UserModel = getModelForClass(User);
export { UserModel };
