// @ts-ignore
import window from "global/window";
import Antenna from "iotex-antenna/lib";
import { fromRau } from "iotex-antenna/lib/account/utils";
import { Contract } from "iotex-antenna/lib/contract/contract";
import { WsSignerPlugin } from "iotex-antenna/lib/plugin/ws";
import isBrowser from "is-browser";
// @ts-ignore
import JsonGlobal from "safe-json-globals/get";
// @ts-ignore
import sleepPromise from "sleep-promise";
import { WvSigner } from "./wv-signer";

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

// tslint:disable-next-line:insecure-random
let reqId = Math.round(Math.random() * 10000);

interface IRequest {
  reqId: number;
  type: "SIGN_AND_SEND" | "GET_ACCOUNTS";

  envelop?: string; // serialized proto string
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

let ioPayAddress: string;

export async function getIoAddressFromIoPay(): Promise<string> {
  if (ioPayAddress) {
    return ioPayAddress;
  }
  window.console.log("getIoAddressFromIoPay start");
  await getMobileNativeAntenna();
  const id = reqId++;
  const req: IRequest = {
    reqId: id,
    type: "GET_ACCOUNTS"
  };
  let sec = 1;
  while (!window.WebViewJavascriptBridge) {
    window.console.log(
      "getIoAddressFromIoPay get_account sleepPromise sec: ",
      sec
    );
    await sleepPromise(sec * 200);
    sec = sec * 1.6;
    if (sec >= 48) {
      sec = 48;
    }
  }
  return new Promise<string>(resolve =>
    window.WebViewJavascriptBridge.callHandler(
      "get_account",
      JSON.stringify(req),
      (responseData: string) => {
        window.console.log(
          "getIoAddressFromIoPay get_account responseData: ",
          responseData
        );
        let resp = { reqId: -1, address: "" };
        try {
          resp = JSON.parse(responseData);
        } catch (_) {
          return;
        }
        if (resp.reqId === id) {
          resolve(resp.address);
          ioPayAddress = resp.address;
        }
      }
    )
  );
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

export async function getIoPayAddress(): Promise<string> {
  if (isIoPay) {
    // tslint:disable-next-line:no-unnecessary-local-variable
    const address = await getIoAddressFromIoPay();
    return address;
  }
  const account = getAntenna().iotx.accounts[0];
  return (account && account.address) || "";
}

export async function getIotxBalance(address: string): Promise<number> {
  const antenna = getAntenna();
  const { accountMeta } = await antenna.iotx.getAccount({ address });
  // @ts-ignore
  return Number(fromRau(accountMeta.balance, "IOTX"));
}

export function getRemoteAntenna(): Antenna {
  // $FlowFixMe
  const injectedWindow: Window & { remoteAntenna?: Antenna } = window;
  if (injectedWindow.remoteAntenna) {
    return injectedWindow.remoteAntenna;
  }
  injectedWindow.remoteAntenna = new Antenna("/iotex-core-proxy", {
    signer: new WsSignerPlugin("wss://local.iotex.io:64102")
  });
  return injectedWindow.remoteAntenna;
}
