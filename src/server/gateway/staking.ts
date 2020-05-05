import Antenna from "iotex-antenna/lib";
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

type Candidate = {
  name: string;
  ownerAddress: string;
  operatorAddress: string;
  rewardAddress: string;
  selfStakeBucketIdx: number;
  selfStakingTokens: string;
  totalWeightedVotes: string;
};

type Bucket = {
  index: number;
  owner: string;
  candidate: string;
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
      stakeStartTime: sTime && sTime.toDate(),
      stakedDuration: b.getStakedduration(),
      autoStake: b.getAutostake(),
      unstakeStartTime: uTime && uTime.toDate()
    };
  });
}

export class Staking {
  antenna: Antenna;

  constructor() {
    this.antenna = new Antenna("https://api.nightly-cluster-2.iotex.one");
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
}
