const UPDATE_BUCKETS = "UPDATE_BUCKETS";

export function actionUpdateBuckets(
  // tslint:disable-next-line:no-any
  payload: any
  // tslint:disable-next-line:no-any
): { type: string; payload: any } {
  return {
    payload,
    type: UPDATE_BUCKETS
  };
}

export function bucketsReducer(
  // tslint:disable-next-line:no-any
  state: { buckets: any; base: any } = { buckets: [], base: {} },
  // tslint:disable-next-line:no-any
  action: { type: string; payload: any }
  // tslint:disable-next-line:no-any
): { base: any; buckets: any } {
  if (action.type === UPDATE_BUCKETS) {
    return {
      ...state,
      buckets: action.payload
    };
  }

  return state;
}
