// @flow
import { logger } from "onefx/lib/integrated-gateways/logger";
import axios from "axios";
import Antenna from "iotex-antenna";
import { toRau } from "iotex-antenna/lib/account/utils";
// @ts-ignore
import window from "global/window";

type Cfg = {
  tokenUrl: string,
  userUrl: string,
  timeout: number,
  codeUrl: string,
  testnet: {
    clientId: string,
    clientSecret: string,
    redirectUri: string,
    privateKey: string,
    antennaUrl: string
  },
  mainnet: {
    clientId: string,
    clientSecret: string,
    redirectUri: string,
    privateKey: string,
    antennaUrl: string
  }
};

export class IotxAirdrop {
  cfg: Cfg;
  timeout: number;
  antenna: any;
  unlockedWallet: any;

  constructor(cfg: Cfg) {
    this.cfg = cfg;
    this.timeout = cfg.timeout;
    this.antenna = {
      testnet: new Antenna(cfg.testnet.antennaUrl),
      mainnet: new Antenna(cfg.mainnet.antennaUrl)
    };
    this.unlockedWallet = {
      testnet: this.antenna.testnet.iotx.accounts.privateKeyToAccount(
        this.cfg.testnet.privateKey
      ),
      mainnet: this.antenna.mainnet.iotx.accounts.privateKeyToAccount(
        this.cfg.mainnet.privateKey
      )
    };
  }

  connectTimeout(): Promise<any> {
    return new Promise(( reject) => {
      window.setTimeout(() => {
        reject(new Error("timeout"));
      }, this.timeout);
    });
  }

  async getGithubUserId(code: any, netType: string): Promise<any> {
    try {
        // @ts-ignore
      const tokenUrl = `${this.cfg.tokenUrl}?client_id=${this.cfg[netType].clientId}&client_secret=${this.cfg[netType].clientSecret}&code=${code}`;
      const tokenResponse = await Promise.race([
        axios({
          method: "post",
          url: tokenUrl,
          headers: {
            accept: "application/json"
          }
        }),
        this.connectTimeout()
      ]);
      // @ts-ignore
      const { data: { access_token } = {} } = tokenResponse || {};

      const githubUser = await Promise.race([
        axios.get(this.cfg.userUrl, {
          params: { access_token }
        }),
        this.connectTimeout()
      ]);
      // @ts-ignore
      const { data: { id } = {} } = githubUser || {};
      return id;
    } catch (e) {
      logger.error(`failed to get github user id: ${e}`);
      return null;
    }
  }

  async sendNativeToken(address: string, netType: string): Promise<boolean> {
    try {
      /* eslint-disable no-unused-vars */
      // @ts-ignore
      const resp = await Promise.race([
        this.antenna[netType].iotx.sendTransfer({
          from: this.unlockedWallet[netType].address,
          to: address,
          value: toRau(netType === "testnet" ? "100" : "10", "iotx"),
          gasLimit: "100000",
          gasPrice: toRau("1", "Qev")
        }),
        this.connectTimeout()
      ]);
      return true;
    } catch (e) {
      logger.error(`failed to sendNativeToken: ${e}`);
      return false;
    }
  }
}
