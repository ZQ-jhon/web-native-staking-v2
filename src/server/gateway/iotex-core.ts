// @flow
import RpcMethod from "iotex-antenna/lib/rpc-method/node-rpc-method";
import { logger } from "onefx/lib/integrated-gateways/logger";
import type { Epoch } from "../../types/global";

type Opts = {
  timeout: number // secs
};

export class IotexCore extends RpcMethod {
  timeout: number;
  // @ts-ignore
  getDeadline() {
    return new Date(Date.now() + this.timeout);
  }
  // @ts-ignore
  constructor(hostname: string, options: Opts = {}) {
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

  async getEpoch(): Promise<Epoch> {
    try {
      const resp = await this.getChainMeta({});
      // @ts-ignore
      return resp.chainMeta.epoch;
    } catch (e) {
      logger.warn(`failed to getChainMeta: ${e}`);
    }
    return { num: "0", height: "0", gravityChainStartHeight: "0" };
  }
}
