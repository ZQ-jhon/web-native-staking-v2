/* eslint-disable no-invalid-this */
// @flow
import mongoose from "mongoose";
import type {
  TMember,
  TMemberParticipantGiveaway,
  TJoinedGiveaway
} from "../types/global";

const Schema = mongoose.Schema;
const BaseModel = require("./base-model.ts");

type Opts = {
  mongoose: any,
  autoIncrement: any
};

const HasMembership = { membershipId: { $exists: true, $ne: null } };

export class MemberModel {
  Model: any;

  constructor({ mongoose, autoIncrement }: Opts) {
    const giveaway = new Schema({
      giveawayId: { type: Schema.Types.ObjectId, ref: "giveaway" },
      tickets: { type: Number },
      ts: { type: Date }
    });
    const rewardRecord = new Schema({
      rewardType: { type: String },
      description: { type: String }
    });
    const schema = new Schema({
      membershipId: { type: Number, unique: true },
      userId: { type: Schema.Types.ObjectId, unique: true },
      badges: [{ type: Schema.Types.ObjectId, ref: "badge" }],
      status: { type: String },
      giveaways: [giveaway],
      giveawayWins: [{ type: Schema.Types.ObjectId, ref: "giveaway" }],
      rewardRecord: [rewardRecord],

      createAt: { type: Date, default: Date.now },
      updateAt: { type: Date, default: Date.now }
    });

    schema.plugin(BaseModel);
    schema.plugin(autoIncrement.plugin, {
      model: "member",
      field: "membershipId"
    });

    schema.pre("save", function onSave(next) {
      this.updateAt = new Date();
      next();
    });

    schema.pre("update", function onUpdate(next) {
      this.updateAt = new Date();
      next();
    });

    schema.virtual("id").get(function id() {
      return this._id;
    });

    this.Model = mongoose.model("member", schema);
  }

  /**
   * Update member values by userId, user should have membership
   * @param {TMember} member member
   * @param {string} userId user id in user table
   */
  async findOneAndUpdate(member: TMember, userId: string): Promise<TMember> {
    return await this.Model.findOneAndUpdate(
      { userId, ...HasMembership },
      member,
      { upsert: true, new: true }
    );
  }

  /**
   * Create a member for user
   * @param {string} userId user id in user table
   */
  async newAndSave(userId: string): Promise<TMember> {
    return await new this.Model({ userId }).save();
  }

  /**
   * Return a member by user id, user may not have membership
   * @param {string} userId user id in user table
   */
  async findOneByUserIdRegardlessOfMembershipId(
    userId: string
  ): Promise<TMember> {
    return await this.Model.find({ userId });
  }

  /**
   * Return a member by user id, user should have membership
   * @param {string} userId user id in user table
   */
  async findOneByUserId(userId: string): Promise<TJoinedGiveaway> {
    const now = new Date();
    return await this.Model.findOne({ userId, ...HasMembership })
      .populate({
        path: "giveaways.giveawayId",
        match: { expiredAt: { $gte: now } }
      })
      .populate("badges");
  }

  /**
   * Return a member by membership id
   * @param {number} membershipId membership id
   */
  async findOneByMid(membershipId: number): Promise<TMember> {
    return await this.Model.findOne({ membershipId });
  }

  /**
   * Find a member by user id and add a giveaway, user should have membership
   * @param {string} userId user id in user table
   * @param {TMemberParticipantGiveaway} giveaway giveaway to participate
   */
  async findOneByUserIdAndAddGiveaway(
    userId: string,
    giveaway: TMemberParticipantGiveaway
  ): Promise<TMember> {
    return await this.Model.findOneAndUpdate(
      { userId, ...HasMembership },
      { $push: { giveaways: { ...giveaway, ts: new Date() } } }
    );
  }

  /**
   * Find a member by user id and append giveaways, user should have membership
   * @param {string} userId user id in user table
   * @param {array<TMemberParticipantGiveaway>} joinedGiveaways array of giveaways to participate
   */
  async findOneByUserIdAndAddGiveaways(
    userId: string,
    joinedGiveaways: any
  ): Promise<TMember> {
    const member = await this.Model.findOne({ userId, ...HasMembership });
    const giveaways = (member && member.giveaways) || [];
    joinedGiveaways.forEach(item => {
      giveaways.push({ ...item, ts: new Date() });
    });
    return await this.Model.findOneAndUpdate(
      { userId, ...HasMembership },
      { giveaways }
    );
  }

  /**
   * Add reward to member by user id, user should have membership
   * @param {string} userId user id in user table
   * @param {TReward} reward reward to append
   */
  async addReward(userId: string, reward: any): Promise<TMember> {
    return await this.Model.findOneAndUpdate(
      { userId, ...HasMembership },
      { $push: { rewardRecord: reward } }
    );
  }

  /**
   * Add badge to member by user id, user should have membership
   * @param {string} userId user id in user table
   * @param {string} badgeId badge id in badge table
   */
  async addBadge(userId: string, badgeId: any): Promise<TMember> {
    return await this.Model.findOneAndUpdate(
      { userId, ...HasMembership },
      { $push: { badges: badgeId } }
    );
  }

  /**
   * Update the membership id by user id
   * @param {string} userId update membershipId
   * @param {int|null} membershipId membership id
   */
  async findOneAndUpdateMembership(
    userId: string,
    membershipId: any
  ): Promise<TMember> {
    return await this.Model.findOneAndUpdate(
      { userId },
      { $set: { membershipId } }
    );
  }

  /**
   * Find member with reward by user id, user should have membership
   * @param {string} userId user id in user table
   * @param {any} rewardInfo reward information
   */
  async findOneWithReward(userId: string, rewardInfo: any): Promise<TMember> {
    return await this.Model.findOne({
      userId,
      ...HasMembership,
      rewardRecord: { $elemMatch: { rewardType: rewardInfo.rewardType } }
    });
  }

  /**
   * Append giveaway wins for member by user id, user should have membership
   * @param {string} userId user id in user table
   * @param {string} giveawayId id of giveaway
   */
  async findOneAndAddGiveawayWin(
    userId: string,
    giveawayId: any
  ): Promise<TMember> {
    return await this.Model.findOneAndUpdate(
      { userId, ...HasMembership },
      { $push: { giveawayWins: giveawayId } }
    );
  }
}
