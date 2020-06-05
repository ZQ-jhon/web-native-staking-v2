/* eslint-disable no-invalid-this */
// @flow
import mongoose from "mongoose";
import type { ITestnetFaucet } from "../types/global";

const Schema = mongoose.Schema;
const BaseModel = require("./base-model.ts");

type Opts = {
  mongoose: any
};
export class IotxAirdropModel {
  Model: any;

  constructor({ mongoose }: Opts) {
    const schema = new Schema({
      address: { type: String },
      netType: { type: String },
      githubId: { type: Number },

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

    this.Model = mongoose.model("iotx_airdrop", schema);
  }

  async newAndSave(testFaucet: ITestnetFaucet): Promise<ITestnetFaucet> {
    return await new this.Model(testFaucet).save();
  }

  async findBeforeOneDayByGithubId(
    githubId: number,
    netType: string
  ): Promise<ITestnetFaucet> {
    const date = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return await this.Model.findOne({
      createAt: { $gte: date },
      githubId,
      netType
    });
  }
  async findOneByGithubIdOrIotxAddress(
    githubId: number,
    address: String,
    netType: string
  ): Promise<ITestnetFaucet> {
    return await this.Model.findOne({
      $or: [{ address }, { githubId }],
      netType
    });
  }
}
