// @flow
import BigNumber from "bignumber.js";
import { getAntenna } from "../../common/get-antenna";
import { DecodeData, ERC20 } from "./erc20";
import { Vita } from "./vita";

BigNumber.config({ DECIMAL_PLACES: 6 });

export interface ITokenInfo {
  tokenAddress: string;
  balance: BigNumber;
  decimals: BigNumber;
  symbol: string;
  name: string;
  balanceString: string;
}

export interface IERC20TokenDict {
  [index: string]: Token;
}

export interface ITokenInfoDict {
  [index: string]: ITokenInfo;
}

export class Token {
  api: ERC20 | Vita;
  static tokenRefs: { [index: string]: Token } = {};
  isBidToken: boolean;

  constructor(api: ERC20 | Vita) {
    this.api = api;
  }

  isVita(): boolean {
    return this.api instanceof Vita;
  }

  static getToken(tokenAddress: string): Token {
    if (Token.tokenRefs[tokenAddress]) {
      return Token.tokenRefs[tokenAddress];
    }
    const api = Vita.create(tokenAddress, getAntenna().iotx);
    const token = new Token(api);
    Token.tokenRefs[tokenAddress] = token;
    return token;
  }

  decode(data: string): DecodeData {
    return this.api.decode(data);
  }

  async checkValid(): Promise<boolean> {
    try {
      const symbol = await this.api.symbol(this.api.address);
      return `${symbol}`.length > 0;
    } catch (error) {
      return false;
    }
  }

  async getInfo(walletAddress: string): Promise<ITokenInfo> {
    const api = this.api;
    const [balance, name, symbol, decimals] = await Promise.all<
      BigNumber,
      string,
      string,
      BigNumber
    >([
      api.balanceOf(walletAddress, walletAddress),
      api.name(walletAddress),
      api.symbol(walletAddress),
      api.decimals(walletAddress)
    ]);
    const balanceString = balance
      .dividedBy(new BigNumber(`1e${decimals.toNumber()}`))
      .toString(10);

    return {
      tokenAddress: this.api.address,
      balance,
      decimals,
      symbol,
      name,
      balanceString
    };
  }
}
