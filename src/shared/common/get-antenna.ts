// @ts-ignore
import window from "global/window";
import Antenna from "iotex-antenna/lib";
import {Contract} from "iotex-antenna/lib/contract/contract";
import {WsSignerPlugin} from "iotex-antenna/lib/plugin/ws";
import isBrowser from "is-browser";
// @ts-ignore
import JsonGlobal from "safe-json-globals/get";
// @ts-ignore
import {WvSigner} from "./wv-signer";

const state = isBrowser && JsonGlobal("state");
const isIoPay = isBrowser && state.base.isIoPay;

const contractsByAddrs: Record<string, Contract> = {};

export function getAntenna(): Antenna {
  // $FlowFixMe
  const injectedWindow: Window & { antenna?: Antenna } = window;
  if (injectedWindow.antenna) {
    return injectedWindow.antenna;
  }
  injectedWindow.antenna = new Antenna(
    "https://member.iotex.io/iotex-core-proxy",
    {
      signer: new WsSignerPlugin("wss://local.iotex.io:64102")
    }
  );
  return injectedWindow.antenna;
}

// tslint:disable-next-line:no-any
export function lazyGetContract(address: string, abi: any): Contract {
  if (contractsByAddrs[address]) {
    return contractsByAddrs[address];
  }
  if (isIoPay) {
    const contract = getXAppTokenContract(abi, address);
    contractsByAddrs[address] = contract;
  } else {
    contractsByAddrs[address] = new Contract(abi, address, {
      provider: getAntenna().currentProvider(),
      signer: new WsSignerPlugin("wss://local.iotex.io:64102")
    });
  }
  return contractsByAddrs[address];
}

export function getXAppTokenContract(
  // tslint:disable-next-line:no-any
  abi: any,
  contractAddr?: string
): Contract {
  const mobileNativeAntenna = getMobileNativeAntenna();
  return new Contract(abi, contractAddr, {
    provider: mobileNativeAntenna.iotx,
    signer: mobileNativeAntenna.iotx.signer
  });
}

export function getMobileNativeAntenna(): Antenna {
  // $FlowFixMe
  const injectedWindow: Window & { mobileNativeAntenna?: Antenna } = window;
  if (!injectedWindow.mobileNativeAntenna) {
    const signer = new WvSigner();
    injectedWindow.mobileNativeAntenna = new Antenna(
      "https://member.iotex.io/iotex-core-proxy",
      {
        signer
      }
    );
  }
  return injectedWindow.mobileNativeAntenna;
}
