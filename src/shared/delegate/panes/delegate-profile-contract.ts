/* tslint:disable:no-any */
// @flow
import { toRau } from "iotex-antenna/lib/account/utils";
import { Contract } from "iotex-antenna/lib/contract/contract";
import { lazyGetContract } from "../../common/get-antenna";
import { hexToUtf8, numberToHex, utf8ToHex } from "../../common/hex-utils";
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
        blockRewardPortion: "permyriad",
        epochRewardPortion: "permyriad",
        foundationRewardPortion: "permyriad"
      };
    } catch (e) {
      window.console.error("failed to construct delegate profile contract");
    }
  }

  format = (key: string, value: number) => {
    return (
      prependLength(utf8ToHex(key)) + prependLength(castToUint16Hex(value))
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
    window.console.log(
      `getProfileByField ${delegateAddress} ${profileKey} bytesResult`,
      bytesResult
    );
    const value = Buffer.from(bytesResult).toString("hex");
    window.console.log(`value `, value);
    switch (this.types[profileKey]) {
      case "permyriad":
        const numberValue = value ? parseInt(value, 16) / 100 : "";
        window.console.log(`numberValue `, numberValue);
        return {
          key: profileKey,
          value: numberValue
        };
      default:
        return {
          key: profileKey,
          value: hexToUtf8(value)
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
      this.format(
        "foundationRewardPortion",
        Math.round(foundationRewardPortion * 100)
      ) +
      this.format("epochRewardPortion", Math.round(epochRewardPortion * 100)) +
      this.format("blockRewardPortion", Math.round(blockRewardPortion * 100));
    const buffer = Buffer.from(byteCodes, "hex");
    window.console.log(`buffer`, buffer);
    // tslint:disable-next-line:no-unnecessary-local-variable
    const hash = await this.contract.methods.updateProfileWithByteCode(buffer, {
      from: address,
      gasLimit: DEFAULT_STAKING_GAS_LIMIT,
      gasPrice: toRau("1", "Qev")
    });
    return hash;
  }
}
