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
