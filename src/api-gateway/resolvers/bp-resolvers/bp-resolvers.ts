/* eslint-disable */
// @flow
import { AuthenticationError } from "apollo-server-koa";
import BigNumber from "bignumber.js";
// $FlowFixMe
import { logger } from "onefx/lib/integrated-gateways/logger";
// $FlowFixMe
import partition from "lodash.partition";
import { ICandidate, TBpCandidate, TResolverCtx } from "../../../types/global";
import { BpCandidateModel } from "../../../model/bp-candidate-model";
import {
  decodeCandidateHexName,
  WeiToTokenBN
} from "../../../shared/common/token-utils";
import { lowercase } from "../../../shared/common/lowercase";
import { BP_BLACKLIST } from "../../../constant/admin-setting-constant";
import { getPermyriadValue } from "../../../server/gateway/web3";
import { getAndAddProductivityFn } from "./productivity";
import { cdnImg } from "../../../shared/common/cdn-img";
import { isIotexAddressValid } from "../../../shared/common/is-iotex-address-valid";
import config from "config";

// function addMinutes(date, minutes) {
//   return new Date(date.getTime() + minutes * 60000);
// }

function getStatus(
  liveVotes: string,
  selfStaking: string,
  operatorAddr: string,
  rewardAddr: string
) {
  if (
    parseInt(selfStaking || '0', 10) < 1200000 ||
    !isIotexAddressValid(operatorAddr) ||
    !isIotexAddressValid(rewardAddr)
  ) {
    return "UNQUALIFIED";
  }
  if (parseInt(liveVotes || '0', 10) < 2000000) {
    return "NOT_ELECTED";
  }
  return "ELECTED";
}

const ranksByEth = {};

function sortAndCacheRanking(bps: any): void {
  if (Array.isArray(bps) && bps.length > 1) {
    bps.sort((v1, v2) => {
      return new BigNumber(v2.liveVotes || 0)
        .minus(v1.liveVotes || 0)
        .toNumber();
    });

    bps = bps.filter(Boolean);
    const [allDelegates, candidates] = partition(
      bps,
      i => i.status === "ELECTED"
    );

    const [consensusDelegates, delegates] = partition(
      allDelegates,
      i => i.category === "CONSENSUS_DELEGATE"
    );

    delegates.map(bp => (bp.category = "DELEGATE"));
    candidates.map(bp => (bp.category = "DELEGATE_CANDIDATE"));

    bps = [...consensusDelegates, ...delegates, ...candidates];

    // cache ranking
    for (let i = 0; i < bps.length; i++) {
      const rank = i + 1;
      // @ts-ignore
      ranksByEth[lowercase(bps[i].tempEthAddress)] = rank;
      bps[i].rank = rank;
    }
  }
}

export async function bpCandidates(
  _parent: any,
  _args: any,
  context: TResolverCtx
) {
  // @ts-ignore
  const valStr = await context.model.cache.get(`bpCandidates_${config.env}`);
  return JSON.parse(valStr);
}

export async function refreshBpCandidates(
  parent: any,
  args: any,
  context: TResolverCtx,
  _info: any
) {
  const {
    gateways: { nameRegistrationContract, delegateProfileContract }
  } = context;
  const {
    rankingMeta,
    lastRankingCandidatesByEth,
    rankingCandidatesByEth,
    probationCandidateList
  } = await getCandidatesResponses(context);

  // $FlowFixMe
  let bps = (await context.model.bpCandidate.findAll()) || [];
  // populate bps from rankingCandidates
  await populateBps({
    bps,
    rankingCandidatesByEth,
    lastRankingCandidatesByEth,
    nameRegistrationContract,
    delegateProfileContract,
    rankingMeta,
    gateways: context.gateways,
    model: context.model
  });

  const blacklist = (await context.model.adminSettings.get(BP_BLACKLIST)) || [];
  // $FlowFixMe
  bps = bps.filter(
    // @ts-ignore
    bp => bp.registeredName && blacklist.indexOf(bp.registeredName) === -1 // don't show if no name // don't show if in blacklist
  );

  // bp productivity
  try {
    (await getAndAddProductivityFn(parent, args, context))(bps);
  } catch (err) {
    logger.warn(`partial downgrade: failed to getAndAddProductivityFn: ${err}`);
  }

  addProbation({ bps, probationCandidateList });

  sortAndCacheRanking(bps);
  const whitelist =
    (await context.model.adminSettings.get("bp-whitelist")) || [];
  // @ts-ignore
  for (const bp: TBpCandidate of bps) {
    if (bp.registeredName && whitelist.indexOf(bp.registeredName) !== -1) {
      bp.serverStatus = "ONLINE";
    }
  }
  const cacheVal = JSON.stringify(bps);
  // @ts-ignore
  await context.model.cache.put(`bpCandidates_${config.env}`, cacheVal);
  return bps;
}

