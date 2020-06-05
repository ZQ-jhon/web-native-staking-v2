/* eslint-disable */
// @flow
import { AuthenticationError } from "apollo-server-koa";
import {
    Args,
    ArgsType,
    Field,
    Mutation,
    Query,
    Resolver,
    ObjectType,
  } from "type-graphql";
  //import { Gateways, setGateways } from "../../../server/gateway/gateway";
  import { cdnImg } from "../../../shared/common/cdn-img";
  import { getPermyriadValue } from "../../../server/gateway/web3";
  import { BP_BLACKLIST } from "../../../constant/admin-setting-constant";
  // $FlowFixMe
  //import { TBpCandidate, TResolverCtx } from "../../../types/global";
  import { BpCandidateModel } from "../../../model/bp-candidate-model";
  import { CandidatesHistoryModel } from "../../../model/candidates-history-model";
  import { VotesHistoryModel } from "../../../model/votes-history-model";
  import { VotedStakesHistoryModel } from "../../../model/voted-stakes-history-model";
  import { BadgeModel } from "../../../model/badge-model"
  import { MemberModel } from "../../../model/member-model"
  import { GiveawayModel } from "../../../model/giveaway-model"
  import { StakingReferralModel } from "../../../model/staking-referral-model"
  import { AdminSettingsModel } from "../../../model/admin-settings-model"
  import { IotxAirdropModel } from "../../../model/iotx-airdrop-model"
  import { PollModel } from "../../../model/poll-model"
  import { CacheModel } from "../../../model/cache-model"
  import {
    NameRegistrationContract,
    StakingContract,
    DelegateProfileContract,
    PollManager,
  } from "../../../server/gateway/web3";
import { Ranking } from "../../../server/gateway/ranking/ranking";
import { IotexCore } from "../../../server/gateway/iotex-core";
import { OnefxAuth } from "../../../shared/onefx-auth/onefx-auth";
import { IotexMono } from "../../../server/gateway/iotex-mono";
import { BpServerStatus } from "../../../server/gateway/bp-server-status";
import { IotxAirdrop } from "../../../server/gateway/iotx-airdrop";
import { Mailchimp } from "../../../server/gateway/mailchimp"
import { ReadState } from "../../../server/gateway/readstate/readstate"

export type TServerStatus = "ONLINE" | "OFFLINE" | "NOT_EQUIPPED" | "CHECKING";


@ObjectType()
class TResolverCtx  {
  @Field(_ => String)
  userId?: string
  @Field(_ => String)
  requestIp?: string;
  @Field(_ => String)
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

@ArgsType()
class BpCandidateTechDetail {
  @Field(_ => String)
  _parent: any
  @Field(_ => String)
  parent: any
  @Field(_ => String)
  _args: any
  @Field(_ => String)
  args: any
  @Field(_ => String)
  context: TResolverCtx
  @Field(_=> String)
  _info: any
  @Field(_=> String)
  info: any
}

@ObjectType()
class BpCandidateTechDetailList {
  @Field(_ => String)
  serverEndpoint: string
  @Field(_ => String)
  discordName: string
  @Field(_ => String)
  email: string
  @Field(_ => String)
  serverHealthEndpoint: string
}

