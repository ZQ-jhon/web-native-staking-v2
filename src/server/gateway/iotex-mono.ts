// @flow
import axios from "axios";
import { logger } from "onefx/lib/integrated-gateways/logger";

type Opts = {
  endpoint: string;
  healthEndpoint: string;
  timeout: number;
};

export class IotexMono {
  endpoint: string;
  healthEndpoint: string;
  axios: any;

  constructor({ endpoint, timeout, healthEndpoint }: Opts) {
    this.endpoint = endpoint;
    this.healthEndpoint = healthEndpoint;
    this.axios = axios.create({
      timeout
    });
  }

  async getLoginEthByIotexId(iotexId: number): Promise<string> {
    try {
      const resp = await this.axios.post(this.endpoint, {
        method: "getLoginEthByIotexId",
        params: { iotexId }
      });
      return resp.data.result;
    } catch (e) {
      logger.error(`failed to getLoginEthByIotexId: ${e}`);
      return "";
    }
  }

  async earnEmerald(
    iotexId: number,
    amount: number,
    reason: string
  ): Promise<boolean> {
    try {
      const resp = await this.axios.post(this.endpoint, {
        method: "earnEmerald",
        params: { iotexId, amount, reason }
      });
      return resp.data.success;
    } catch (e) {
      logger.error(`failed to earnEmerald: ${e}`);
      return false;
    }
  }

  async spendEmerald(
    iotexId: number,
    amount: number,
    reason: string
  ): Promise<boolean> {
    try {
      const resp = await this.axios.post(this.endpoint, {
        method: "spendEmerald",
        params: { iotexId, amount, reason }
      });
      return resp.data.success;
    } catch (e) {
      logger.error(`failed to spendEmerald: ${e}`);
      return false;
    }
  }

  async getTotalEmerald(iotexId: number): Promise<number> {
    try {
      const resp = await this.axios.post(this.endpoint, {
        method: "getTotalEmerald",
        params: { iotexId }
      });
      return resp.data.total;
    } catch (e) {
      logger.error(`failed to getTotalEmerald: ${e}`);
      return 0;
    }
  }

  async health(): Promise<boolean> {
    try {
      const resp = await this.axios.get(this.healthEndpoint);
      return Boolean(resp && resp.data === "OK");
    } catch (e) {
      return false;
    }
  }
}
