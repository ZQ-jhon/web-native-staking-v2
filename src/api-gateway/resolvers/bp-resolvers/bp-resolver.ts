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
    Ctx,
    Int,
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
class Context  {
  @Field(_ => String)
  userId?: string
  @Field(_ => String)
  @Field(_ => String)
  requestIp?: string
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
class BpCandidateTechDetailQuery {
  @Field(_ => String)
  parent: any
  @Field(_ => String)
  args: any
  @Field(_=> String)
  info: any
}

@ObjectType()
class BpCandidateTechDetail {
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
class BpCandidateDetail {
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
  @Field(_ => Int)
  blockRewardPortion: number | undefined
  @Field(_ => Int)
  epochRewardPortion: number | undefined
  @Field(_ => Int)
  foundationRewardPortion: number | undefined
  @Field(_ => String)
  rewardPlan: string
  @Field(_ => String)
  shareCardImage: string
  @Field(_ => String)
  tempEthAddress: string | undefined
  @Field(_ => String)
  registeredName: string
}

@ObjectType()
class BpCandidateRewardDistVal {
  @Field(_ => Int) 
  blockRewardPortion: number | undefined
  @Field(_ => Int)
  epochRewardPortion: number | undefined
  @Field(_ => Int)
  foundationRewardPortion : number | undefined
}

@ObjectType()
class BpCandidateList {
 @Field(_ => String)
 valStr: string
}

@ObjectType()
class TNewBpCandidate {
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
  @Field(_ => Int)
  annualReward?: number
  @Field(_ => String)
  badges?: Array<string>
  @Field(_ => String)
  tempEthAddress?: string
};

@ObjectType()
class  TBpCandidate extends TNewBpCandidate  {
  @Field(_ => String)
  rank: string
  @Field(_ => String)
  registeredName: string
  @Field(_ => String)
  liveVotes: string
  @Field(_ => String)
  liveVotesDelta: string
  status: "ELECTED" | "NOT_ELECTED" | "UNQUALIFIED";
  category: "CONSENSUS_DELEGATE" | "DELEGATE" | "DELEGATE_CANDIDATE";
  serverStatus: TServerStatus;
  @Field(_ => String)
  percent: string
  @Field(_ => Int)
  blockRewardPortion: number
  @Field(_ => Int)
  epochRewardPortion: number
  @Field(_ => Int)
  founationRewardPortion: number
  @Field(_ => Int)
  annualReward: number
  @Field(_ => String)
  badges: Array<string>
  @Field(_ => String)
  createAt: string
  @Field(_ => String)
  updateAt: string
};

@Resolver()
export class BPResolver {
  @Query(_ => BpCandidateTechDetail)
  public async bpCandidateTechDetail(
    @Ctx() context: Context,
  ): Promise<BpCandidateTechDetail> {
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
  
  @Query(_ => BpCandidateList)
  public async bpCandidates(
    @Ctx() context: Context
  ): Promise <BpCandidateList> {
    // @ts-ignore
    const valStr = await context.model.cache.get(`bpCandidates_${config.env}`);
    return JSON.parse(valStr);
  }
  
  @Query(_ => BpCandidateDetail)
  public async bpCandidate(
    @Args() { args }: BpCandidateTechDetailQuery,
    @Ctx() context: Context
  ): Promise <BpCandidateDetail> {
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
  
  @Mutation(_ => TBpCandidate)
  async upsertBpCandidate(
    @Args() { args }: BpCandidateTechDetailQuery,
    @Ctx() context: Context
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
  
  @Mutation(_ => TBpCandidate)
  async upsertBpCandidateTechDetail(
    @Args() { args }: BpCandidateTechDetailQuery,
    @Ctx() context: Context
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
  
  @Query(_ => BpCandidateRewardDistVal)
  async bpCandidateRewardDistribution(
    @Ctx() context: Context
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
  
  // @Query(_ => [])
  // async bpCandidatesOnContract(
  //   @Args() { args }: BpCandidateTechDetailQuery,
  //   @Ctx() context: Context
  // ){
  //   const {
  //     gateways: { nameRegistrationContract }
  //   } = context;
  //   const [allCandidates = [], blacklist] = await Promise.all([
  //     await nameRegistrationContract.getAllCandidatesCache(),
  //     await context.model.adminSettings.get(BP_BLACKLIST)
  //   ]);
  //   if (blacklist && Array.isArray(blacklist) && Array.isArray(allCandidates)) {
  //     const { address } = args;
  //     // $FlowFixMe
  //     return allCandidates.filter(
  //       c =>
  //         blacklist.indexOf(c.name) === -1 &&
  //         blacklist.indexOf(c.address) === -1 &&
  //         (!address || address === c.address)
  //     );
  //   }
  //   return allCandidates;
  // }
}

async function getUserEthAddress(context: Context): Promise<string> {
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
