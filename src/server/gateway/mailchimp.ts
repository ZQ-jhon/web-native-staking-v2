// @flow
import { logger } from "onefx/lib/integrated-gateways/logger";
import axios from "axios";

type Cfg = {
  provider: string,
  authorization: string,
  timeout: number
};

export class Mailchimp {
  cfg: Cfg;
  timeout: number;
  axios: any;

  constructor(cfg: Cfg) {
    this.cfg = cfg;
    this.timeout = cfg.timeout;
    this.axios = axios.create({
      timeout: this.cfg.timeout,
      headers: {
        Authorization: this.cfg.authorization
      }
    });
  }

  async addMailChimpSubscriber(email: string): Promise<any> {
    try {
      const { data } = await this.axios.post(this.cfg.provider, {
        email_address: email,
        status: "subscribed"
      });
      return {
        data
      };
    } catch (err) {
      // @ts-ignore
      const { response: { data } = {} } = err;
      logger.warn(`failed to subscribe: ${err}`);
      return {
        err: true,
        data
      };
    }
  }
}
