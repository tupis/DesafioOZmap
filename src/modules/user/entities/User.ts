import { prop, getModelForClass } from "@typegoose/typegoose";
import { BaseEntity } from "@shared/database/entities/BaseEntity";
import { SchemaTypes } from "mongoose";

export class User extends BaseEntity {
  @prop({ type: SchemaTypes.String, required: true })
  public name!: string;

  @prop({ type: SchemaTypes.String, unique: true, required: true })
  public email!: string;

  @prop({ type: SchemaTypes.String, required: true })
  public password!: string;

  @prop({ type: SchemaTypes.Map, required: false })
  public coordinates?: {
    longitude: number;
    latitude: number;
  };

  @prop({ type: SchemaTypes.Map, required: false })
  public address?: {
    street: string;
    number: number;
    city: string;
    state: string;
  };
}

const UserModel = getModelForClass(User);

export { UserModel };
