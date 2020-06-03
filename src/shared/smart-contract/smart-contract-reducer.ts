import window from "global/window";
const SMART_CONTRACT_CALLED = "SMART_CONTRACT_CALLED";

export function actionSmartContractCalled(payload) {
  window.scrollTo({ top: 0 });
  window.scrollTo(0, 0); // for-ios-safari
  return {
    type: SMART_CONTRACT_CALLED,
    payload
  };
}

export function smartContractReducer(
  state = { smartContractCalled: false },
  action
) {
  if (action.type === SMART_CONTRACT_CALLED) {
    return {
      ...state,
      smartContractCalled: true
    };
  }

  return state;
}