async function populateBps({
  bps,
  rankingCandidatesByEth,
  lastRankingCandidatesByEth,
  nameRegistrationContract,
  delegateProfileContract,
  rankingMeta,
  gateways,
  model
}: any) {
  await Promise.all(
    // @ts-ignore
    bps.map(async bp => {
      const ethLower = lowercase(bp.tempEthAddress);
      const rankingCandidate = rankingCandidatesByEth[ethLower];
      const lastRankingCandidate = lastRankingCandidatesByEth[ethLower];
      const [
        registeredName,
        // @ts-ignore
        { status: serverStatus, nodeVersion } = {},
        { blockRewardPortion, epochRewardPortion, foundationRewardPortion }
      ] = await Promise.all([
        nameRegistrationContract.getNameCache(ethLower),
        gateways.bpServerStatus.readThroughPingCache(bp.serverHealthEndpoint),
        getBpCandidateRewardDistribution(
          delegateProfileContract,
          bp.tempEthAddress
        )
      ]);
      bp.registeredName = registeredName;
      bp.serverStatus = serverStatus;
      bp.blockRewardPortion = blockRewardPortion;
      bp.epochRewardPortion = epochRewardPortion;
      bp.foundationRewardPortion = foundationRewardPortion;
      bp.nodeVersion = nodeVersion;
      if (bp.badges && Array.isArray(bp.badges)) {
        // $FlowFixMe
        const badges = await model.badge.getBadges(bp.badges);
        // @ts-ignore
        bp.badges = badges.map(bg => bg.icon);
      } else {
        bp.badges = [];
      }
      if (rankingCandidate) {
        bp.operatorAddress = rankingCandidate.operatorAddress;
        if (rankingCandidate.badges) {
          // $FlowFixMe
          bp.badges.push("hermes");
        }
        // override registeredName
        bp.registeredName = decodeCandidateHexName(rankingCandidate.name);
        bp.liveVotes = WeiToTokenBN(
          rankingCandidate.totalWeightedVotes
        ).toFixed(0);
        const lastLiveVote = lastRankingCandidate
          ? WeiToTokenBN(lastRankingCandidate.totalWeightedVotes).toFixed(0)
          : 0;
        bp.liveVotesDelta = new BigNumber(bp.liveVotes)
          .minus(lastLiveVote)
          .toFixed(0);
        bp.status = getStatus(
          bp.liveVotes,
          WeiToTokenBN(rankingCandidate.selfStakingTokens).toFixed(0),
          rankingCandidate.operatorAddress,
          rankingCandidate.rewardAddress
        );
        bp.percent = new BigNumber(bp.liveVotes)
          .dividedBy(rankingMeta.totalVotes)
          .multipliedBy(100)
          .toFixed(1);
      }
    })
  );
}

