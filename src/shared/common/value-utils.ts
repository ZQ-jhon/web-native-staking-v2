import {validateAddress} from "iotex-antenna/lib/account/utils";

export type ProfileField = {
  key: string,
  // tslint:disable-next-line:no-any
  value: any
};

export function getPermyriadValue(
  profileFields: Array<ProfileField>,
  key: string
): number | undefined {
  const found = profileFields.find(k => k.key === key);
  return found && Number(found.value);
}


export function getStatus(
  liveVotes: string,
  selfStaking: string,
  operatorAddr: string,
  rewardAddr: string
): string {
  if (
    (parseInt(selfStaking, 10) || 0) < 1200000 ||
    !validateAddress(operatorAddr) ||
    !validateAddress(rewardAddr)
  ) {
    return "UNQUALIFIED";
  }
  if ((parseInt(liveVotes, 10) || 0) < 2000000) {
    return "NOT_ELECTED";
  }
  return "ELECTED";
}
