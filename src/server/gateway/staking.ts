import Antenna from "iotex-antenna/lib";
import {fromRau} from "iotex-antenna/lib/account/utils";
import {
  CandidateRegisterMethod,
  CandidateUpdateMethod,
  SignerPlugin,
  StakeAddDepositMethod,
  StakeChangeCandidateMethod,
  StakeCreateMethod,
  StakeRestakeMethod,
  StakeTransferOwnershipMethod,
  StakeUnstakeMethod,
  StakeWithdrawMethod
} from "iotex-antenna/lib/action/method";
import {
  CandidateRegister,
  CandidateUpdate,
  StakeAddDeposit,
  StakeChangeCandidate,
  StakeCreate,
  StakeRestake,
  StakeTransferOwnership,
  StakeUnstake,
  StakeWithdraw
} from "iotex-antenna/lib/action/types";
import {WsSignerPlugin} from "iotex-antenna/lib/plugin/ws";
import {
  IReadStakingDataMethodName,
  IReadStakingDataMethodToBuffer,
  IReadStakingDataRequestToBuffer
} from "iotex-antenna/lib/rpc-method/types";
import {
  CandidateListV2,
  CandidateV2,
  VoteBucket,
  VoteBucketList
} from "iotex-antenna/protogen/proto/types/state_data_pb";
import sleepPromise from "sleep-promise";

type Candidate = {
  name: string;
  ownerAddress: string;
  operatorAddress: string;
  rewardAddress: string;
  selfStakeBucketIdx: number;
  selfStakingTokens: string;
  totalWeightedVotes: string;
};

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

function toCandidates(buffer: Buffer | {}): Array<Candidate> {
  // @ts-ignore
  const v2 = CandidateListV2.deserializeBinary(buffer);
  return v2.getCandidatesList().map((v: CandidateV2) => ({
    name: v.getName(),
    ownerAddress: v.getOwneraddress(),
    operatorAddress: v.getOperatoraddress(),
    rewardAddress: v.getRewardaddress(),
    selfStakeBucketIdx: v.getSelfstakebucketidx(),
    selfStakingTokens: v.getSelfstakingtokens(),
    totalWeightedVotes: v.getTotalweightedvotes()
  }));
}

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
      stakeStartTime: sTime && sTime.toDate(),
      stakedDuration: b.getStakedduration(),
      autoStake: b.getAutostake(),
      unstakeStartTime: uTime && uTime.toDate()
    };
  });
}

export class Staking {
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

  async getCandidate(
    candName: string,
    height: string = ""
  ): Promise<Array<Candidate>> {
    const state = await this.antenna.iotx.readState({
      protocolID: Buffer.from("staking"),
      methodName: IReadStakingDataMethodToBuffer({
        method: IReadStakingDataMethodName.CANDIDATE_BY_NAME
      }),
      arguments: [
        IReadStakingDataRequestToBuffer({
          candidateByName: { candName }
        })
      ],
      height
    });
    return toCandidates(state.data);
  }

  async getAllCandidates(
    offset: number,
    limit: number,
    height: string = ""
  ): Promise<Array<Candidate>> {
    const state = await this.antenna.iotx.readState({
      protocolID: Buffer.from("staking"),
      methodName: IReadStakingDataMethodToBuffer({
        method: IReadStakingDataMethodName.CANDIDATES
      }),
      arguments: [
        IReadStakingDataRequestToBuffer({
          candidates: {
            candName: "",
            pagination: { offset, limit }
          }
        })
      ],
      height
    });
    return toCandidates(state.data);
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

  async getBucketsByCandidate(
    candName: string,
    offset: number,
    limit: number,
    height: string = ""
  ): Promise<Array<Bucket>> {
    const state = await this.antenna.iotx.readState({
      protocolID: Buffer.from("staking"),
      methodName: IReadStakingDataMethodToBuffer({
        method: IReadStakingDataMethodName.BUCKETS_BY_CANDIDATE
      }),
      arguments: [
        IReadStakingDataRequestToBuffer({
          bucketsByCandidate: {
            candName,
            pagination: { offset, limit }
          }
        })
      ],
      height
    });
    return toBuckets(state.data);
  }

  async getAllBuckets(
    offset: number,
    limit: number,
    height: string = ""
  ): Promise<Array<Bucket>> {
    const state = await this.antenna.iotx.readState({
      protocolID: Buffer.from("staking"),
      methodName: IReadStakingDataMethodToBuffer({
        method: IReadStakingDataMethodName.BUCKETS
      }),
      arguments: [
        IReadStakingDataRequestToBuffer({
          buckets: {
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

  public async unstake(req: StakeUnstake): Promise<string> {
    const sender = await this.antenna.iotx.tryGetAccount(
      this.antenna.iotx.accounts[0].address
    );

    return new StakeUnstakeMethod(this.antenna.iotx, sender, req, {
      signer: this.antenna.iotx.signer
    }).execute();
  }

  public async withdraw(req: StakeWithdraw): Promise<string> {
    const sender = await this.antenna.iotx.tryGetAccount(
      this.antenna.iotx.accounts[0].address
    );

    return new StakeWithdrawMethod(this.antenna.iotx, sender, req, {
      signer: this.antenna.iotx.signer
    }).execute();
  }

  public async addDeposit(req: StakeAddDeposit): Promise<string> {
    const sender = await this.antenna.iotx.tryGetAccount(
      this.antenna.iotx.accounts[0].address
    );

    return new StakeAddDepositMethod(this.antenna.iotx, sender, req, {
      signer: this.antenna.iotx.signer
    }).execute();
  }

  public async restake(req: StakeRestake): Promise<string> {
    const sender = await this.antenna.iotx.tryGetAccount(
      this.antenna.iotx.accounts[0].address
    );

    return new StakeRestakeMethod(this.antenna.iotx, sender, req, {
      signer: this.antenna.iotx.signer
    }).execute();
  }

  public async changeCandidate(req: StakeChangeCandidate): Promise<string> {
    const sender = await this.antenna.iotx.tryGetAccount(
      this.antenna.iotx.accounts[0].address
    );

    return new StakeChangeCandidateMethod(this.antenna.iotx, sender, req, {
      signer: this.antenna.iotx.signer
    }).execute();
  }

  public async transferOwnership(req: StakeTransferOwnership): Promise<string> {
    const sender = await this.antenna.iotx.tryGetAccount(
      this.antenna.iotx.accounts[0].address
    );

    return new StakeTransferOwnershipMethod(this.antenna.iotx, sender, req, {
      signer: this.antenna.iotx.signer
    }).execute();
  }

  public async registerCandidate(req: CandidateRegister): Promise<string> {
    const sender = await this.antenna.iotx.tryGetAccount(
      this.antenna.iotx.accounts[0].address
    );

    return new CandidateRegisterMethod(this.antenna.iotx, sender, req, {
      signer: this.antenna.iotx.signer
    }).execute();
  }

  public async updateCandidate(req: CandidateUpdate): Promise<string> {
    const sender = await this.antenna.iotx.tryGetAccount(
      this.antenna.iotx.accounts[0].address
    );

    return new CandidateUpdateMethod(this.antenna.iotx, sender, req, {
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