 @ObjectType()
 class BpCandidatesValues {
  @Field(_ => String)
  valStr: string
}

@ObjectType() 
class BpCandidatesValue {
  @Field(_ => String)
  rank: string
  @Field(_ => String)
  name: string
  @Field(_ => String)
  blurb: string
  @Field(_ => String)
  website: string
  @Field(_ => String)
  logo: string
  @Field(_ => String)
  bannerUrl: string
  @Field(_ => String)
  socialMedia: Array<string>
  @Field(_ => String)
  location: string
  @Field(_ => String)
  introduction: string
  @Field(_ => String)
  team: string
  @Field(_ => String)
  techSetup: string
  @Field(_ => String)
  communityPlan: string
  blockRewardPortion: number | undefined
  epochRewardPortion: number | undefined
  foundationRewardPortion: number | undefined
  rewardPlan: string
  @Field(_ => String)
  shareCardImage: string
  @Field(_ => String)
  tempEthAddress: string | undefined
  @Field(_ => String)
  registeredName: string
}

@ObjectType()
 class  TNewBpCandidate {
  @Field(_ => String)
  rank: string
  @Field(_ => String)
  id: string
  @Field(_ => String)
  name: string
  @Field(_ => String)
  blurb: string
  @Field(_ => String)
  website: string
  @Field(_ => String)
  logo: string
  @Field(_ => String)
  bannerUrl: string
  @Field(_ => String)
  socialMedia: Array<string>;
  @Field(_ => String)
  location: string
  @Field(_ => String)
  introduction: string
  @Field(_ => String)
  team: string
  @Field(_ => String)
  techSetup: string
  @Field(_ => String)
  communityPlan: string
  @Field(_ => String)
  rewardPlan: string
  @Field(_ => String)
  shareCardImage: string
  @Field(_ => String)
  serverEndpoint: string
  @Field(_ => String)
  serverHealthEndpoint: string
  @Field(_ => String)
  discordName: string
  @Field(_ => String)
  email: string
  @Field(_ => Number)
  annualReward?: number
  badges?: Array<string>
  @Field(_ => String)
  tempEthAddress?: string
};

@ObjectType()
class BpCandidateRewardDistVal {
  blockRewardPortion: number | undefined
  epochRewardPortion: number | undefined
  foundationRewardPortion : number | undefined
}

@ObjectType()
class  TBpCandidate extends TNewBpCandidate  {
  @Field(_ => String)
  rank: string
  @Field(_ => String)
  registeredName: string
  @Field(_ => String)
  liveVotes: string
  liveVotesDelta: string
  @Field(_ => String)
  status: "ELECTED" | "NOT_ELECTED" | "UNQUALIFIED";
  category: "CONSENSUS_DELEGATE" | "DELEGATE" | "DELEGATE_CANDIDATE";
  serverStatus: TServerStatus;
  @Field(_ => String)
  percent: string
  @Field(_ => Number)
  blockRewardPortion: number;
  epochRewardPortion: number;
  founationRewardPortion: number;
  annualReward: number;
  badges: Array<string>
  createAt: string
  eth: string
};

@Resolver()
export class BpCandidatesTechResolver {
  @Query(_ => [BpCandidateTechDetailList])
  public async bpCandidateTechResolver(
    @Args() { context }: BpCandidateTechDetail,
  ): Promise<BpCandidateTechDetailList> {
    const {
      model: { bpCandidate }
    } = context;
    if (!context.userId) {
      throw new AuthenticationError("please login");
    }
    const eth = await getUserEthAddress(context);
    if (!eth) {
      throw new AuthenticationError("please login with metamask");
    }
    const found = await getBpCandidateByEth(eth, bpCandidate);
    if (!found) {
      // @ts-ignore
      return null;
    }
  
    return {
      // @ts-ignore
      serverEndpoint: found.serverEndpoint,
      discordName: found.discordName,
      email: found.email,
      serverHealthEndpoint: found.serverHealthEndpoint
    };
  }
  
  @Query(_ => [BpCandidatesValues])
  public async bpCandidates(
    // _parent: any,
    // _args: any,
    // context: TResolverCtx
    @Args() { context }: BpCandidateTechDetail,
  ): Promise <BpCandidatesValues> {
    // @ts-ignore
    const valStr = await context.model.cache.get(`bpCandidates_${config.env}`);
    return JSON.parse(valStr);
  }
  
  @Query(_ => [BpCandidateTechDetail])
  public async bpCandidate(
    // _parent: any,
    // args: any,
    // context: TResolverCtx
    @Args() { context, args }: BpCandidateTechDetail,
  ): Promise <BpCandidatesValue> {
    const {
      model: { bpCandidate },
      gateways: { delegateProfileContract, nameRegistrationContract }
    } = context;
    const blacklist = (await context.model.adminSettings.get(BP_BLACKLIST)) || [];
    let found;
    if (args.candidateProfileId) {
      if (blacklist.includes(args.candidateProfileId)) {
        // @ts-ignore
        return null;
      }
      found = await getBpCandidateById(args.candidateProfileId, bpCandidate);
    } else if (args.ioOperatorAddress) {
      // query by iotex address
      const regCandidate = await nameRegistrationContract.getCandidateByIoOperatorAddress(
        args.ioOperatorAddress
      );
      if (regCandidate) {
        found = await getBpCandidateByEth(regCandidate.address, bpCandidate);
      }
    } else {
      let eth = args.eth;
      if (!eth) {
        if (!context.userId) {
          // @ts-ignore
          return null;
        }
        const user = await context.auth.user.getById(context.userId);
        eth = await context.gateways.iotexMono.getLoginEthByIotexId(user.iotexId);
        if (!eth) {
          eth = user.eth;
          if (!eth) {
            // @ts-ignore
            return null;
          }
        }
      }
      found = await getBpCandidateByEth(eth, bpCandidate);
    }
    if (!found) {
      // @ts-ignore
      return null;
    }
    const [
      registeredName,
      { blockRewardPortion, epochRewardPortion, foundationRewardPortion }
    ] = await Promise.all([
      // @ts-ignore
      nameRegistrationContract.getNameCache(found.tempEthAddress),
      getBpCandidateRewardDistribution(
        delegateProfileContract,
        found.tempEthAddress
      )
    ]);
  
    if (blacklist.includes(registeredName)) {
      // @ts-ignore
      return null;
    }
    return {
      // @ts-ignore
      rank: ranksByEth[lowercase(found.tempEthAddress)],
      name: found.name,
      blurb: found.blurb,
      website: found.website,
      logo: cdnImg(found.logo),
      bannerUrl: cdnImg(found.bannerUrl),
      socialMedia: found.socialMedia,
      location: found.location,
      introduction: found.introduction,
      team: found.team,
      techSetup: found.techSetup,
      communityPlan: found.communityPlan,
      blockRewardPortion,
      epochRewardPortion,
      foundationRewardPortion,
      rewardPlan: found.rewardPlan,
      shareCardImage: found.shareCardImage,
      tempEthAddress: found.tempEthAddress,
      registeredName
    };
  }
  
