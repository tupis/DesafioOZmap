import { BaseEntity } from "@shared/database/entities/BaseEntity";
import {
  getModelForClass,
  index,
  modelOptions,
  prop,
  Severity,
} from "@typegoose/typegoose";
import { SchemaTypes } from "mongoose";

@modelOptions({
  options: { allowMixed: Severity.ALLOW },
})
@index({ location: "2dsphere" })
export class Region extends BaseEntity {
  @prop({ required: true, type: () => Object })
  public location!: {
    type: "Polygon";
    coordinates: number[][][];
  };

  @prop({ type: SchemaTypes.String, required: true })
  public name!: string;

  @prop({ type: SchemaTypes.String, required: false })
  public observation?: string;

  @prop({ type: SchemaTypes.ObjectId, ref: "User", required: true })
  public userId!: string;
}

const RegionModel = getModelForClass(Region);
export { RegionModel };
