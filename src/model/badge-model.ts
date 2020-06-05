/* eslint-disable no-invalid-this */
// @flow
import mongoose from "mongoose";
import type { TBadge } from "../types/global";

const Schema = mongoose.Schema;
const BaseModel = require("./base-model.ts");

type Opts = {
  mongoose: any,
  autoIncrement: any
};

export class BadgeModel {
  Model: any;

  constructor({ mongoose }: Opts) {
    const schema = new Schema({
      icon: { type: String, unique: true },
      name: { type: String, unique: true },
      description: { type: String },

      createAt: { type: Date, default: Date.now },
      updateAt: { type: Date, default: Date.now }
    });

    schema.plugin(BaseModel);

    schema.pre("save", function onSave(next) {
      this.updateAt = new Date();
      next();
    });

    schema.pre("find", function onFind(next) {
      this.updateAt = new Date();
      next();
    });

    schema.virtual("id").get(function id() {
      return this._id;
    });

    this.Model = mongoose.model("badge", schema);
  }

  async newAndSave(
    icon: string,
    name: string,
    description: string
  ): Promise<TBadge> {
    return await new this.Model({ icon, name, description }).save();
  }

  async getBadges(ids: Array<string>): Promise<Array<TBadge>> {
    return await this.Model.find({ _id: { $in: ids } });
  }

  async findOneByName(name: string): Promise<TBadge> {
    return await this.Model.findOne({ name });
  }

  async findOneBadgeByIdAndUpdate(
    id: string,
    {
      name,
      description,
      icon
    }: {
      name: string,
      description: string,
      icon: string
    }
  ): Promise<TBadge> {
    return await this.Model.findOneAndUpdate(
      { _id: id },
      { $set: { icon, name, description } },
      { upsert: true, new: true }
    );
  }

  async findOneAndDelete(id: string): Promise<TBadge> {
    return await this.Model.findOneAndDelete({ _id: id });
  }

  async findOneById(id: string): Promise<TBadge> {
    return await this.Model.findOne({ _id: id });
  }

  async findAll(): Promise<Array<TBadge>> {
    return await this.Model.find({});
  }
}
