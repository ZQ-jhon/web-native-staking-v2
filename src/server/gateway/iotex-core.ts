// @flow
import RpcMethod from "iotex-antenna/lib/rpc-method/node-rpc-method";
import {IEpochData} from "iotex-antenna/lib/rpc-method/types";
import {logger} from "onefx/lib/integrated-gateways/logger";

type Opts = {
  timeout: number // secs
};

export class IotexCore extends RpcMethod {
  timeout: number;

  getDeadline(): number {
    // @ts-ignore
    return new Date(Date.now() + this.timeout);
  }

  constructor(hostname: string, options: Opts = {timeout: 3000}) {
    super(hostname);
    this.timeout = options.timeout || 3000;
  }

  async health(): Promise<boolean> {
    try {
      const chainMeta = await this.getChainMeta({});
      return Boolean(chainMeta);
    } catch (e) {
      return false;
    }
  }

  async getEpochNumber(): Promise<number> {
    const resp = await this.getEpoch();
    return Number(resp.num);
  }

  async getEpoch(): Promise<IEpochData> {
    try {
      const resp = await this.getChainMeta({});
      return resp.chainMeta.epoch;
    } catch (e) {
      logger.warn(`failed to getChainMeta: ${e}`);
    }
    return { num: 0, height: 0, gravityChainStartHeight: "0" };
  }
}
