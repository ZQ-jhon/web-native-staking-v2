// @flow
import { promisify } from "util";
import grpc from "grpc";
import BigNumber from "bignumber.js";
import * as protoLoader from "@grpc/proto-loader";
import { logger } from "onefx/lib/integrated-gateways/logger";
import type {
  IGetMetaResponse,
  IGetCandidateRequest,
  IGetCandidateResponse,
  IGetBucketsByCandidateRequest,
  IGetBucketsByCandidateResponse
} from "../../../types/global";
import gql from "graphql-tag";
import { analyticsApolloClient } from "../../../shared/common/apollo-client";
import { IotexCore } from "../iotex-core";
import { decodeCandidateHexName } from "../../../shared/common/token-utils";

const PROTO_PATH = `${__dirname}/../proto/ranking.proto`;

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

export class Ranking {
  client: any;
  timeout: number;

  constructor({ hostname, timeout }: { hostname: string, timeout: number }) {
    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true
    });
    const ranking = grpc.loadPackageDefinition(packageDefinition).api;
    // @ts-ignore
    this.client = new ranking.APIService(
      hostname,
      grpc.credentials.createInsecure(),
      null
    );
    this.timeout = timeout;
  }

  getDeadline() {
    return new Date(Date.now() + this.timeout);
  }

  async getMeta(iotexCore: IotexCore): Promise<IGetMetaResponse> {
    try {
      const {
        data: {
          chain: { votingResultMeta: rawMeta }
        }
      } = await analyticsApolloClient.query({ query: CHAIN_META });
      const epoch = await iotexCore.getEpoch();
      const meta = {
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
      // @ts-ignore
      return meta;
    } catch (e) {
      logger.error(`failed to getMeta: ${e}`, e);
    }
    return {
      height: "0",
      totalCandidates: 0,
      totalVotedStakes: 0,
      totalVotes: 0,
      epoch: { num: "0", height: "0", gravityChainStartHeight: "0" }
    };
  }

  async health(): Promise<boolean> {
    try {
      const isHealth = promisify(this.client.isHealth.bind(this.client));
      const health = await isHealth({}, { deadline: this.getDeadline() });
      return health.status === "ACTIVE" || health.status === "STARTING";
    } catch (e) {
      logger.error(`failed to getMeta: ${e}`, e);
      return false;
    }
  }

  async getCandidates({
    startEpoch
  }: IGetCandidateRequest): Promise<IGetCandidateResponse> {
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
         // @ts-ignore
        .map(r => r.delegateName)
        .reduce((prev: any, cur: any) => {
          prev[cur] = true;
          return prev;
        }, {});

      candidates.forEach(c => {
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

  async getBucketsByCandidate(
    req: IGetBucketsByCandidateRequest
  ): Promise<IGetBucketsByCandidateResponse> {
    let { name, startEpoch, limit = 30, offset = 0, epochCount = 1 } = req;
    if (limit >= 100) {
      limit = 100;
    }
    if (name) {
      const variables = {
        startEpoch,
        epochCount,
        delegateName: name,
        pagination: { skip: offset, first: limit }
      };

      logger.info(
        `getBucketsByCandidate variables ${JSON.stringify(variables)}`
      );
      try {
        const { data } = await analyticsApolloClient.query({
          query: GET_BUCKETS_BY_CANDIDATE,
          variables
        });
        const buckets = data.delegate.bucketInfo.bucketInfoList[0].bucketInfo.map(
          ({
            voterIotexAddress,
            votes,
            weightedVotes,
            remainingDuration,
            isNative
          }: any) => ({
            votes,
            weightedVotes,
            remainingDuration,
            voter: voterIotexAddress,
            isNative
          })
        );
        return { buckets };
      } catch (e) {
        logger.error(`failed to getBucketsByCandidate`, e);
      }
    }
    return { buckets: [] };
  }
}
