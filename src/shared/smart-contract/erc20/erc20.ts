// @flow
import BigNumber from "bignumber.js";
// $FlowFixMe
import ethereumjs from "ethereumjs-abi";
import { Account } from "iotex-antenna/lib/account/account";
import {
  getArgTypes,
  getHeaderHash
} from "iotex-antenna/lib/contract/abi-to-byte";
import { Contract } from "iotex-antenna/lib/contract/contract";
import { fromBytes } from "iotex-antenna/lib/crypto/address";
import { IRpcMethod } from "iotex-antenna/lib/rpc-method/types";
import { ABI } from "./abi";
import { Buffer } from "buffer";

export interface Method {
  name: string;
  inputsNames: [string];
  inputsTypes: [string];
}

export interface DecodeData {
  method: string;
  data: { [key: string]: any };
}

export interface IERC20 {
  address: string;

  name(callerAddress: string): Promise<string>;

  symbol(callerAddress: string): Promise<string>;

  decimals(callerAddress: string): Promise<BigNumber>;

  totalSupply(callerAddress: string): Promise<BigNumber>;

  balanceOf(owner: string, callerAddress: string): Promise<BigNumber>;

  transfer(
    to: string,
    value: BigNumber,
    account: Account,
    gasPrice: string,
    gasLimit: string
  ): Promise<string>;

  allowance(
    owner: string,
    spender: string,
    account: Account,
    gasPrice: string,
    gasLimit: string
  ): Promise<string>;

  approve(
    spender: string,
    value: BigNumber,
    account: Account,
    gasPrice: string,
    gasLimit: string
  ): Promise<string>;

  transferFrom(
    from: string,
    to: string,
    value: BigNumber,
    account: Account,
    gasPrice: string,
    gasLimit: string
  ): Promise<string>;

  decode(data: string): DecodeData;
}

export class ERC20 implements IERC20 {
  address: string;
  contract: Contract;
  provider: IRpcMethod;
  methods: { [key: string]: Method };

  static create(
    address: string,
    provider: IRpcMethod,
    abi: Array<{}> = ABI
  ): ERC20 {
    const erc20 = new ERC20();
    erc20.address = address;
    erc20.provider = provider;
    erc20.contract = new Contract(abi, address, {
      provider: provider
    });

    const methods = {};

    for (const fnName of Object.keys(erc20.contract.getABI())) {
      const fnAbi = erc20.contract.getABI()[fnName];
      if (fnAbi.type === "constructor") {
        continue;
      }

      const args = getArgTypes(fnAbi);
      const header = getHeaderHash(fnAbi, args);

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
    erc20.methods = methods;
    return erc20;
  }

  async name(callerAddress: string): Promise<string> {
    const result = await this.readMethod("name", callerAddress);
    const data = ethereumjs.rawDecode(["string"], Buffer.from(result, "hex"));
    if (data.length > 0) {
      return data[0];
    }
    return "";
  }

  async symbol(callerAddress: string): Promise<string> {
    const result = await this.readMethod("symbol", callerAddress);
    const data = ethereumjs.rawDecode(["string"], Buffer.from(result, "hex"));
    if (data.length > 0) {
      return data[0];
    }
    return "";
  }

  async decimals(callerAddress: string): Promise<BigNumber> {
    const result = await this.readMethod("decimals", callerAddress);
    return new BigNumber(result, 16);
  }

  async totalSupply(callerAddress: string): Promise<BigNumber> {
    const result = await this.readMethod("totalSupply", callerAddress);
    return new BigNumber(result, 16);
  }

  async balanceOf(owner: string, callerAddress: string): Promise<BigNumber> {
    const result = await this.readMethod("balanceOf", callerAddress, owner);
    return new BigNumber(result, 16);
  }

  async transfer(
    to: string,
    value: BigNumber,
    account: Account,
    gasPrice: string,
    gasLimit: string
  ): Promise<string> {
    return this.executeMethod(
      "transfer",
      account,
      gasPrice,
      gasLimit,
      "0",
      to,
      value.toFixed(0)
    );
  }

  async allowance(
    owner: string,
    spender: string,
    account: Account,
    gasPrice: string,
    gasLimit: string
  ): Promise<string> {
    return this.executeMethod(
      "allowance",
      account,
      gasPrice,
      gasLimit,
      "0",
      owner,
      spender
    );
  }

  async approve(
    spender: string,
    value: BigNumber,
    account: Account,
    gasPrice: string,
    gasLimit: string
  ): Promise<string> {
    return this.executeMethod(
      "approve",
      account,
      gasPrice,
      gasLimit,
      "0",
      spender,
      value.toString()
    );
  }

  async transferFrom(
    from: string,
    to: string,
    value: BigNumber,
    account: Account,
    gasPrice: string,
    gasLimit: string
  ): Promise<string> {
    return this.executeMethod(
      "transferFrom",
      account,
      gasPrice,
      gasLimit,
      "0",
      from,
      to,
      value.toString()
    );
  }

  async readMethod(
    method: string,
    callerAddress: string,
    ...args: any
  ): Promise<string> {
    const result = await this.provider.readContract({
      execution: this.contract.pureEncodeMethod("0", method, ...args),
      callerAddress: callerAddress
    });

    return result.data;
  }

  async executeMethod(
    method: string,
    account: Account,
    gasPrice: string,
    gasLimit: string,
    amount: string,
    // tslint:disable-next-line
    ...args: Array<any>
  ): Promise<string> {
    return this.contract.methods[method](...args, {
      account: account,
      amount: amount,
      gasLimit: gasLimit,
      gasPrice: gasPrice
    });
  }

  decode(data: string): DecodeData {
    if (data.length < 8) {
      throw new Error("input data error");
    }
    const methodKey = data.substr(0, 8);
    const method = this.methods[methodKey];
    if (!method) {
      throw new Error(`method ${methodKey} is not erc20 method`);
    }
    const params = ethereumjs.rawDecode(
      method.inputsTypes,
      Buffer.from(data.substring(8), "hex")
    );
    const values = {};

    for (let i = 0; i < method.inputsTypes.length; i++) {
      if (method.inputsTypes[i] === "address") {
        params[i] = fromBytes(
          Buffer.from(params[i].toString(), "hex")
        ).string();
      }

      values[method.inputsNames[i]] = params[i];
    }

    return {
      method: method.name,
      data: values
    };
  }
}
