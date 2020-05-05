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

type ICandidate = {
  name: string;
  ownerAddress: string;
  operatorAddress: string;
  rewardAddress: string;
  selfStakeBucketIdx: number;
  selfStakingTokens: string;
  totalWeightedVotes: string;
};

type TBucket = {
  index: number;
  owner: string;
  candidate: string;
  stakeStartTime: Date | undefined;
  stakedDuration: number;
  autoStake: boolean;
  unstakeStartTime: Date | undefined;
};

export class Staking {
  antenna: Antenna;

  constructor() {
    this.antenna = new Antenna("https://api.nightly-cluster-2.iotex.one");
  }

  async getCandidate(candName: string): Promise<Array<ICandidate>> {
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
      height: undefined
    });
    // @ts-ignore
    const v2 = CandidateListV2.deserializeBinary(new Uint8Array(state.data));
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

  async getAllCandidates(
    offset: number,
    limit: number
  ): Promise<Array<ICandidate>> {
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
      height: undefined
    });
    // @ts-ignore
    const v2 = CandidateListV2.deserializeBinary(state.data);
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

  async getBucketsByVoter(
    voterAddr: string,
    offset: number,
    limit: number
  ): Promise<Array<TBucket>> {
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
      height: undefined
    });
    // @ts-ignore
    const buckets = VoteBucketList.deserializeBinary(state.data);
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
}
