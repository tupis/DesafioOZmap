import { BaseEntity } from "@shared/database/entities/BaseEntity";
import { prop, getModelForClass, index } from "@typegoose/typegoose";
import { SchemaTypes } from "mongoose";

@index({ location: "2dsphere" })
export class Address extends BaseEntity {
  @prop({ type: SchemaTypes.String, required: true })
  public street!: string;

  @prop({ type: SchemaTypes.String, required: true })
  public number!: string;

  @prop({ type: SchemaTypes.String, required: true })
  public city!: string;

  @prop({ type: SchemaTypes.String, required: true })
  public state!: string;

  @prop({ type: SchemaTypes.String, required: true })
  public country!: string;

  @prop({ type: SchemaTypes.String, required: true })
  public zipCode!: string;

  @prop({ type: SchemaTypes.String, required: true })
  public fullAddress!: string;

  @prop({
    type: SchemaTypes.Mixed,
    required: true,
    default: { type: "Point", coordinates: [0, 0] },
  })
  public location!: {
    type: "Point";
    coordinates: [number, number]; // longitude, latitude
  };
}

const AddressModel = getModelForClass(Address);
export { AddressModel };
