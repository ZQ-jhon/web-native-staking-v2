// @flow
import React, { Component } from "react";
import { message } from "antd";
// @ts-ignore
import window from "global/window";
import { t } from "onefx/lib/iso-i18n";
import isBrowser from "is-browser";
// @ts-ignore
//import EthContract from "ethjs-contract";
import { connect } from "react-redux";
// import Eth from "../../shared/common/ethjs-query";
//import { enableEthereum } from "../common/enable-ethereum";
import { VoteNowContainer } from "../staking/vote-now-steps/vote-now-container";
//import { STAKING_ABI } from "./staking-abi";
//import { curryGetTokenContract } from "../common/get-antenna";

type Props = {
  registeredName?: string;
  showModal?: boolean;
  requestDismiss: () => any;
  stakingContractAddr?: string;
  tokenContractAddr?: string;
  currentCandidate?: any;
  isNative?: boolean;
  nativeTokenContractAddr?: string;
  nativePatchTokenContractAddr?: string;
  isIoPay?: boolean;
};

type State = {
  isMetaMaskInstalled?: boolean;
  isMetaMaskUnlocked?: boolean;
};
// @ts-ignore
@connect((state: any) => ({
  stakingContractAddr: state.smartContract.stakingContractAddr,
  tokenContractAddr: state.smartContract.tokenContractAddr,
  nativeTokenContractAddr: state.smartContract.nativeTokenContractAddr,
  nativePatchTokenContractAddr:
    state.smartContract.nativePatchTokenContractAddr,
  isIoPay: state.base.isIoPay,
}))
class VotingCandidateView extends Component<Props, State> {
  state = {
    isMetaMaskInstalled: undefined,
    isMetaMaskUnlocked: true,
  };

  props: Props;

  stakingContract: any = null;
  eth: any = null;

  async componentDidMount(): Promise<void> {
    const { /*stakingContractAddr*/ isIoPay } = this.props;

    if (isIoPay) {
      this.setState({ isMetaMaskUnlocked: true, isMetaMaskInstalled: true });
      return;
    }

    const isMetaMaskInstalled = typeof window.web3 !== "undefined";
    this.setState({ isMetaMaskInstalled });

    if (isMetaMaskInstalled) {
      //this.eth = new Eth(window.web3.currentProvider);
      //const contract = new EthContract(this.eth);
      // const StakingContract = contract(STAKING_ABI);
      //this.stakingContract = StakingContract.at(stakingContractAddr);

      //await enableEthereum();

      const isMetaMaskUnlocked =
        window.web3.eth.accounts && window.web3.eth.accounts.length > 0;
      if (!isMetaMaskUnlocked) {
        this.setState({ isMetaMaskUnlocked: false });
      }
    }
  }

  render() {
    const {
      registeredName,
      showModal,
      requestDismiss,
      currentCandidate,
      //isNative,
      //nativeTokenContractAddr,
      //nativePatchTokenContractAddr,
      //tokenContractAddr,
      //isIoPay
    } = this.props;
    const { isMetaMaskInstalled, isMetaMaskUnlocked } = this.state;
    //const tokenContract = curryGetTokenContract(
    //   Boolean(isNative),
    //   nativeTokenContractAddr,
    //   nativePatchTokenContractAddr,
    //   tokenContractAddr,
    //   this.eth
    // );

    switch (isMetaMaskInstalled) {
      case undefined:
        return null;
      // @ts-ignore
      case false:
        if (showModal) {
          message.error(t("contract.install"));
        }
        return null;
      // @ts-ignore
      case true:
      default:
        if (showModal && (!isMetaMaskUnlocked || !isBrowser)) {
          message.error(t("contract.please_unlock"));
          return null;
        }

        return (
          <div style={{ width: "100%" }}>
            {showModal && (
              <VoteNowContainer
                //stakingContract={this.stakingContract}
                //tokenContract={tokenContract}
                //addr={isIoPay ? "" : window.web3.eth.accounts[0]}
                registeredName={registeredName}
                forceDisplayModal={showModal}
                requestDismiss={requestDismiss}
                displayOthers={false}
                currentCandidate={currentCandidate}
                //isNative={isNative}
              />
            )}
          </div>
        );
    }
  }
}

export { VotingCandidateView };
