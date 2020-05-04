// @flow
// @ts-ignore
import window from "global/window";
import Antenna from "iotex-antenna";
import { WsSignerPlugin } from "iotex-antenna/lib/plugin/ws";

// @ts-ignore
import EthContract from "ethjs-contract";
import { Contract } from "iotex-antenna/lib/contract/contract";
// @ts-ignore
import Eth from "../ethjs-query";
import { NATIVE_TOKEN_ABI } from "../smart-contract/native-token-abi";
import { TOKEN_ABI } from "../smart-contract/token-abi";
import { Bucket } from "../token-util";
import { WvSigner } from "./ws-signer";

export function getAntenna(): Antenna {
  // $FlowFixMe
  const injectedWindow: Window & { antenna?: Antenna } = window;
  if (injectedWindow.antenna) {
    return injectedWindow.antenna;
  }
  injectedWindow.antenna = new Antenna("/iotex-core-proxy");
  return injectedWindow.antenna;
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

export function getMobileNativeAntenna(): Antenna {
  // $FlowFixMe
  const injectedWindow: Window & { mobileNativeAntenna?: Antenna } = window;
  if (!injectedWindow.mobileNativeAntenna) {
    const signer = new WvSigner();
    injectedWindow.mobileNativeAntenna = new Antenna("/iotex-core-proxy", {
      signer
    });
  }
  return injectedWindow.mobileNativeAntenna;
}

export function getTokenContract(
  isNative: boolean,
  nativeTokenContractAddr?: string,
  tokenContractAddr?: string,
  eth?: Eth
): Contract {
  if (isNative) {
    const { iotx } = getAntenna();

    if (!nativeTokenContractAddr) {
      window.console.warn(
        "Expect a native token contract address, but got an empty one"
      );
    }

    /**
     * TODO:
     * Hold on util readyState of ws plugin switch to opening state, otherwise ws may still be pending state
     * when the contract sends a request, the console will report error: WebSocket still in CONNECTING.
     */
    return new Contract(NATIVE_TOKEN_ABI, nativeTokenContractAddr, {
      provider: iotx,
      signer: new WsSignerPlugin("wss://local.iotex.io:64102")
    });
  } else {
    if (!eth || !tokenContractAddr) {
      window.console.warn(
        `Both of the eth and tokenContractAddr parameter are required.`
      );
    }

    const tokenContract = new EthContract(eth);

    return tokenContract(TOKEN_ABI).at(tokenContractAddr);
  }
}

export function curryGetTokenContract(
  isNative: boolean,
  nativeTokenContractAddr?: string,
  nativePatchTokenContractAddr?: string,
  tokenContractAddr?: string,
  eth?: Eth
): (isFreshStaking: boolean, bucket: Bucket) => Contract {
  // tslint:disable-next-line:variable-name
  return (_isFreshStaking, bucket) => {
    let isNativePatch = false;
    try {
      const { id } = bucket;
      if (id) {
        // $FlowFixMe
        isNativePatch = isFromNativePatchStaking(id);
      }
    } catch (e) {
      window.console.warn(
        `Parse id from bucket error, received bucket:`,
        bucket
      );
    }
    if (isNativePatch) {
      return getTokenContract(
        isNative,
        nativePatchTokenContractAddr,
        tokenContractAddr,
        eth
      );
    } else {
      return getTokenContract(
        isNative,
        nativeTokenContractAddr,
        tokenContractAddr,
        eth
      );
    }
  };
}

export function isFromNativePatchStaking(id: number): boolean {
  return Boolean(id) && id > 10000;
}
