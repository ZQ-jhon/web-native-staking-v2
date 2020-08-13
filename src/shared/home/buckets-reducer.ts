import { IBucket } from "../../server/gateway/staking";

const UPDATE_BUCKETS = "UPDATE_BUCKETS";
const UPDATE_ACCOUNT_META = "UPDATE_ACCOUNT_META";

export function actionUpdateBuckets(
  // tslint:disable-next-line:no-any
  payload: any
  // tslint:disable-next-line:no-any
): { type: string; payload: any } {
  return {
    payload,
    type: UPDATE_BUCKETS,
  };
}

export function actionUpdateAccountMeta(
  // tslint:disable-next-line:no-any
  payload: any
  // tslint:disable-next-line:no-any
): { type: string; payload: any } {
  return {
    payload,
    type: UPDATE_ACCOUNT_META,
  };
}

export function bucketsReducer(
  // tslint:disable-next-line:no-any
  state: Array<IBucket> = [],
  // tslint:disable-next-line:no-any
  action: { type: string; payload: any }
  // tslint:disable-next-line:no-any
): Array<IBucket> {
  if (action.type === UPDATE_BUCKETS) {
    return action.payload;
  }

  return state;
}

export function accountMetaReducer(
  // tslint:disable-next-line:no-any
  state: any = {
    address: "-",
    totalStaked: "-",
    pendingUnstaked: "-",
    readyToWithdraw: "-",
    totalVotes: "-",
    balance: "-",
  },
  // tslint:disable-next-line:no-any
  action: { type: string; payload: any }
  // tslint:disable-next-line:no-any
): Array<IBucket> {
  if (action.type === UPDATE_ACCOUNT_META) {
    return action.payload;
  }

  return state;
}
