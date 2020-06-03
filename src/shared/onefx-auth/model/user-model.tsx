// @flow
/* eslint-disable no-invalid-this */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const tools = require("../utils/tools.tsx");
const BaseModel = require("./base-model.tsx");

type TNewUser = {
  password: string;
  email: string;
  ip: string;
  roles: Array<String>;
};
type TUpdateUser = {
  avatar: string;
  name: string;
};

export class UserModel {
  Model: any;

  constructor({ mongoose }: any) {
    const UserSchema = new Schema({
      password: { type: String },
      email: { type: String },
      name: { type: String },
      ip: { type: String },
      avatar: { type: String },
      roles: { type: Array },
      lifetimeHumanId: { type: "ObjectId", ref: "LifetimeHuman" },
      iotexId: { type: Number },
      eth: { type: String },

      isBlocked: { type: Boolean, default: false },

      createAt: { type: Date, default: Date.now },
      updateAt: { type: Date, default: Date.now },
    });

    UserSchema.virtual("id").get(function onId() {
      // @ts-ignore
      return this._id;
    });
    UserSchema.virtual("avatarUrl").get(function onAvatarUrl() {
      // @ts-ignore
      let url = this.avatar || tools.makeGravatar(this.email.toLowerCase());

      // www.gravatar.com 被墙
      // 现在不是了
      // url = url.replace('www.gravatar.com', 'gravatar.com');

      // 让协议自适应 protocol，使用 `//` 开头
      if (url.indexOf("http:") === 0) {
        url = url.slice(5);
      }

      // 如果是 github 的头像，则限制大小
      if (url.indexOf("githubusercontent") !== -1) {
        url += "&s=120";
      }

      return url;
    });

    UserSchema.plugin(BaseModel);
    // @ts-ignore
    UserSchema.pre("save", function onSave(next) {
      // @ts-ignore
      this.updateAt = new Date();
      next();
    });
    // @ts-ignore
    UserSchema.pre("find", function onFind(next) {
      // @ts-ignore
      this.updateAt = new Date();
      next();
    });

    this.Model = mongoose.model("User", UserSchema);
  }

  async getById(id: string) {
    return await this.Model.findOne({ _id: id });
  }

  async getOrAddByIotexId(iotexId: string, eth: string) {
    return await this.Model.findOneAndUpdate(
      { iotexId },
      { iotexId, eth },
      { upsert: true, new: true }
    );
  }

  async getByMail(email: string) {
    return await this.Model.findOne({ email });
  }

  async getByEth(eth: string) {
    return await this.Model.findOne({ eth });
  }

  async newAndSave(user: TNewUser) {
    const hashed = {
      ...user,
      password: await tools.bhash(user.password),
    };
    return await new this.Model(hashed).save();
  }

  async findOneAndUpdateById(userId: string, userInput: TUpdateUser) {
    return await this.Model.update({ _id: userId }, userInput);
  }

  async updatePassword(userId: string, password: string) {
    return await this.Model.update(
      { _id: userId },
      { password: await tools.bhash(password) }
    );
  }

  async verifyPassword(userId: string, password: string) {
    let resp;
    try {
      resp = await this.Model.findOne({ _id: userId }).select("password");
    } catch (err) {
      return false;
    }
    return resp && (await tools.bcompare(password, resp.password));
  }
}
