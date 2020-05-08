// @ts-ignore
import window from "global/window";
import {WsSignerPlugin} from "iotex-antenna/lib/plugin/ws";
import isBrowser from "is-browser";
// @ts-ignore
import JsonGlobal from "safe-json-globals/get";
import {Staking} from "../../server/gateway/staking";
import {getIoAddressFromIoPay} from "./get-antenna";
import {WvSigner} from "./wv-signer";

const state = isBrowser && JsonGlobal("state");
const isIoPay = isBrowser && state.base.isIoPay;

export function getStaking(): Staking {
  // $FlowFixMe
  const injectedWindow: Window & { staking?: Staking } = window;
  if (injectedWindow.staking) {
    return injectedWindow.staking;
  }
  const signer = isIoPay?new WvSigner(): new WsSignerPlugin("wss://local.iotex.io:64102");
  injectedWindow.staking = new Staking({
      signer: signer
    }
  );
  return injectedWindow.staking;
}

export async function getIoPayAddress(): Promise<string> {
  if (isIoPay) {
    // tslint:disable-next-line:no-unnecessary-local-variable
    const address = await getIoAddressFromIoPay();
    return address;
  }
  const account = getStaking().antenna.iotx.accounts[0];
  return (account && account.address) || "";
}

