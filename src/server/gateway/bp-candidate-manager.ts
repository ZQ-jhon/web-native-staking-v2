import BigNumber from "bignumber.js";
import {lowercase} from "../../shared/common/lowercase";
import {decodeCandidateHexName, WeiToTokenBN} from "../../shared/common/token-utils";
import {getPermyriadValue, getStatus} from "../../shared/common/value-utils";
import partition from "lodash.partition";

export const BP_BLACKLIST = "bp-blacklist";


export async function bpCandidateProductivities(
  parent: any,
  args: any,
  context: TResolverCtx
) {
  const epochNumber =
    args.epochNumber || (await context.gateways.iotexCore.getEpochNumber());
  const resp = await context.gateways.iotexCore.getEpochMeta({ epochNumber });
  return (resp && resp.blockProducersInfo) || [];
}

export async function getAndAddProductivityFn(
  parent: any,
  args: any,
  context: TResolverCtx
): Promise<Function> {
  const {
    gateways: { nameRegistrationContract }
  } = context;
  const [productivities, regCandidates] = await Promise.all([
    bpCandidateProductivities(parent, args, context),
    nameRegistrationContract.getAllCandidatesCache()
  ]);

  return function addProductivity(bps: any): void {
    for (const bp of bps) {
      const ethLower = lowercase(bp.tempEthAddress);
      const regCandidate =
        regCandidates.find(it => lowercase(it.address) === ethLower) || {};
      const productivity = productivities.find(
        it => lowercase(it.address) === regCandidate.ioOperatorAddr
      );
      if (productivity) {
        bp.productivity = (productivity && productivity.production) || 0;
        bp.productivityBase = (productivity && productivity.active && 30) || 0;
        bp.category = "CONSENSUS_DELEGATE";
      }
    }
  };
}

export class BpCandidateManager {

  // tslint:disable-next-line:no-any
  async getCandidatesResponses(context: TResolverCtx): Promise<any> {
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
        acc[`0x${lowercase(cur.address)}`] = cur;
        return acc;
      },
      {}
    );

    const rankingCandidates = (candidatesResp && candidatesResp.candidates) || [];
    const rankingCandidatesByEth = rankingCandidates.reduce((acc, cur) => {
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


  async populateBps(
    {
      bps,
      rankingCandidatesByEth,
      lastRankingCandidatesByEth,
      nameRegistrationContract,
      delegateProfileContract,
      rankingMeta,
      gateways,
      model
    }) {
    await Promise.all(
      bps.map(async bp => {
        const ethLower = lowercase(bp.tempEthAddress);
        const rankingCandidate = rankingCandidatesByEth[ethLower];
        const lastRankingCandidate = lastRankingCandidatesByEth[ethLower];
        const [
          registeredName,
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


  async getBpCandidateRewardDistribution(
    delegateProfileContract: any,
    // tslint:disable-next-line:no-any
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


  addProbation(
    { bps,
      probationCandidateList }
      :{bps: Array<any>,
      probationCandidateList: {probationList: Array<any}
    }):void {
    if (probationCandidateList) {
      bps.map(bp => {
        const probation = probationCandidateList.probationList.find(probation => {
          return lowercase(probation.address) === lowercase(bp.operatorAddress);
        });
        bp.probation = probation;
      });
    }
  }

  sortAndCacheRanking(bps: any): void {
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
        ranksByEth[lowercase(bps[i].tempEthAddress)] = rank;
        bps[i].rank = rank;
      }
    }
  }

  async bpCandidateProductivities(
  parent: any,
  args: any,
  context: TResolverCtx
) {
  const epochNumber =
    args.epochNumber || (await context.gateways.iotexCore.getEpochNumber());
  const resp = await context.gateways.iotexCore.getEpochMeta({ epochNumber });
  return (resp && resp.blockProducersInfo) || [];
}

async getAndAddProductivityFn(
  parent: any,
  args: any,
  context: TResolverCtx
): Promise<Function> {
  const {
    gateways: { nameRegistrationContract }
  } = context;
  const [productivities, regCandidates] = await Promise.all([
    bpCandidateProductivities(parent, args, context),
    nameRegistrationContract.getAllCandidatesCache()
  ]);

  return (bps: any): void {
    for (const bp of bps) {
      const ethLower = lowercase(bp.tempEthAddress);
      const regCandidate =
        regCandidates.find(it => lowercase(it.address) === ethLower) || {};
      const productivity = productivities.find(
        it => lowercase(it.address) === regCandidate.ioOperatorAddr
      );
      if (productivity) {
        bp.productivity = (productivity && productivity.production) || 0;
        bp.productivityBase = (productivity && productivity.active && 30) || 0;
        bp.category = "CONSENSUS_DELEGATE";
      }
    }
  };
}

