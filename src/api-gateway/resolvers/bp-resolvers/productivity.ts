// @flow
import type { TResolverCtx } from "../../types";
import { lowercase } from "../../shared/common/lowercase";

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
): Function {
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
