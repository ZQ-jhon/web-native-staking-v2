import BigNumber from "bignumber.js";
import Antenna from "iotex-antenna/lib";
import { Account } from "iotex-antenna/lib/account/account";
import { fromRau } from "iotex-antenna/lib/account/utils";
import {
  CandidateRegisterMethod,
  CandidateUpdateMethod,
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
import { ownersToNames } from "../../shared/common/apollo-client";
import { getAntenna, getIoPayAddress } from "../../shared/common/get-antenna";

export type Candidate = {
  name: string;
  ownerAddress: string;
  operatorAddress: string;
  rewardAddress: string;
  selfStakeBucketIdx: number;
  selfStakingTokens: string;
  totalWeightedVotes: string;
};

export type IBucket = {
  index: number;
  owner: string;
  candidate: string;
  stakeStartTime: Date | undefined;
  stakedDuration: number;
  autoStake: boolean;
  unstakeStartTime: Date | undefined;
  createTime: Date | undefined;
  stakedAmount: BigNumber; // iotx
  selfStakingBucket: boolean;
  status: Status;
  withdrawWaitUntil: Date | undefined;

  canName: string;
  // TODO(tian): candName
  roleName?: string;
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

function toCandidate(buffer: Buffer | {}): Candidate {
  // @ts-ignore
  const v2 = CandidateV2.deserializeBinary(buffer);
  return {
    name: v2.getName(),
    ownerAddress: v2.getOwneraddress(),
    operatorAddress: v2.getOperatoraddress(),
    rewardAddress: v2.getRewardaddress(),
    selfStakeBucketIdx: v2.getSelfstakebucketidx(),
    selfStakingTokens: v2.getSelfstakingtokens(),
    totalWeightedVotes: v2.getTotalweightedvotes()
  };
}

function daysLater(p: Date, days: number): Date {
  const cur = new Date(p);
  cur.setDate(cur.getDate() + days);
  return cur;
}

function toBuckets(
  buffer: Buffer | {},
  candidates: Array<Candidate>
): Array<IBucket> {
  const selfStakingIndexes: Record<number, boolean> = {};
  candidates.forEach(candidate => {
    selfStakingIndexes[candidate.selfStakeBucketIdx] = true;
  });
  // @ts-ignore
  const buckets = VoteBucketList.deserializeBinary(buffer);
  return buckets.getBucketsList().map((b: VoteBucket) => {
    const sTime = b.getStakestarttime();
    const uTime = b.getUnstakestarttime();
    const cTime = b.getCreatetime();
    const stakeStartTime = sTime && sTime.toDate();
    const unstakeStartTime = uTime && uTime.toDate();
    const createTime = cTime && cTime.toDate();
    const withdrawWaitUntil =
      unstakeStartTime && daysLater(unstakeStartTime, 3);
    return {
      index: b.getIndex(),
      owner: b.getOwner(),
      candidate: b.getCandidateaddress(),
      stakeStartTime,
      stakedDuration: b.getStakedduration(),
      autoStake: b.getAutostake(),
      unstakeStartTime,
      createTime,
      stakedAmount: new BigNumber(fromRau(b.getStakedamount(), "Iotx")),
      selfStakingBucket: b.getIndex() in selfStakingIndexes,
      withdrawWaitUntil,
      status: getStatus(withdrawWaitUntil, unstakeStartTime, stakeStartTime),
      canName: ownersToNames[b.getCandidateaddress()]
    };
  });
}

export type Status =
  | "withdrawable"
  | "unstaking"
  | "staking"
  | "no_stake_starttime";

export function getStatus(
  withdrawWaitUntil?: Date,
  unstakeStartTime?: Date,
  stakeStartTime?: Date
): Status {
  const now = new Date();
  if (withdrawWaitUntil && withdrawWaitUntil > daysLater(new Date(0), 4)) {
    const date = new Date(withdrawWaitUntil);
    if (date <= now) {
      return "withdrawable";
    }
  }

  if (unstakeStartTime && unstakeStartTime > daysLater(new Date(0), 4)) {
    const date = new Date(unstakeStartTime);
    if (date <= now) {
      return "unstaking";
    }
  }

  if (stakeStartTime && stakeStartTime > daysLater(new Date(0), 4)) {
    return "staking";
  }

  return "no_stake_starttime";
}

export class Staking {
  antenna: Antenna;

  constructor({ antenna }: { antenna: Antenna }) {
    this.antenna = antenna;
  }

  async getHeight(): Promise<string> {
    const res = await this.antenna.iotx.getChainMeta({});
    return res.chainMeta.height;
  }

  async getCandidate(
    candName: string,
    height: string = ""
  ): Promise<Candidate> {
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
    return toCandidate(state.data);
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
  ): Promise<Array<IBucket>> {
    const [state, candidates] = await Promise.all([
      this.antenna.iotx.readState({
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
      }),
      this.getAllCandidates(0, 1000, height)
    ]);
    return toBuckets(state.data, candidates);
  }

  async getBucketsByCandidate(
    candName: string,
    offset: number,
    limit: number,
    height: string = ""
  ): Promise<Array<IBucket>> {
    const [state, candidates] = await Promise.all([
      this.antenna.iotx.readState({
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
      }),
      this.getCandidate(candName)
    ]);
    return toBuckets(state.data, [candidates]);
  }

  async getAllBuckets(
    offset: number,
    limit: number,
    height: string = ""
  ): Promise<Array<IBucket>> {
    const [state, candidates] = await Promise.all([
      this.antenna.iotx.readState({
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
      }),
      this.getAllCandidates(0, 999)
    ]);
    return toBuckets(state.data, candidates);
  }

  public async createStake(req: StakeCreate): Promise<string> {
    const sender = await this.getSender();
    return new StakeCreateMethod(this.antenna.iotx, sender, req, {
      signer: this.antenna.iotx.signer
    }).execute();
  }

  public async unstake(req: StakeUnstake): Promise<string> {
    const sender = await this.getSender();

    return new StakeUnstakeMethod(this.antenna.iotx, sender, req, {
      signer: this.antenna.iotx.signer
    }).execute();
  }

  public async withdraw(req: StakeWithdraw): Promise<string> {
    const sender = await this.getSender();

    return new StakeWithdrawMethod(this.antenna.iotx, sender, req, {
      signer: this.antenna.iotx.signer
    }).execute();
  }

  public async addDeposit(req: StakeAddDeposit): Promise<string> {
    const sender = await this.getSender();

    return new StakeAddDepositMethod(this.antenna.iotx, sender, req, {
      signer: this.antenna.iotx.signer
    }).execute();
  }

  public async restake(req: StakeRestake): Promise<string> {
    const sender = await this.getSender();

    return new StakeRestakeMethod(this.antenna.iotx, sender, req, {
      signer: this.antenna.iotx.signer
    }).execute();
  }

  public async changeCandidate(req: StakeChangeCandidate): Promise<string> {
    const sender = await this.getSender();

    return new StakeChangeCandidateMethod(this.antenna.iotx, sender, req, {
      signer: this.antenna.iotx.signer
    }).execute();
  }

  public async transferOwnership(req: StakeTransferOwnership): Promise<string> {
    const sender = await this.getSender();

    return new StakeTransferOwnershipMethod(this.antenna.iotx, sender, req, {
      signer: this.antenna.iotx.signer
    }).execute();
  }

  public async registerCandidate(req: CandidateRegister): Promise<string> {
    const sender = await this.getSender();

    return new CandidateRegisterMethod(this.antenna.iotx, sender, req, {
      signer: this.antenna.iotx.signer
    }).execute();
  }

  public async updateCandidate(req: CandidateUpdate): Promise<string> {
    const sender = await this.getSender();

    return new CandidateUpdateMethod(this.antenna.iotx, sender, req, {
      signer: this.antenna.iotx.signer
    }).execute();
  }

  private async getSender(): Promise<Account> {
    const address = await getIoPayAddress();
    // tslint:disable-next-line:no-unnecessary-local-variable
    const sender = await this.antenna.iotx.tryGetAccount(address);
    return sender;
  }
}

let staking: undefined | Staking;

export function getStaking(): Staking {
  if (staking) {
    return staking;
  }
  staking = new Staking({ antenna: getAntenna() });
  return staking;
}
