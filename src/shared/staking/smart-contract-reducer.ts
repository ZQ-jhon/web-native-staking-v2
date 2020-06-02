// @ts-ignore
import window from "global/window";
const SMART_CONTRACT_CALLED = "SMART_CONTRACT_CALLED";

// @ts-ignore
// tslint:disable-next-line:typedef
export function actionSmartContractCalled(payload) {
  window.scrollTo({ top: 0 });
  window.scrollTo(0, 0); // for-ios-safari
  return {
    type: SMART_CONTRACT_CALLED,
    payload,
  };
}

// tslint:disable-next-line:typedef
export function smartContractReducer(
  // tslint:disable-next-line:typedef
  state = { smartContractCalled: false },
  // @ts-ignore
  // tslint:disable-next-line:typedef
  action
) {
  if (action.type === SMART_CONTRACT_CALLED) {
    return {
      ...state,
      smartContractCalled: true,
    };
  }

  return state;
}
