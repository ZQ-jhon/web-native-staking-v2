
import { DateTime, URL } from "@okgrow/graphql-scalars";
// $FlowFixMe
import GraphQLJSON from "graphql-type-json";
import { ApolloServer } from "apollo-server-koa";
import path from "path";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { MyServer } from "../server/start-server";
import { ArticleResolver } from "../shared/article/article-resolver";

import {
  bpCandidateTechDetail,
  bpCandidate,
  bpCandidates,
  upsertBpCandidate,
  upsertBpCandidateTechDetail,
  bpCandidateRewardDistribution,
  bpCandidatesOnContract
} from "./resolvers/bp-resolvers/bp-resolvers";
import { MetaResolver } from "./resolvers/meta-resolver";

export async function setApiGateway(server: MyServer): Promise<void> {
  const BPResolver = {
    Query: {
      bpCandidates,
      bpCandidate,
      bpCandidateTechDetail,
      bpCandidateRewardDistribution,
      // buckets,
      // poll,
      // polls,
      // stats,
      // member,
      // allBadges,
      // stakingReferrals,
      // countStakingReferrals,
      // giveaways,
      // giveaway,
      bpCandidatesOnContract,
      // totalEmerald,
      // achievedBadges,
      // totalJoinedGiveaway,
      // adminSetting,
      // rewardRecord,
      // validateIotexEndpoint,
      // checkRewardRecordExist,
      // bpCandidateProductivities,
      // historys,
      // meta
      health: () => new Date(),
      // reportIssueToSlack,
      // checkUserIsUS
    },
    Mutation: {
      upsertBpCandidate,
      upsertBpCandidateTechDetail,
      // updateMember,
      // upsertGiveaway,
      // removeGiveaway,
      // faucet,
      // iotxAirdrop,
      // recordStakingReferral,
      // updateAdminSettings,
      // updateEmeralds,
      // addGiveawayParticipant,
      // claimMegaBox,
      // clientLog,
      // earnEmeraldsForVoting,
      // updateUser,
      // addMailChimpSubscriber
    },
    DateTime,
    URL,
    JSON: GraphQLJSON
  };
  const defaultResolvers = [MetaResolver, ArticleResolver];

  //server.resolvers = [...defaultResolvers, BPResolver];
  server.resolvers = BPResolver;

  const sdlPath = path.resolve(__dirname, "api-gateway.graphql");
  const schema = await buildSchema({
    resolvers: defaultResolvers,
    emitSchemaFile: {
      path: sdlPath,
      commentDescriptions: true
    },
    validate: false
  });

  const apollo = new ApolloServer({
    schema,
    introspection: true,
    playground: true,
    context: async _ => {
      return {};
    }
  });
  const gPath = `${server.config.server.routePrefix || ""}/api-gateway/`;
  console.log('api-gatewayPath====================================', gPath)
  apollo.applyMiddleware({ app: server.app, path: gPath });
}
