/* eslint-disable no-invalid-this */
// @flow
import mongoose from "mongoose";
import type { TPoll } from "../types/global";

const Schema = mongoose.Schema;
const BaseModel = require("./base-model.ts");

type Opts = {
  mongoose: any,
  autoIncrement: any
};

export class PollModel {
  Model: any;

  constructor({ mongoose }: Opts) {
    const schema = new Schema({
      contractAddress: { type: String, unique: true },
      title: { type: String },
      description: { type: String },
      proposer: { type: String },
      category: { type: String },
      start: { type: Date, default: Date.now },
      end: { type: Date },
      result: { type: [Number] },

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

    this.Model = mongoose.model("poll", schema);
  }

  async newAndSave(
    contractAddress: string,
    category: string,
    start: Date,
    end: Date
  ): Promise<TPoll> {
    return await new this.Model({
      contractAddress,
      category,
      start,
      end
    }).save();
  }

  async getPolls(ids: Array<string>): Promise<Array<TPoll>> {
    return await this.Model.find({ _id: { $in: ids } });
  }

  async findOneByContractAddress(contractAddress: string): Promise<TPoll> {
    return await this.Model.findOne({ contractAddress });
  }

  async findOnePollByIdAndUpdate(
    id: string,
    {
      contractAddress,
      category,
      start,
      end
    }: {
      contractAddress: string,
      category: string,
      start: Date,
      end: Date
    }
  ): Promise<TPoll> {
    return await this.Model.findOneAndUpdate(
      { _id: id },
      { $set: { contractAddress, category, start, end } },
      { upsert: true, new: true }
    );
  }

  async findOneAndDelete(id: string): Promise<TPoll> {
    return await this.Model.findOneAndDelete({ _id: id });
  }

  async findOneById(id: string): Promise<TPoll> {
    return await this.Model.findOne({ _id: id });
  }

  async findAll(): Promise<Array<TPoll>> {
    return await this.Model.find({});
  }

  async pagination(offset: number, limit: number): Promise<Array<TPoll>> {
    return await this.Model.find({})
      .skip(offset)
      .limit(limit);
  }
}
