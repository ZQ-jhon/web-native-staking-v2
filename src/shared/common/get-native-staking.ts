// @ts-ignore
import window from "global/window";
import Antenna from "iotex-antenna/lib";
import {fromRau} from "iotex-antenna/lib/account/utils";
import {SignerPlugin, StakeCreateMethod} from "iotex-antenna/lib/action/method";
import {StakeCreate} from "iotex-antenna/lib/action/types";
import {WsSignerPlugin} from "iotex-antenna/lib/plugin/ws";
import {
  IReadStakingDataMethodName,
  IReadStakingDataMethodToBuffer,
  IReadStakingDataRequestToBuffer
} from "iotex-antenna/lib/rpc-method/types";
import {VoteBucket, VoteBucketList} from "iotex-antenna/protogen/proto/types/state_data_pb";
import isBrowser from "is-browser";
// @ts-ignore
import JsonGlobal from "safe-json-globals/get";
import sleepPromise from "sleep-promise";
import {WvSigner} from "./wv-signer";

const state = isBrowser && JsonGlobal("state");
const isIoPay = isBrowser && state.base.isIoPay;

export function getNativeStaking(): NativeStaking {
  // $FlowFixMe
  const injectedWindow: Window & { staking?: NativeStaking } = window;
  if (injectedWindow.staking) {
    return injectedWindow.staking;
  }
  const signer = isIoPay?new WvSigner(): new WsSignerPlugin("wss://local.iotex.io:64102");
  injectedWindow.staking = new NativeStaking({
      signer: signer
    }
  );
  return injectedWindow.staking;
}

export async function getIoPayAddress(): Promise<string> {
  const nativeStaking = getNativeStaking();
  if (isIoPay) {
    // tslint:disable-next-line:no-unnecessary-local-variable
    const address = await nativeStaking.getIoPayAddress();
    return address;
  }
  const account = nativeStaking.antenna.iotx.accounts[0];
  return (account && account.address) || "";
}

export type Bucket = {
  index: number;
  owner: string;
  candidate: string;
  stakedAmount: string;
  stakeStartTime: Date | undefined;
  stakedDuration: number;
  autoStake: boolean;
  unstakeStartTime: Date | undefined;
};

function toBuckets(buffer: Buffer | {}): Array<Bucket> {
  // @ts-ignore
  const buckets = VoteBucketList.deserializeBinary(buffer);
  return buckets.getBucketsList().map((b: VoteBucket) => {
    const sTime = b.getStakestarttime();
    const uTime = b.getUnstakestarttime();
    return {
      index: b.getIndex(),
      owner: b.getOwner(),
      candidate: b.getCandidateaddress(),
      stakedAmount: b.getStakedamount(),
      stakeStartTime: sTime && sTime.toString()? sTime.toDate(): undefined,
      stakedDuration: b.getStakedduration(),
      autoStake: b.getAutostake(),
      unstakeStartTime: uTime && uTime.toString()? uTime.toDate(): undefined
    };
  });
}

export class NativeStaking {
  antenna: Antenna;
  ioPayAddress: string;
  reqId: number;

  constructor({ signer }: { signer?: SignerPlugin }) {
    this.antenna = new Antenna("https://api.testnet.iotex.one", { signer });
    // tslint:disable-next-line:insecure-random
    this.reqId = Math.round(Math.random() * 10000);
  }

  async getHeight(): Promise<string> {
    const res = await this.antenna.iotx.getChainMeta({});
    return res.chainMeta.height;
  }

  async getBucketsByVoter(
    voterAddr: string,
    offset: number,
    limit: number,
    height: string = ""
  ): Promise<Array<Bucket>> {
    const state = await this.antenna.iotx.readState({
      protocolID: Buffer.from("staking"),
      methodName: IReadStakingDataMethodToBuffer({
        method: IReadStakingDataMethodName.BUCKETS_BY_VOTER
      }),
      arguments: [
        IReadStakingDataRequestToBuffer({
          bucketsByVoter: {
            voterAddress: voterAddr,
            pagination: { offset, limit }
          }
        })
      ],
      height
    });
    return toBuckets(state.data);
  }

  public async createStake(req: StakeCreate): Promise<string> {
    const address = await this.getIoPayAddress();
    const sender = await this.antenna.iotx.tryGetAccount(address);

    return new StakeCreateMethod(this.antenna.iotx, sender, req, {
      signer: this.antenna.iotx.signer
    }).execute();
  }


  async getIoPayAddress(): Promise<string> {
    window.console.log("getIoPayAddress start");
    if( this.antenna.iotx.signer instanceof WsSignerPlugin) {
      return this.antenna.iotx.accounts[0].address;
    }
    if (this.ioPayAddress) {
      return this.ioPayAddress;
    }
    const id = this.reqId++;
    const req = {
      reqId: id,
      type: "GET_ACCOUNTS"
    };
    let sec = 1;
    // @ts-ignore
    while (!window.WebViewJavascriptBridge) {
      window.console.log(
        "getIoPayAddress get_account sleepPromise sec: ",
        sec
      );
      await sleepPromise(sec * 200);
      sec = sec * 1.6;
      if (sec >= 48) {
        sec = 48;
      }
    }
    return new Promise<string>(resolve =>
      // @ts-ignore
      window.WebViewJavascriptBridge.callHandler(
        "get_account",
        JSON.stringify(req),
        (responseData: string) => {
          window.console.log(
            "getIoPayAddress get_account responseData: ",
            responseData
          );
          let resp = { reqId: -1, address: "" };
          try {
            resp = JSON.parse(responseData);
          } catch (_) {
            return;
          }
          if (resp.reqId === id) {
            resolve(resp.address);
            this.ioPayAddress = resp.address;
          }
        }
      )
    );
  }

  async getIotxBalance(address: string): Promise<number> {
    const { accountMeta } = await this.antenna.iotx.getAccount({ address });
    if(accountMeta){
      return Number(fromRau(accountMeta.balance, "IOTX"));
    }
    return 0;
  }
}
