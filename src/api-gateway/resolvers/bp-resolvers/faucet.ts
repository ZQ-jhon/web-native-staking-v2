// @flow
import type { TResolverCtx } from "../../types";

export async function faucet(parent: any, args: any, context: TResolverCtx) {
  return await context.gateways.faucetHandler.request(args.faucetInput);
}
