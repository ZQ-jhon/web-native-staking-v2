/* eslint-disable no-invalid-this */
// @flow
import mongoose from "mongoose";
import type { THistory } from "../types";

const Schema = mongoose.Schema;
const BaseModel = require("../shared/onefx-auth/model/base-model.js");

type TFindOpts = {
  limit?: number
};

export class VotesHistoryModel {
  Model: any;

  constructor({ mongoose }: any) {
    const schema = new Schema({
      count: { type: Number },
      ts: { type: Date },
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
    this.Model = mongoose.model("votes_history", schema);
  }

  async newAndSave(history: THistory): Promise<THistory> {
    return await new this.Model(history).save();
  }

  async findAll({ limit = 20 }: TFindOpts = {}): Promise<Array<THistory>> {
    return await this.Model.find({})
      .limit(limit)
      .sort({ ts: -1 });
  }
}
