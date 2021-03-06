// @flow
import BigNumber from "bignumber.js";
import { Buffer } from "buffer";
import dateformat from "dateformat";
// $FlowFixMe
import leftPad from "left-pad";
import { IBucket } from "../../server/gateway/staking";

export const HERMES_CONTRACT_ADDRESS = "io12mgttmfa2ffn9uqvn0yn37f4nz43d248l2ga85";
export const DEFAULT_EPOCH_SECOND = 24 * 3600;
export const DEFAULT_STAKING_DURATION_SECOND = 24 * 3600;

export const DEFAULT_STAKING_GAS_LIMIT = "10000000";

BigNumber.set({ ROUNDING_MODE: BigNumber.ROUND_FLOOR });

// tslint:disable-next-line:no-any
export function TokenValueToWei(displayValue: any): BigNumber {
  return new BigNumber(displayValue).times(10 ** 18);
}

export function WeiToTokenValueFloor(wei: string): number {
  const n = WeiToTokenBN(wei);
  return n.decimalPlaces(6, BigNumber.ROUND_FLOOR).toNumber();
}

export function WeiToTokenValue(wei: string): number {
  return WeiToTokenBN(wei).toNumber();
}

export function WeiToTokenBN(wei: string): BigNumber {
  return new BigNumber(wei).dividedBy(10 ** 18);
}

export function fromRauERC20(amount: string, decimals: string): BigNumber {
  return new BigNumber(amount).dividedBy(
    new BigNumber(10).pow(new BigNumber(decimals))
  );
}

export function decodeCandidateHexName(hexx: string): string {
  return Buffer.from(String(hexx).replace(/^0x/, ""), "hex")
    .toString("utf8")
    .replace(/^(\u0000+)/g, "")
    .replace(/\u0000/g, "#");
}

export function encodeCandidateHexName(utf8: string): string {
  const replaced = utf8.replace(/#/g, "\u0000");
  const padded = leftPad(replaced, 12, "\u0000");
  return `0x${Buffer.from(padded).toString("hex")}`;
}

export function getPowerEstimation(
  amount: BigNumber,
  duration: number,
  nonDecay: boolean,
  selfStaking: boolean
): BigNumber {
  let total = new BigNumber(0);
  if (amount.isPositive()) {
    let percent = 1;
    if (duration > 0) {
      percent += Math.log(duration * (nonDecay ? 2 : 1)) / Math.log(1.2) / 100;
    }
    if (selfStaking && nonDecay && duration >= 91) {
      percent *= 1.06;
    }
    total = amount.multipliedBy(percent);
  }

  return total;
}

export function getPowerEstimationForBucket(bucket: IBucket): BigNumber {
  return getPowerEstimation(
    bucket.stakedAmount,
    bucket.stakedDuration,
    bucket.autoStake,
    bucket.selfStakingBucket
  );
}

export function getPowerEstimationForKovan(
  amount: number,
  duration: number,
  hourFromNow: number
): { total: BigNumber; date: string } {
  const hoursLeft = duration - hourFromNow;
  let total = new BigNumber(0);
  if (amount > 0) {
    const percent =
      // tslint:disable-next-line:binary-expression-operand-order
      1 + (hoursLeft > 0 ? Math.log(hoursLeft) / Math.log(1.2) / 100 : 0);
    total = new BigNumber(amount).multipliedBy(percent);
  }
  const aDate = new Date();
  aDate.setHours(aDate.getHours() + hourFromNow);
  const date = dateformat(aDate, "yyyy/mm/dd HH:MM");
  return { total, date };
}

export class Bucket {
  id?: number;
  canName: string;
  bucketOwner: string;
  nonDecay: boolean;
  stakeDuration: number;
  stakeStartTime: string;
  stakedAmount: number;
  unstakeStartTime: string;
  withdrawWaitUntil?: string | number;

  static fromContractRes(
    bucketId: number,
    // tslint:disable-next-line:no-any
    contractRes: any,
    stakingDurationSecond: number = DEFAULT_STAKING_DURATION_SECOND,
    timeFormat: string = "yyyy/mm/dd HH:MM"
  ): Bucket {
    const b = new Bucket();
    const stakeStartTime = contractRes.stakeStartTime.toNumber() * 1000;
    const unstakeStartTime = contractRes.unstakeStartTime.toNumber() * 1000;
    b.id = bucketId;
    b.canName = decodeCandidateHexName(contractRes.canName);
    b.bucketOwner = contractRes.bucketOwner;
    b.nonDecay = contractRes.nonDecay;
    b.stakeDuration = contractRes.stakeDuration.toNumber();
    b.stakeStartTime = stakeStartTime
      ? dateformat(new Date(stakeStartTime), timeFormat)
      : "";
    b.stakedAmount = WeiToTokenValue(contractRes.stakedAmount);
    b.unstakeStartTime = unstakeStartTime
      ? dateformat(new Date(unstakeStartTime), timeFormat)
      : "";
    b.withdrawWaitUntil =
      (unstakeStartTime || "") &&
      dateformat(
        new Date(
          new Date(unstakeStartTime).getTime() +
            // tslint:disable-next-line:binary-expression-operand-order
            3 * stakingDurationSecond * 1000
        ),
        timeFormat
      );
    return b;
  }

  static fromFormInput(
    canName: string,
    nonDecay: boolean = false,
    stakeDuration: number = 0,
    stakedAmount: number = 0,
    id?: number
  ): Bucket {
    const b = new Bucket();
    b.id = id;
    b.canName = canName;
    b.nonDecay = nonDecay;
    b.stakeDuration = stakeDuration;
    b.stakedAmount = stakedAmount;
    return b;
  }

  canNameHex(): string {
    return encodeCandidateHexName(this.canName);
  }

  stakedAmountWei(): BigNumber {
    return TokenValueToWei(this.stakedAmount);
  }

  getStatus(): string {
    const now = new Date();
    if (this.withdrawWaitUntil) {
      const date = new Date(this.withdrawWaitUntil);
      if (date <= now) {
        return "withdrawable";
      }
    }

    if (this.unstakeStartTime) {
      const date = new Date(this.unstakeStartTime);
      if (date <= now) {
        return "unstaking";
      }
    }

    if (this.stakeStartTime) {
      return "staking";
    }

    return "no_stake_starttime";
  }
}
