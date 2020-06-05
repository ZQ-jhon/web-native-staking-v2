// @flow
//import type { BpCandidateModel } from "./model/bp-candidate-model";
//import type { CandidatesHistoryModel } from "./model/candidates-history-model";
//import type { VotesHistoryModel } from "./model/votes-history-model";
//import type { VotedStakesHistoryModel } from "./model/voted-stakes-history-model";
//import type { MemberModel } from "./model/member-model";
//import type { BadgeModel } from "./model/badge-model";
//import type { PollModel } from "./model/poll-model";
//import type { GiveawayModel } from "./model/giveaway-model";
//import type { StakingReferralModel } from "./model/staking-referral-model";
import {
  NameRegistrationContract,
  StakingContract,
  DelegateProfileContract,
  PollManager,
} from "./server/gateway/web3";
import { Ranking } from "./server/gateway/ranking/ranking";
import { IotexCore } from "./server/gateway/iotex-core";
import { OnefxAuth } from "./shared/onefx-auth";
import { IotexMono } from "./server/gateway/iotex-mono";
import { AdminSettingsModel } from "./model/admin-settings-model";
import { BpServerStatus } from "./server/gateway/bp-server-status";
import { IotxAirdropModel } from "./model/iotx-airdrop-model";
import { IotxAirdrop } from "./server/gateway/iotx-airdrop";
import { Mailchimp } from "./server/gateway/mailchimp";
import { CacheModel } from "./model/cache-model";
import { ReadState } from "./server/gateway/readstate/readstate";

type ReduxState = {
  base: object;
};

export type TResolverCtx = {
  userId?: string;
  requestIp?: string;
  session: any;
  model: {
    bpCandidate: BpCandidateModel;
    candidatesHistory: CandidatesHistoryModel;
    votesHistory: VotesHistoryModel;
    votedStakesHistory: VotedStakesHistoryModel;
    member: MemberModel;
    badge: BadgeModel;
    giveaway: GiveawayModel;
    stakingReferral: StakingReferralModel;
    adminSettings: AdminSettingsModel;
    iotxAirdrop: IotxAirdropModel;
    poll: PollModel;
    cache: CacheModel;
  };
  gateways: {
    ranking: Ranking;
    iotexCore: IotexCore;
    stakingContract: StakingContract;
    pollManager: PollManager;
    delegateProfileContract: DelegateProfileContract;
    faucetHandler: any;
    nameRegistrationContract: NameRegistrationContract;
    iotexMono: IotexMono;
    bpServerStatus: BpServerStatus;
    iotxAirdrop: IotxAirdrop;
    mailchimp: Mailchimp;
    config: any;
    readstate: ReadState;
  };
  auth: OnefxAuth;
};

export type TNewBpCandidate = {
  rank: string;
  id: string;
  name: string;
  blurb: string;
  website: string;
  logo: string;
  bannerUrl: string;
  socialMedia: Array<string>;
  location: string;
  introduction: string;
  team: string;
  techSetup: string;
  communityPlan: string;
  rewardPlan: string;
  shareCardImage: string;
  serverEndpoint: string;
  serverHealthEndpoint: string;
  discordName: string;
  email: string;
  annualReward?: number;

  badges?: Array<string>;
  tempEthAddress?: string;
};

export type TServerStatus = "ONLINE" | "OFFLINE" | "NOT_EQUIPPED" | "CHECKING";

export type TserverCache = {
  status: TServerStatus;
  nodeVersion: string;
};

export type TBpCandidate = TNewBpCandidate & {
  rank: string;
  registeredName: string;
  liveVotes: string;
  liveVotesDelta: string;
  status: "ELECTED" | "NOT_ELECTED" | "UNQUALIFIED";
  category: "CONSENSUS_DELEGATE" | "DELEGATE" | "DELEGATE_CANDIDATE";
  serverStatus: TServerStatus;
  percent: string;
  blockRewardPortion: number;
  epochRewardPortion: number;
  founationRewardPortion: number;
  annualReward: number;

  badges: Array<string>;

  createAt: string;
  updateAt: string;
  eth: string;
};

export type THistory = {
  ts: string;
  count: number;
};

export type Epoch = {
  num: string;
  height: string;
  gravityChainStartHeight: string;
};

export type IGetMetaResponse = {
  height: string;
  totalCandidates: number;
  totalVotedStakes: number;
  totalVotes: number;
  epoch: Epoch;
};

export type IGetCandidateRequest = {
  startEpoch: number;
};

export type ICandidate = {
  name: string;
  address: string;
  totalWeightedVotes: string;
  selfStakingTokens: string;
  operatorAddress: string;
  rewardAddress: string;
} & { badges: number };

export type IGetCandidateResponse = {
  candidates: Array<ICandidate>;
};

export type IGetBucketsByCandidateRequest = {
  name: string;
  startEpoch: number;
  epochCount?: number;
  offset?: number;
  limit?: number;
};

export type IBucket = {
  voter: string;
  votes: string;
  weightedVotes: string;
  remainingDuration: string;
  isNative: boolean;
};

export type IGetBucketsByCandidateResponse = {
  buckets: Array<IBucket>;
};

export type TMemberParticipantGiveaway = {
  giveawayId: string;
  tickets: number;
  ts?: String;
};

export type TMemberRewardRecord = {
  rewardType: string;
  amount: number;
  description: string;
};

export type TMember = {
  id: string;
  userId: string;
  membershipId: number;
  giveaways: Array<TMemberParticipantGiveaway>;
  createAt: string;
  name: string;
  avatar: string;
  badges: Array<string>;
  rewardRecord: Array<TMemberRewardRecord>;
};

export type TBadge = {
  id: string;
  icon: string;
  name: string;
  description: string;
};

export type TStakingReferral = {
  code: String;
  referralEthAddr: String;
  txHash: String;
};

export type IParticipantGiveaway = {
  userId: string;
  tickets: number;
};

export type IGiveaway = {
  id: string;
  imgUrl: string;
  description: string;
  type: string;
  instruction: string;
  expiredAt: string;
  sponsor: string;
  sponsorLink: string;
  participants: Array<IParticipantGiveaway>;
  winner: TMember;
  winnerNotice: string;
};

export type IFaucetRequest = {
  address: string;
  amount: number;
};

export type IFaucetResponse = {
  ok: boolean;
  memo: string;
  error: string;
};

export type TMemberParticipantGiveawayDetail = {
  giveawayId: IGiveaway;
  tickets: number;
  ts: String;
};

export type TJoinedGiveaway = {
  id: string;
  userId: string;
  membershipId: string;
  giveaways: Array<TMemberParticipantGiveawayDetail>;
  createAt: string;
  name: string;
  avatar: string;
  badges: Array<TBadge>;
  rewardRecord: Array<TMemberRewardRecord>;
};

export type ITestnetFaucet = {
  id: string;
  address: string;
  netType: string;
  githubId: string;
  createAt: string;
};

export type TPoll = {
  id: string;
  contractAddress: string;
  category: string;
  title: string;
  description: string;
  proposer: string;
  result: Array<Number>;
  start: Date;
  end: Date;
};

export type Poll = TPoll & {
  maxNumOfChoices: string;
  status: string;
  options: Array<{ id: string; description: string }>;
  votes: Array<{ voter: string; optionId: number; weight: number }>;
};

export type Info = {
  address: string;
  count: number;
};

export type ProbationCandidateList = {
  probationList: Array<Info>;
  intensityRate: number;
};
