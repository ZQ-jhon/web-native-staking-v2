/* eslint-disable no-invalid-this */
// @flow
import { promisify } from "util";
// $FlowFixMe
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { logger } from "onefx/lib/integrated-gateways/logger";

const Schema = mongoose.Schema;
const BaseModel = require("./base-model.tsx");

const sign = promisify(jwt.sign);
const verify = promisify(jwt.verify);

type Opts = {
  secret: string;
  mongoose: any;
  expDays: number;
};

type UserId = string;

export class JwtModel {
  secret: string;
  Model: any;

  constructor({ secret, mongoose, expDays }: Opts) {
    this.secret = secret;

    const JwtSchema = new Schema({
      userId: { type: Schema.Types.ObjectId },
      expireAt: {
        type: Date,
        default: () => new Date(getExpireEpochDays(expDays)),
        index: { expires: `${expDays}d` },
      },

      createAt: { type: Date, default: Date.now },
      updateAt: { type: Date, default: Date.now },
    });

    JwtSchema.index({ userId: 1 });

    JwtSchema.plugin(BaseModel);
    JwtSchema.pre("save", function onSave(next) {
      // @ts-ignore
      this.updateAt = new Date();
      next();
    });
    JwtSchema.pre("find", function onFind(next) {
      // @ts-ignore
      this.updateAt = new Date();
      next();
    });

    this.Model = mongoose.model("Jwt", JwtSchema);
  }

  async create(userId: string, roles?: Array<string>): Promise<string> {
    const resp = await new this.Model({ userId }).save();
    const obj = {
      jti: resp.id,
      sub: userId,
      exp: Math.floor(new Date(resp.expireAt).getTime() / 1000),
      iat: Math.floor(new Date(resp.createAt).getTime() / 1000),
    };
    if (roles) {
      // $FlowFixMe
      // @ts-ignore
      obj.roles = roles;
    }
    // @ts-ignore
    return await sign(obj, this.secret);
  }

  async revoke(token: string): Promise<void> {
    let decoded;
    try {
      decoded = await verify(token, this.secret);
    } catch (e) {
      return undefined;
    }
    // @ts-ignore
    await this.Model.deleteOne({ _id: decoded.jti });
  }

  // @ts-ignore
  async verify(token: string): Promise<?UserId> {
    let decoded;
    try {
      decoded = await verify(token, this.secret);
    } catch (e) {
      logger.debug("failed to decode token");
      return null;
    }

    const found = await this.Model.findOne({
      // @ts-ignore
      _id: decoded.jti,
      // @ts-ignore
      userId: decoded.sub,
    });
    if (!found) {
      logger.debug("failed to find user by token");
      return null;
    }

    return found.userId;
  }
}

function getExpireEpochDays(days: number) {
  return Date.now() + days * 24 * 60 * 60 * 1000;
}
