// @flow
// $FlowFixMe
import type { TResolverCtx } from "../../types";
import { logger } from "onefx/lib/integrated-gateways/logger";
import {
  encodeCandidateHexName,
  WeiToTokenValue
} from "../../shared/common/token-utils";
import { getGraphQLRateLimiter } from "graphql-rate-limit";
const rateLimiter = getGraphQLRateLimiter({
  identifyContext: (ctx: TResolverCtx) =>
    `${ctx.requestIp || ""}#${ctx.userId || ""}`
});
export async function buckets(
  parent: any,
  args: any,
  context: TResolverCtx,
  info: any
) {
  // rate limit
  const errorMessage = await rateLimiter(
    { parent, args, context, info },
    { max: 5, window: "10s" }
  );

  if (errorMessage) {
    const { requestIp = "", userId = "" } = context;

    logger.warn(
      `Buckets request is too frequently! user: ${userId}, requestIp: ${requestIp}`
    );
    logger.error(errorMessage);

    return [];
  }

  const rankingMeta = await context.gateways.ranking.getMeta(
    context.gateways.iotexCore
  );
  const req: any = {
    name:
      args.name === ""
        ? ""
        : encodeCandidateHexName(args.name).replace(/^0x/, ""),
    startEpoch: Number(rankingMeta.epoch.num)
  };
  if (args.offset) {
    req.offset = args.offset;
  }
  if (args.limit) {
    req.limit = args.limit;
  }
  const resp = await context.gateways.ranking.getBucketsByCandidate(req);

  let buckets = [];
  if (Array.isArray(resp.buckets)) {
    // $FlowFixMe
    buckets = resp.buckets.map(b => ({
      voter: `0x${b.voter}`,
      votes: WeiToTokenValue(b.votes),
      weightedVotes: WeiToTokenValue(b.weightedVotes),
      remainingDuration: b.remainingDuration,
      isNative: b.isNative
    }));
  }

  return buckets;
}
