// @ts-ignore
import window from "global/window";
const SMART_CONTRACT_CALLED = "SMART_CONTRACT_CALLED";

export function actionSmartContractCalled(
  payload: boolean
): { type: "SMART_CONTRACT_CALLED"; payload: boolean } {
  window.scrollTo({ top: 0 });
  window.scrollTo(0, 0); // for-ios-safari
  return {
    type: SMART_CONTRACT_CALLED,
    payload
  };
}

export function smartContractReducer(
  state: { smartContractCalled: boolean } = { smartContractCalled: false },
  action: { type: "SMART_CONTRACT_CALLED"; payload: boolean }
): { smartContractCalled: boolean } {
  if (action.type === SMART_CONTRACT_CALLED) {
    return {
      ...state,
      smartContractCalled: action.payload
    };
  }

  return state;
}
