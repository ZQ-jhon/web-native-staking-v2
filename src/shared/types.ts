import {IEpochData} from "iotex-antenna/lib/rpc-method/types";

export type IGetMetaResponse = {
  height: number | string,
  totalCandidates: number,
  totalVotedStakes: number | string,
  totalVotes: number,
  epoch: IEpochData
};

export type IGetCandidateRequest = {
  startEpoch: number
};

export type Candidate = {
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
  stakeStartTime: Date | undefined;
  stakedDuration: number;
  autoStake: boolean;
  unstakeStartTime: Date | undefined;
};

export type ICandidate = Candidate & {
  address: string,
  badges: number
};

export type IGetCandidateResponse = {
  candidates: Array<ICandidate>
};

export type HermesDistribution = {
  delegateName: string
}
