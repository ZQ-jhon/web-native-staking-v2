/* tslint:disable:no-any */
// @flow
import { toRau } from "iotex-antenna/lib/account/utils";
import { Contract } from "iotex-antenna/lib/contract/contract";
import { lazyGetContract } from "../../common/get-antenna";
import {numberToHex, utf8ToHex} from "../../common/hex-utils";
import { DEFAULT_STAKING_GAS_LIMIT } from "../../common/token-utils";
import { DELEGATE_PROFILE_ABI } from "./delegate-profile-abi";

export type ProfileField = {
  key: string;
  value: any;
};


function castToUint16Hex(value: any): string {
  const hex = numberToHex(value).replace("0x", "");
  if (hex.length > 4) {
    throw new Error(`Invalid uint16 value: ${value}`);
  }
  return "0".repeat(4 - hex.length) + hex;
}

function prependLength(aHex: string): string {
  const hex = aHex.replace("0x", "");
  const len = numberToHex(hex.length / 2).replace("0x", "");
  return "0".repeat(64 - len.length) + len + hex;
}

export class DelegateProfileContract {
  contract: Contract;
  types: { [key: string]: string };

  constructor({ contractAddress }: { contractAddress: string }) {
    try {
      this.contract = lazyGetContract(contractAddress, DELEGATE_PROFILE_ABI);
      this.types = {
        blockRewardPortion: "",
        epochRewardPortion: "",
        foundationRewardPortion: ""
      };
    } catch (e) {
      window.console.error("failed to construct delegate profile contract");
    }
  }

  format = (key: string, value: number) => {
    return (
      prependLength(utf8ToHex(key)) +
      prependLength(castToUint16Hex(value))
    );
  };

  async getProfileByField(
    profileKey: string,
    delegateAddress: string
  ): Promise<ProfileField> {
    const bytesResult = await this.contract.methods.getProfileByField(
      delegateAddress,
      profileKey,
      {
        from: delegateAddress
      }
    );
    const hexValue = bytesResult.toString();
    window.console.log(
      `getProfileByField ${delegateAddress} ${profileKey} hexValue`,
      hexValue
    );
    switch (this.types[profileKey]) {
      case "permyriad":
        return {
          key: profileKey,
          value: hexValue ? Buffer.from(bytesResult, "hex").toString() : ""
        };
      default:
        return {
          key: profileKey,
          value: hexValue ? Buffer.from(bytesResult, "hex").toString() : ""
        };
    }
  }

  async updateProfile({
    foundationRewardPortion,
    epochRewardPortion,
    blockRewardPortion,
    address
  }: {
    foundationRewardPortion: number;
    epochRewardPortion: number;
    blockRewardPortion: number;
    address: string;
  }): Promise<string> {
    const byteCodes =
      // tslint:disable-next-line:prefer-template
      "0x" +
      this.format("foundationRewardPortion", Math.round(foundationRewardPortion)) +
      this.format("epochRewardPortion", Math.round(epochRewardPortion)) +
      this.format("blockRewardPortion", Math.round(blockRewardPortion));
    // tslint:disable-next-line:no-unnecessary-local-variable
    const hash = await this.contract.methods.updateProfileWithByteCode(
      byteCodes,
      {
        from: address,
        gasLimit: DEFAULT_STAKING_GAS_LIMIT,
        gasPrice: toRau("1", "Qev")
      }
    );
    return hash;
  }
}
