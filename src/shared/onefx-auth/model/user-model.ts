import mongoose from "mongoose";
import { baseModel } from "./base-model";

const Schema = mongoose.Schema;

type TNewUser = {
  email?: string;
  ip?: string;
  roles?: Array<String>;
  eth: string;
};

export type TUser = mongoose.Document &
  TNewUser & {
    avatar: string;

    isBlocked: boolean;

    createAt: Date;
    updateAt: Date;
  };

export class UserModel {
  public Model: mongoose.Model<TUser>;

  constructor({ mongoose }: { mongoose: mongoose.Mongoose }) {
    const UserSchema = new Schema({
      email: { type: String },
      name: { type: String },
      ip: { type: String },
      avatar: { type: String },
      roles: { type: Array },
      iotexId: { type: Number },
      eth: { type: String },

      isBlocked: { type: Boolean, default: false },

      createAt: { type: Date, default: Date.now },
      updateAt: { type: Date, default: Date.now }
    });

    UserSchema.virtual("id").get(function onId(): string {
      // @ts-ignore
      return this._id;
    });

    UserSchema.plugin(baseModel);
    UserSchema.pre("save", function onSave(next: Function): void {
      // @ts-ignore
      this.updateAt = new Date();
      next();
    });
    UserSchema.pre("find", function onFind(next: Function): void {
      // @ts-ignore
      this.updateAt = new Date();
      next();
    });

    this.Model = mongoose.model("User", UserSchema);
  }

  public async getById(id: string): Promise<TUser | null> {
    return this.Model.findOne({ _id: id });
  }

  public async newAndSave(user: TNewUser): Promise<TUser> {
    return new this.Model(user).save();
  }

  async getByEth(eth: string): Promise<TUser | null> {
    return this.Model.findOne({ eth });
  }
}
