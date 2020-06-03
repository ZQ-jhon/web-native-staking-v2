// @ts-ignore
import window from "global/window";
// @ts-ignore
import { get } from "dotty";

let triedToEnabled = false;

export async function enableEthereum() {
  if (triedToEnabled) {
    return;
  }
  if (get(window, "ethereum.enable") && !get(window, "web3.eth.accounts.0")) {
    triedToEnabled = true;
    await window.ethereum.enable();
  }
}
