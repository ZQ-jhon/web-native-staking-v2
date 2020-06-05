/* eslint-disable no-invalid-this */
// @flow
import mongoose from "mongoose";
import type { IGiveaway, IParticipantGiveaway } from "../types/global";

const Schema = mongoose.Schema;
const BaseModel = require("./base-model.ts");

type Opts = {
  mongoose: any,
  autoIncrement: any
};
export class GiveawayModel {
  Model: any;

  constructor({ mongoose }: Opts) {
    const participant = new Schema({
      userId: { type: Schema.Types.ObjectId },
      tickets: { type: Number }
    });
    const schema = new Schema({
      imgUrl: { type: String },
      instruction: { type: String },
      description: { type: String },
      sponsor: { type: String },
      sponsorLink: { type: String },
      winner: { type: Schema.Types.ObjectId, ref: "member" },
      participants: [participant],
      type: { type: String },
      winnerNotice: { type: String },
      expiredAt: { type: Date, default: Date.now },

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

    this.Model = mongoose.model("giveaway", schema);
  }

  async newAndSave(giveaway: IGiveaway): Promise<IGiveaway> {
    return await new this.Model(giveaway).save();
  }

  async findOneAndUpdate(giveaway: IGiveaway, id: string): Promise<IGiveaway> {
    return await this.Model.findOneAndUpdate({ _id: id }, giveaway, {
      upsert: true,
      new: true
    });
  }

  async remove(id: string): Promise<IGiveaway> {
    return await this.Model.findByIdAndRemove({ _id: id });
  }

  async findOneById(id: string): Promise<IGiveaway> {
    return await this.Model.findOne({ _id: id }).populate("winner");
  }

  async findAll(): Promise<Array<IGiveaway>> {
    return await this.Model.find({}).sort({ expiredAt: 1 });
  }

  async findActiveWithoutWinner(): Promise<Array<IGiveaway>> {
    return await this.Model.find({
      expiredAt: { $gte: new Date() },
      winner: null
    });
  }
  async findExpiredWithoutWinner(): Promise<Array<IGiveaway>> {
    return await this.Model.find({
      expiredAt: { $lte: new Date() },
      winner: null,
      participants: { $exists: true, $ne: null }
    });
  }

  async findOneByIdAndAddParticipant(
    id: string,
    participant: IParticipantGiveaway
  ): Promise<IGiveaway> {
    const giveaway = await this.Model.findOne({ _id: id });
    const participants = (giveaway && giveaway.participants) || [];
    participants.push(participant);
    return await this.Model.findOneAndUpdate({ _id: id }, { participants });
  }
}
