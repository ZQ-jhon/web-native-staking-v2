// @flow
import type { TResolverCtx } from "../../types";
import { UserInputError } from "apollo-server-koa";

export async function iotxAirdrop(
  parent: any,
  args: any,
  context: TResolverCtx
) {
  const githubId = await context.gateways.iotxAirdrop.getGithubUserId(
    args.iotxAirdropInput.githubCode,
    args.iotxAirdropInput.netType
  );
  if (!githubId) {
    return false;
  }
  let faucetTestnet;
  switch (args.iotxAirdropInput.netType) {
    case "testnet":
      faucetTestnet = await context.model.iotxAirdrop.findBeforeOneDayByGithubId(
        githubId,
        args.iotxAirdropInput.netType
      );
      break;
    case "mainnet":
      faucetTestnet = await context.model.iotxAirdrop.findOneByGithubIdOrIotxAddress(
        githubId,
        args.iotxAirdropInput.address,
        args.iotxAirdropInput.netType
      );
      break;
    default:
      throw new UserInputError("netType is required");
  }

  if (!faucetTestnet) {
    // can get 1 token
    const nativeToken = await context.gateways.iotxAirdrop.sendNativeToken(
      args.iotxAirdropInput.address,
      args.iotxAirdropInput.netType
    );
    if (!nativeToken) {
      return false;
    }
    await context.model.iotxAirdrop.newAndSave({
      githubId,
      ...args.iotxAirdropInput
    });
    return true;
  }
  return false;
}
