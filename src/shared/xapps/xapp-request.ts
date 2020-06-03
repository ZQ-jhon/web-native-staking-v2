// @flow
// @ts-ignore
import window from "global/window";
import { getMobileNativeAntenna } from "../common/get-antenna";
import { Contract } from "iotex-antenna/lib/contract/contract";
import sleepPromise from "sleep-promise";

let reqId = Math.round(Math.random() * 10000);

interface IRequest {
  reqId: number;
  type: "SIGN_AND_SEND" | "GET_ACCOUNTS";

  envelop?: string; // serialized proto string
}

export async function getXAppTokenContract(
  abi: any,
  contractAddr?: string
): Contract {
  const mobileNativeAntenna = getMobileNativeAntenna();
  return new Contract(abi, contractAddr, {
    provider: mobileNativeAntenna.iotx,
    signer: mobileNativeAntenna.iotx.signer
  });
}

let ioPayAddress;

export async function getIoAddressFromIoPay(): Promise<string> {
  if (ioPayAddress) return ioPayAddress;
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

export function getNativeNetworkEndpoint(provider: any): string {
  switch (provider.hostname_) {
    case "api.iotex.one:80":
      return "iotexscan.io";
    default:
      return "testnet.iotexscan.io";
  }
}
