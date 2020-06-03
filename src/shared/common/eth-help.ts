// @flow
// @ts-ignore
import EthContract from "ethjs-contract";
// @ts-ignore
import window from "global/window";
import { STAKING_ABI } from "../smart-contract/staking-abi";
import { calcStats } from "../smart-contract/my-votes-table";
import { Eth } from "../../shared/common/ethjs-query";
import { enableEthereum } from "./enable-ethereum";
import { WeiToTokenValueFloor } from "./token-utils";
import { TOKEN_ABI } from "../smart-contract/token-abi";

export async function getStakedAmount(stakingContractAddr: any):any {
  const isMetaMaskInstalled = typeof window.web3 !== "undefined";

  if (isMetaMaskInstalled) {
    await enableEthereum();
    // @ts-ignore
    const eth = new Eth(window.web3.currentProvider);
    const contract = new EthContract(eth);
    const stakingContract = contract(STAKING_ABI).at(stakingContractAddr);

    const isMetaMaskUnlocked =
      window.web3.eth.accounts && window.web3.eth.accounts.length > 0;
    if (isMetaMaskUnlocked) {
      const addr = window.web3.eth.accounts[0];
      let resp = await stakingContract.getBucketIndexesByAddress(addr, {
        from: addr
      });
      const bucketIds = (resp && resp[0].map((id:any) => id.toNumber())) || [];

      resp = await Promise.all(
        bucketIds.map((id: string)=> stakingContract.buckets(id, { from: addr }))
      );
      const stakeStatus = calcStats(addr, bucketIds, resp);

      if (stakeStatus && stakeStatus.totalStaking) {
        return stakeStatus.totalStaking;
      }
      return 0;
    }
  }
}

export function getEthworkAddress(provider: any): string {
  switch (provider.networkVersion) {
    case "1":
      return "etherscan.io";
    case "3":
      return "ropsten.etherscan.io";
    case "4":
      return "rinkeby.etherscan.io";
    case "42":
      return "kovan.etherscan.io";
    default:
      return "etherscan.io";
  }
}

export async function getIotxEBalance(tokenContractAddr: any){
  const isMetaMaskInstalled = typeof window.web3 !== "undefined";

  if (isMetaMaskInstalled) {
    // @ts-ignore
    const eth = new Eth(window.web3.currentProvider);
    const tokenContractInstance = new EthContract(eth);
    const tokenContract = tokenContractInstance(TOKEN_ABI).at(
      tokenContractAddr
    );

    await enableEthereum();

    const isMetaMaskUnlocked =
      window.web3.eth.accounts && window.web3.eth.accounts.length > 0;
    if (!isMetaMaskUnlocked) {
      return 0;
    } else {
      const addr = window.web3.eth.accounts[0];
      const balance = await tokenContract.balanceOf(addr);
      return balance[0] ? WeiToTokenValueFloor(balance[0].toString()) : 0;
    }
  }
  return 0;
}
