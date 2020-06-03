// @flow
// @ts-ignore
import window from "global/window";
import {
  getArgTypes,
  getHeaderHash
} from "iotex-antenna/lib/contract/abi-to-byte";
import { Contract } from "iotex-antenna/lib/contract/contract";
import { IRpcMethod } from "iotex-antenna/lib/rpc-method/types";
import { ABI } from "./abi";
import { ERC20, IERC20 } from "./erc20";
import BigNumber from "bignumber.js";

export interface IVita extends IERC20 {
  claimableAmount(owner: string, callerAddress: string): Promise<BigNumber>;
}

export class Vita extends ERC20 implements IVita {
  static create(address: string, provider: IRpcMethod): Vita {
    const vita = new Vita();
    vita.address = address;
    vita.provider = provider;
    vita.contract = new Contract(ABI, address, {
      provider: provider
    });

    const methods = {};
    // @ts-ignore
    for (const fnName of Object.keys(vita.contract.getABI())) {
      // @ts-ignore
      const fnAbi = vita.contract.getABI()[fnName];
      if (fnAbi.type === "constructor") {
        continue;
      }

      const args = getArgTypes(fnAbi);
      const header = getHeaderHash(fnAbi, args);
      // @ts-ignore
      methods[header] = {
        name: fnName,
        inputsNames: args.map(i => {
          return `${i.name}`;
        }),
        inputsTypes: args.map(i => {
          return `${i.type}`;
        })
      };
    }
    vita.methods = methods;

    return vita;
  }

  async claimableAmount(
    owner: string,
    callerAddress: string
  ): Promise<BigNumber> {
    try {
      const result = await this.readMethod(
        "claimableAmount",
        callerAddress,
        owner
      );
      window.console.info("claimable result ", result);
      return new BigNumber(result, 16);
    } catch (error) {
      window.console.error("claimable claimableAmount ", error);
      // @ts-ignore
      return BigNumber.valueOf("0");
    }
  }
}
