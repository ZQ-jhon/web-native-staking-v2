// @flow
import BigNumber from "bignumber.js";
import {Contract} from "iotex-antenna/lib/contract/contract";
import {fromString} from "iotex-antenna/lib/crypto/address";
import {
  Bucket,
  DEFAULT_STAKING_DURATION_SECOND,
  encodeCandidateHexName,
  getPowerEstimation
} from "../common/token-utils";
import {NATIVE_TOKEN_ABI} from "./native-token-abi";
import {getIoPayAddress} from "../common/get-antenna";

export type TMyStakeStatus = {
  addr: string,
  buckets: Array<Bucket>,
  totalStaking: number,
  unStakePendingAmount: number,
  withdrawableAmount: number,
  totalVotesAmount: string,
  patchArr?: string,
  patchBuckets?: Array<Bucket>
};


export function calcStats(
  addr: string,
  // tslint:disable-next-line:no-any
  bucketIds: any,
  // tslint:disable-next-line:no-any
  resp: any,
  stakingDurationSecond: number = DEFAULT_STAKING_DURATION_SECOND
): TMyStakeStatus {
  const stakeStatus: TMyStakeStatus = {
    addr,
    buckets: [],
    totalStaking: 0,
    unStakePendingAmount: 0,
    withdrawableAmount: 0,
    totalVotesAmount: "0"
  };
  let bigTotalVotesAmount = new BigNumber(0);
  for (let i = 0; i < resp.length; i++) {
    const bucket = Bucket.fromContractRes(
      bucketIds[i],
      resp[i],
      stakingDurationSecond
    );
    stakeStatus.buckets.push(bucket);
    const totalVotes = getPowerEstimation(
      bucket.stakedAmount,
      bucket.stakeDuration,
      0
    ).total;
    bigTotalVotesAmount = bigTotalVotesAmount.plus(totalVotes);
    if (bucket.getStatus() === "staking") {
      stakeStatus.totalStaking += bucket.stakedAmount;
    } else if (bucket.getStatus() === "unstaking") {
      stakeStatus.unStakePendingAmount += bucket.stakedAmount;
    } else if (bucket.getStatus() === "withdrawable") {
      stakeStatus.withdrawableAmount += bucket.stakedAmount;
    }
  }
  stakeStatus.totalVotesAmount = bigTotalVotesAmount.toFixed(0);
  return stakeStatus;
}

export async function getNativeStakeStatus(
  contract: Contract,
  stakingDurationSecond: number
): Promise<TMyStakeStatus> {
  const addr = await getIoPayAddress();

  let resp = await contract.methods.getPyggIndexesByAddress(addr, {
    from: addr,
    gas: 600000
  });
  // @ts-ignore
  const bucketIds = resp.map(id => id.toNumber()) || [];
  resp = await Promise.all(
    // tslint:disable-next-line:no-any
    bucketIds.map((id: any) =>
      contract.methods.pyggs(id, {
        from: addr,
        gas: 600000
      })
    )
  ); // FIXME: confirm params?
  resp = nativeResponseMap(resp);
  return calcStats(addr, bucketIds, resp, stakingDurationSecond);
}

// tslint:disable-next-line:no-any
function nativeResponseMap(response: Array<Array<any>>): any {
  const item = NATIVE_TOKEN_ABI.find(item => item.name === "pyggs");
  const fields = item && item.outputs;
  return response.map(ary =>
    ary.reduce((acc, cur, index) => {
      // @ts-ignore
      const key = fields[index].name;
      let value = cur;

      if (key === "canName") {
        // eslint-disable-next-line no-undef
        const str = new TextDecoder("utf-8").decode(cur);
        value = encodeCandidateHexName(str);
      }

      if (key === "pyggOwner") {
        value = fromString(cur).stringEth();
        acc.bucketOwner = value;
      } else {
        acc[key] = value;
      }

      acc[index] = value;
      return acc;
    }, {})
  );
}