export async function bpCandidatesOnContract(
  _parent: any,
  args: any,
  context: TResolverCtx,
  _info: any
) {
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

async function getBpCandidateById(
  id: string,
  bpCandidate: BpCandidateModel
  // @ts-ignore
): Promise<?TBpCandidate> {
  return await bpCandidate.findOneById(id);
}

async function getBpCandidateByEth(
  eth: string,
  bpCandidate: BpCandidateModel
  // @ts-ignore
): Promise<?TBpCandidate> {
  return await bpCandidate.findOne(eth);
}

export async function bpCandidate(
  _parent: any,
  args: any,
  context: TResolverCtx
) {
  const {
    model: { bpCandidate },
    gateways: { delegateProfileContract, nameRegistrationContract }
  } = context;
  const blacklist = (await context.model.adminSettings.get(BP_BLACKLIST)) || [];
  let found;
  if (args.candidateProfileId) {
    if (blacklist.includes(args.candidateProfileId)) {
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
        return null;
      }
      const user = await context.auth.user.getById(context.userId);
      eth = await context.gateways.iotexMono.getLoginEthByIotexId(user.iotexId);
      if (!eth) {
        eth = user.eth;
        if (!eth) {
          return null;
        }
      }
    }
    found = await getBpCandidateByEth(eth, bpCandidate);
  }
  if (!found) {
    return null;
  }
  const [
    registeredName,
    { blockRewardPortion, epochRewardPortion, foundationRewardPortion }
  ] = await Promise.all([
    nameRegistrationContract.getNameCache(found.tempEthAddress),
    getBpCandidateRewardDistribution(
      delegateProfileContract,
      found.tempEthAddress
    )
  ]);

  if (blacklist.includes(registeredName)) {
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

async function getUserEthAddress(context: TResolverCtx): Promise<string> {
  const user = await context.auth.user.getById(context.userId);
  let eth = await context.gateways.iotexMono.getLoginEthByIotexId(user.iotexId);
  if (!eth) {
    eth = user.eth;
  }
  return eth;
}

export async function bpCandidateTechDetail(
  _parent: any,
  _args: any,
  context: TResolverCtx,
  _info: any
) {
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
    return null;
  }

  return {
    serverEndpoint: found.serverEndpoint,
    discordName: found.discordName,
    email: found.email,
    serverHealthEndpoint: found.serverHealthEndpoint
  };
}

export async function upsertBpCandidate(
  _parent: any,
  args: any,
  context: TResolverCtx,
  _info: any
) {
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

export async function bpCandidateRewardDistribution(
  _parent: any,
  _args: any,
  context: TResolverCtx,
  _info: any
) {
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
    return null;
  }
  return getBpCandidateRewardDistribution(delegateProfileContract, eth);
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

export async function upsertBpCandidateTechDetail(
  _parent: any,
  args: any,
  context: TResolverCtx,
  _info: any
) {
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

export async function getCandidatesResponses(context: TResolverCtx) {
  const {
    gateways: { iotexCore }
  } = context;

  const rankingMeta = await context.gateways.ranking.getMeta(iotexCore);
  const currentEpochNum = new BigNumber(rankingMeta.epoch.num)
    .minus(1)
    .toFixed(0);
  const candidatesResp = await context.gateways.ranking.getCandidates({
    startEpoch: currentEpochNum
  });

  const lastEpochNum = new BigNumber(rankingMeta.epoch.num).minus(2).toFixed(0);
  const lastEpochCandidatesResp = await context.gateways.ranking.getCandidates({
    startEpoch: lastEpochNum
  });

  const lastRankingCandidates: Array<ICandidate> =
    (lastEpochCandidatesResp && lastEpochCandidatesResp.candidates) || [];
  const lastRankingCandidatesByEth = lastRankingCandidates.reduce(
    (acc, cur) => {
      // @ts-ignore
      acc[`0x${lowercase(cur.address)}`] = cur;
      return acc;
    },
    {}
  );

  const rankingCandidates = (candidatesResp && candidatesResp.candidates) || [];
  // @ts-ignore
  const rankingCandidatesByEth = rankingCandidates.reduce((acc: any, cur: any) => {
    acc[`0x${lowercase(cur.address)}`] = cur;
    return acc;
  }, {});

  const probationCandidateList = await context.gateways.readstate.getProbationCandidateList(
    context,
    currentEpochNum
  );

  return {
    rankingMeta,
    lastRankingCandidatesByEth,
    rankingCandidatesByEth,
    probationCandidateList
  };
}

// @ts-ignore
function addProbation({ bps, probationCandidateList }) {
  if (probationCandidateList) {
    // @ts-ignore
    bps.map(bp => {
      // @ts-ignore
      const probation = probationCandidateList.probationList.find(probation => {
        return lowercase(probation.address) === lowercase(bp.operatorAddress);
      });
      bp.probation = probation;
    });
  }
}