  @Mutation(_ => [TBpCandidate])
  async upsertBpCandidate(
    // _parent: any,
    // args: any,
    // context: TResolverCtx,
    // _info: any
    @Args() { context, args }: BpCandidateTechDetail,
  ): Promise<TBpCandidate> {
    if (!context.userId) {
      throw new AuthenticationError("please login");
    }
    const eth = await getUserEthAddress(context);
    if (!eth) {
      throw new AuthenticationError("please login with metamask");
    }
  
    return await context.model.bpCandidate.findOneAndUpdate(
      {
        ...args.bpCandidateInput,
        tempEthAddress: eth
      },
      eth
    );
  }
  
  @Mutation(_ => [TBpCandidate])
  async upsertBpCandidateTechDetail(
    // _parent: any,
    // args: any,
    // context: TResolverCtx,
    // _info: any
    @Args() { context, args }: BpCandidateTechDetail,
  ): Promise<TBpCandidate> {
    if (!context.userId) {
      throw new AuthenticationError("please login");
    }
    const eth = await getUserEthAddress(context);
    if (!eth) {
      throw new AuthenticationError("please login with metamask");
    }
  
    return await context.model.bpCandidate.findOneAndUpdate(
      {
        ...args.bpCandidateTechDetailInput
      },
      eth
    );
  }
  
  @Query(_ => [BpCandidateRewardDistVal])
  async bpCandidateRewardDistribution(
    // _parent: any,
    // _args: any,
    // context: TResolverCtx,
    // _info: any
    @Args() { context }: BpCandidateTechDetail,
  ): Promise<BpCandidateRewardDistVal>{
    const {
      model: { bpCandidate },
      gateways: { delegateProfileContract }
    } = context;
    if (!context.userId) {
      throw new AuthenticationError("please login");
    }
    const eth = await getUserEthAddress(context);
    if (!eth) {
      throw new AuthenticationError("please login with metamask");
    }
    const found = await getBpCandidateByEth(eth, bpCandidate);
    if (!found) {
      // @ts-ignore
      return null;
    }
    return getBpCandidateRewardDistribution(delegateProfileContract, eth);
  }
  
  @Query(_ => [BpCandidateTechDetail])
  async bpCandidatesOnContract(
    // _parent: any,
    // args: any,
    // context: TResolverCtx,
    // _info: any
    @Args() { context, args}: BpCandidateTechDetail,
  ){
    const {
      gateways: { nameRegistrationContract }
    } = context;
    const [allCandidates = [], blacklist] = await Promise.all([
      await nameRegistrationContract.getAllCandidatesCache(),
      await context.model.adminSettings.get(BP_BLACKLIST)
    ]);
    if (blacklist && Array.isArray(blacklist) && Array.isArray(allCandidates)) {
      const { address } = args;
      // $FlowFixMe
      return allCandidates.filter(
        c =>
          blacklist.indexOf(c.name) === -1 &&
          blacklist.indexOf(c.address) === -1 &&
          (!address || address === c.address)
      );
    }
    return allCandidates;
  }


}

async function getUserEthAddress(context: TResolverCtx): Promise<string> {
  // @ts-ignore
  const user = await context.auth.user.getById(context.userId);
  let eth = await context.gateways.iotexMono.getLoginEthByIotexId(user.iotexId);
  if (!eth) {
    eth = user.eth;
  }
  return eth;
}

async function getBpCandidateByEth(
  eth: string,
  bpCandidate: BpCandidateModel
  // @ts-ignore
): Promise<?TBpCandidate> {
  return await bpCandidate.findOne(eth);
}

async function getBpCandidateById(
  id: string,
  bpCandidate: BpCandidateModel
  // @ts-ignore
): Promise<?TBpCandidate> {
  return await bpCandidate.findOneById(id);
}

async function getBpCandidateRewardDistribution(
  delegateProfileContract: any,
  eth: any
) {
  let blockRewardPortion;
  let epochRewardPortion;
  let foundationRewardPortion;
  try {
    const contractProfile = await delegateProfileContract.getProfiles(eth);
    blockRewardPortion =
      getPermyriadValue(contractProfile, "blockRewardPortion") || 0;
    epochRewardPortion =
      getPermyriadValue(contractProfile, "epochRewardPortion") || 0;
    foundationRewardPortion =
      getPermyriadValue(contractProfile, "foundationRewardPortion") || 0;
  } catch (e) {
    // logger.warn(`failed to fetch reward distributions ${e}`);
  }
  return {
    blockRewardPortion,
    epochRewardPortion,
    foundationRewardPortion
  };
}
