import {config} from "dotenv";
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
import {logger} from "onefx/lib/integrated-gateways/logger";
import {BP_BLACKLIST} from "../../constant/admin-setting-constant";
import {Bucket, Candidate} from "../../shared/types";
import {Bp} from "./bp";

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
  bp: Bp;

  constructor() {
    this.antenna = new Antenna("https://api.nightly-cluster-2.iotex.one");
    this.bp = new Bp();
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

  async bpCandidates(
    context: TResolverCtx
  ) {
    const valStr = await context.model.cache.get(`bpCandidates_${config.env}`);
    return JSON.parse(valStr);
  }


  async refreshBpCandidates(
    // tslint:disable-next-line:no-any
    args: { [key: string]: any},
    context: TResolverCtx
    // tslint:disable-next-line:no-any
  ): Promise<any> {
    const {
      gateways: { nameRegistrationContract, delegateProfileContract }
    } = context;
    const {
      rankingMeta,
      lastRankingCandidatesByEth,
      rankingCandidatesByEth,
      probationCandidateList
    } = await this.bp.getCandidatesResponses(context);

    let bps = (await context.model.bpCandidate.findAll()) || [];
    // populate bps from rankingCandidates
    await this.bp.populateBps({
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
      // don't show if no name // don't show if in blacklist
      bp => bp.registeredName && blacklist.indexOf(bp.registeredName) === -1
    );

    // bp productivity
    try {
      (await this.bp.getAndAddProductivityFn(parent, args, context))(bps);
    } catch (err) {
      logger.warn(`partial downgrade: failed to getAndAddProductivityFn: ${err}`);
    }

    this.bp.addProbation({ bps, probationCandidateList });

    this.bp.sortAndCacheRanking(bps);
    const whitelist =
      (await context.model.adminSettings.get("bp-whitelist")) || [];
    for (const bp of bps) {
      if (bp.registeredName && whitelist.indexOf(bp.registeredName) !== -1) {
        bp.serverStatus = "ONLINE";
      }
    }
    const cacheVal = JSON.stringify(bps);
    await context.model.cache.put(`bpCandidates_${config.env}`, cacheVal);
    return bps;
  }

}
