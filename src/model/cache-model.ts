import mongoose from "mongoose";

const Schema = mongoose.Schema;
const BaseModel = require("./base-model.ts");

export class CacheModel {
  Model;

  constructor({ mongoose }) {
    const schema = new Schema({
      _id: { type: String, unique: true },
      value: { type: String },

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

    schema.virtual("key").get(function key() {
      return this._id;
    });

    this.Model = mongoose.model("cache", schema);
  }

  async newAndSave(key, value) {
    return await new this.Model({ _id: key, value }).save();
  }

  async get(key) {
    const resp = await this.Model.findOne({ _id: key });
    return resp.value;
  }

  async put(key, value) {
    return await this.Model.findOneAndUpdate(
      { _id: key },
      { value },
      { upsert: true }
    );
  }
}
