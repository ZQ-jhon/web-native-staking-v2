// @flow
import { logger } from "onefx/lib/integrated-gateways/logger";
import type { ProbationCandidateList, TResolverCtx } from "../../../types/global";
import { Buffer } from "buffer";
import { readFileSync } from "fs";
// $FlowFixMe
const protobuf = require("protocol-buffers");

export class ReadState {
  async getProbationCandidateList(
    context: TResolverCtx,
    lastEpochNum: number
    // @ts-ignore
  ): Promise<?ProbationCandidateList> {
    let probationCandidateList = null;
    try {
      const messages = protobuf(
        readFileSync(`${__dirname}/../proto/probation.proto`)
      );
      const state = await context.gateways.iotexCore.readState({
        protocolID: Buffer.from("poll"),
        methodName: Buffer.from("ProbationListByEpoch"),
        arguments: [Buffer.from(String(lastEpochNum))]
      });
      probationCandidateList = messages.ProbationCandidateList.decode(
        state.data
      );
    } catch (err) {
      logger.warn(`failed to getProbationCandidateList: ${err}`);
    }
    return probationCandidateList;
  }
}
