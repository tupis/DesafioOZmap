import { BaseEntity } from "@shared/database/entities/BaseEntity";
import {
  getModelForClass,
  index,
  modelOptions,
  prop,
  Severity,
} from "@typegoose/typegoose";

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
}

const RegionModel = getModelForClass(Region);
export { RegionModel };
