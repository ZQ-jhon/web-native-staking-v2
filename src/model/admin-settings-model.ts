/* eslint-disable no-invalid-this */
// @flow
import mongoose from "mongoose";
import {
  DEFAULT_AVATAR,
  DEFAULT_VOTING_BANNER,
  DEFAULT_ERC20,
  DELEGATES_MONTH_CONFIG
} from "./admin-setting-config";
import {
  BP_BLACKLIST,
  BP_WHITELIST,
  WHITELIST,
  DELEGATES_OF_MONTH,
  VOTING_BANNER,
  DEFAULT_AVATAR as D_A
} from "../constant/admin-setting-constant";

const Schema = mongoose.Schema;
const BaseModel = require("./base-model.ts");

type Opts = {
  mongoose: any
};

type Pair = {
  key: string,
  value: string
};

type DefaultPair = {
  key: string,
  value: any
};

export class AdminSettingsModel {
  Model: any;

  constructor({ mongoose }: Opts) {
    const schema = new Schema({
      key: { type: String },
      value: { type: String },

      createAt: { type: Date, default: Date.now },
      updateAt: { type: Date, default: Date.now }
    });

    schema.index({ token: 1 });

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

    this.Model = mongoose.model("admin_settings", schema);
  }

  async init(): Promise<Array<void>> {
    const defaultPairs: Array<DefaultPair> = [
      { key: BP_BLACKLIST, value: [] },
      { key: BP_WHITELIST, value: [] },
      { key: WHITELIST, value: [] },
      { key: VOTING_BANNER, value: DEFAULT_VOTING_BANNER },
      { key: D_A, value: DEFAULT_AVATAR },
      { key: DELEGATES_OF_MONTH, value: DELEGATES_MONTH_CONFIG }
    ];

    return Promise.all(defaultPairs.map(pair => this.setDefault(pair)));
  }

  async setDefault(config: DefaultPair): Promise<void> {
    const { key, value } = config;
    const v = await this.get(key);

    if (!v) {
      await this.set(key, JSON.stringify(value));
    }
    const defaultErc20 = await this.get("erc20");
    if (!defaultErc20) {
      await this.set("erc20", JSON.stringify(DEFAULT_ERC20));
    }
  }

  async getAll(): Promise<Array<Pair>> {
    return await this.Model.find({});
  }

  async get(key: string): Promise<any> {
    const resp = await this.Model.findOne({ key });
    const val = resp && resp.value;
    try {
      return JSON.parse(val);
    } catch (e) {
      return null;
    }
  }

  async set(key: string, value: string): Promise<Pair> {
    return await this.Model.findOneAndUpdate(
      { key },
      { key, value },
      { upsert: true }
    );
  }
}
