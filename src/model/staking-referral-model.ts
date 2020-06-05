/* eslint-disable no-invalid-this */
// @flow
import mongoose from "mongoose";
import { logger } from "onefx/lib/integrated-gateways/logger";
import type { TStakingReferral } from "../types/global";

const Schema = mongoose.Schema;
const BaseModel = require("./base-model.ts");

type Opts = {
  mongoose: any,
  autoIncrement: any
};

const CodeRegex = /^[0-9a-f]{8}$/g;
const EthAddrRegex = /^0x[0-9a-f]{40}$/g;
const TXHashRegex = /^0x[0-9a-f]{64}$/g;

export class StakingReferralModel {
  Model: any;

  constructor({ mongoose }: Opts) {
    const schema = new Schema({
      code: { type: String, require: true, index: true }, // refer code, substring of referrer's ethereum address
      referralEthAddr: {
        type: String,
        require: true,
        index: true,
        unique: true
      }, // referral's ethereum address
      txHash: { type: String, require: true, index: true, unique: true },
      createAt: { type: Date, default: Date.now }
    });

    schema.plugin(BaseModel);

    schema.pre("save", function onSave(next) {
      // validate code
      this.code = this.code.toLowerCase();
      if (!CodeRegex.test(this.code)) {
        logger.error(
          new Error(`referral code format is invalid, '${this.code}'`)
        );
      }
      this.referralEthAddr = this.referralEthAddr.toLowerCase();
      if (!EthAddrRegex.test(this.referralEthAddr)) {
        logger.error(
          new Error(
            `referral eth address format is invalid, '${this.referralEthAddr}'`
          )
        );
      }
      this.txHash = this.txHash.toLowerCase();
      if (!TXHashRegex.test(this.txHash)) {
        logger.error(new Error(`tx hash format is invalid, '${this.txHash}'`));
      }
      this.createAt = new Date();
      next();
    });

    schema.virtual("id").get(function id() {
      return this._id;
    });

    this.Model = mongoose.model("staking_referral", schema);
  }

  async createRecord(
    code: String,
    referralEthAddr: String,
    txHash: String
  ): Promise<TStakingReferral> {
    return await new this.Model({ code, referralEthAddr, txHash }).save();
  }

  async getReferrals(
    code: string,
    page: number,
    pageSize: number
  ): Promise<Array<TStakingReferral>> {
    return (
      (await this.Model.find({ code })
        .skip((page - 1) * pageSize)
        .limit(pageSize)) || []
    );
  }

  async getCountReferrals(code: string): Promise<number> {
    return await this.Model.find({ code }).countDocuments();
  }
}
