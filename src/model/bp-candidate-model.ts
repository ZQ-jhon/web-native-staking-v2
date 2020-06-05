/* eslint-disable no-invalid-this */
// @flow
import mongoose from "mongoose";
import { TNewBpCandidate, TBpCandidate } from "../types/global"

const Schema = mongoose.Schema;
const BaseModel = require("./base-model.ts");

type Opts = {
  mongoose: any,
  expMins: number
};

export class BpCandidateModel {
  Model: any;

  constructor({ mongoose }: Opts) {
    const schema = new Schema({
      name: { type: String },
      blurb: { type: String },
      website: { type: String },
      logo: { type: String },
      bannerUrl: { type: String },
      socialMedia: { type: [String] },
      location: { type: String },
      introduction: { type: String },
      team: { type: String },
      techSetup: { type: String },
      communityPlan: { type: String },
      rewardPlan: { type: String },
      serverEndpoint: { type: String },
      serverHealthEndpoint: { type: String },
      discordName: { type: String },
      email: { type: String },
      annualReward: { type: Number },

      registeredName: { type: String },
      shareCardImage: { type: String },
      tempEthAddress: { type: String },

      badges: [{ type: Schema.Types.ObjectId, ref: "badge" }],

      createAt: { type: Date, default: Date.now },
      updateAt: { type: Date, default: Date.now }
    });

    schema.index({ token: 1 });

    schema.plugin(BaseModel);
    schema.pre("save", function onSave(next) {
      // @ts-ignore
      this.updateAt = new Date();
      next();
    });
    schema.pre("find", function onFind(next) {
      // @ts-ignore
      this.updateAt = new Date();
      next();
    });
    schema.virtual("id").get(function id() {
      // @ts-ignore
      return this._id;
    });

    this.Model = mongoose.model("bp_candidate", schema);
  }

  async newAndSave(candidate: TNewBpCandidate): Promise<TBpCandidate> {
    return await new this.Model(candidate).save();
  }

  async findOneAndUpdate(
    candidate: TNewBpCandidate,
    eth: string
  ): Promise<TBpCandidate> {
    return await this.Model.findOneAndUpdate(
      { tempEthAddress: { $regex: new RegExp(`^${eth}$`, "i") } },
      candidate,
      {
        upsert: true,
        new: true
      }
    );
  }

  async findOneAndDelete(userId: string): Promise<TBpCandidate> {
    return await this.Model.findOneAndDelete({ userId });
  }

  async findOneById(id: string): Promise<TBpCandidate> {
    return await this.Model.findOne({ _id: id });
  }

  // @ts-ignore
  async findOne(eth: string): Promise<?TBpCandidate> {
    if (!eth) {
      return null;
    }
    return await this.Model.findOne({
      tempEthAddress: { $regex: new RegExp(`^${eth}$`, "i") }
    });
  }

  async findAll(): Promise<Array<TBpCandidate>> {
    const all = await this.Model.find({}).lean();
    // @ts-ignore
    return all.map(it => {
      it.id = it._id;
      return it;
    });
  }
}
