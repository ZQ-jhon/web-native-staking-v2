import { getStatus, IBucket } from "../../server/gateway/staking";

export function isBurnDrop(bucket: IBucket): boolean {
  if (!bucket.autoStake) {
    return false;
  }
  const status = getStatus(
    bucket.withdrawWaitUntil,
    bucket.unstakeStartTime,
    bucket.stakeStartTime
  );
  if (status === "staking") {
    return bucket.stakedDuration > 90;
  }
  return false;
}
