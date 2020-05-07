import BigNumber from "bignumber.js";
import {lowercase} from "../../shared/common/lowercase";
import {decodeCandidateHexName, WeiToTokenBN} from "../../shared/common/token-utils";
import {getPermyriadValue, getStatus} from "../../shared/common/value-utils";
import partition from "lodash.partition";
import {logger} from "onefx/lib/integrated-gateways/logger";
import gql from "graphql-tag";
import {analyticsApolloClient} from "../../shared/common/apollo-client";
import {
  HermesDistribution,
  ICandidate,
  IGetCandidateRequest,
  IGetCandidateResponse,
  IGetMetaResponse
} from "../../shared/types";
import {IotexCore} from "./iotex-core";


export const CHAIN_META = gql`
  query chain {
    chain {
      votingResultMeta {
        totalCandidates
        totalWeightedVotes
        votedTokens
      }
    }
  }
`;

const GET_CANDIDATES = gql`
  query voting($startEpoch: Int!, $epochCount: Int!) {
    voting(startEpoch: $startEpoch, epochCount: $epochCount) {
      candidateInfo {
        candidates {
          name
          address
          totalWeightedVotes
          selfStakingTokens
          operatorAddress
          rewardAddress
        }
      }
    }
  }
`;

const GET_BUCKETS_BY_CANDIDATE = gql`
  query delegate(
    $startEpoch: Int!
    $epochCount: Int!
    $delegateName: String!
    $pagination: Pagination
  ) {
    delegate(
      startEpoch: $startEpoch
      epochCount: $epochCount
      delegateName: $delegateName
    ) {
      bucketInfo {
        exist
        bucketInfoList(pagination: $pagination) {
          epochNumber
          count
          bucketInfo {
            voterEthAddress
            voterIotexAddress
            votes
            weightedVotes
            remainingDuration
            isNative
          }
        }
      }
    }
  }
`;

const GET_HERMES = gql`
  query hermes(
    $startEpoch: Int!
    $epochCount: Int!
    $rewardAddress: String!
    $waiverThreshold: Int!
  ) {
    hermes(
      startEpoch: $startEpoch
      epochCount: $epochCount
      rewardAddress: $rewardAddress
      waiverThreshold: $waiverThreshold
    ) {
      hermesDistribution {
        delegateName
      }
    }
  }
`;


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

export class Bp {

  async getMeta(iotexCore: IotexCore): Promise<IGetMetaResponse> {
    try {
      const {
        data: {
          chain: { votingResultMeta: rawMeta }
        }
      } = await analyticsApolloClient.query({ query: CHAIN_META });
      const epoch = await iotexCore.getEpoch();
      return {
        height: epoch.gravityChainStartHeight,
        totalCandidates: rawMeta.totalCandidates,
        totalVotedStakes: new BigNumber(rawMeta.votedTokens)
          .dividedBy(new BigNumber("1e18"))
          .toFixed(1),
        totalVotes: new BigNumber(rawMeta.totalWeightedVotes)
          .dividedBy(new BigNumber("1e18"))
          .toNumber(),
        epoch
      };
    } catch (e) {
      logger.error(`failed to getMeta: ${e}`, e);
    }
    return {
      height: "0",
      totalCandidates: 0,
      totalVotedStakes: 0,
      totalVotes: 0,
      epoch: { num: 0, height: 0, gravityChainStartHeight: "0" }
    };
  }

  async getCandidates({ startEpoch}: IGetCandidateRequest): Promise<IGetCandidateResponse> {
    try {
      let { data } = await analyticsApolloClient.query({
        query: GET_CANDIDATES,
        variables: { startEpoch, epochCount: 1 }
      });
      const { candidates } =
      (data.voting.candidateInfo && data.voting.candidateInfo[0]) || [];

      const resp = await analyticsApolloClient.query({
        query: GET_HERMES,
        variables: {
          startEpoch: startEpoch - 1,
          epochCount: 1,
          rewardAddress: "io12mgttmfa2ffn9uqvn0yn37f4nz43d248l2ga85",
          waiverThreshold: 100
        }
      });
      data = resp.data;

      const hermesCandidates = (data.hermes.hermesDistribution || [])
        .map((r: HermesDistribution) => r.delegateName)
        .reduce((prev: { [x: string]: boolean; }, cur: string | number) => {
          prev[cur] = true;
          return prev;
        }, {});

      candidates.forEach((c: ICandidate) => {
        const name = decodeCandidateHexName(c.name);
        c.badges = hermesCandidates[name] ? 1 : 0;
        return c;
      });

      return { candidates };
    } catch (e) {
      logger.error(`failed to getCandidates: ${e}`);
    }
    return { candidates: [] };
  }

  // tslint:disable-next-line:no-any
  async getCandidatesResponses(context: TResolverCtx): Promise<any> {
    const {
      gateways: { iotexCore }
    } = context;

    const rankingMeta = await this.getMeta(iotexCore);
    const currentEpochNum = new BigNumber(rankingMeta.epoch.num)
      .minus(1)
      .toNumber();
    const candidatesResp = await this.getCandidates({
      startEpoch: currentEpochNum
    });

    const lastEpochNum = new BigNumber(rankingMeta.epoch.num).minus(2).toNumber();
    const lastEpochCandidatesResp = await this.getCandidates({
      startEpoch: lastEpochNum
    });

    const lastRankingCandidates =
      (lastEpochCandidatesResp && lastEpochCandidatesResp.candidates) || [];
    const lastRankingCandidatesByEth = lastRankingCandidates.reduce(
      (acc: { [x: string]: ICandidate; }, cur: ICandidate) => {
        acc[`0x${lowercase(cur.address)}`] = cur;
        return acc;
      },
      {}
    );

    const rankingCandidates = (candidatesResp && candidatesResp.candidates) || [];
    const rankingCandidatesByEth = rankingCandidates.reduce(
      (acc: { [x: string]: ICandidate; }, cur: ICandidate) => {
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

