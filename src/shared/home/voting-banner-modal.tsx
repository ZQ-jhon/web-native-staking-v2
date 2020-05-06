import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { VoteNowContainer } from "../staking/vote-now-steps/vote-now-container";
import { VotingModal } from "./vote-button-modal";
import { VotingBanner } from "./voting-banner";

type Props = {
  isMobile: boolean;
  // tslint:disable-next-line:no-any
  history: any;
  isIoPay?: boolean;
};

type State = {
  showModal: boolean;
  currentCandidateName: string;
  shouldDisplayVotingModal: boolean;
  // tslint:disable-next-line:no-any
  currentCandidate: any;
  displayMobileList: boolean;
  shouldDisplayMetaMaskReminder: boolean;
  userConfirmedMetaMaskReminder: boolean;
  isNative: boolean;
};

// @ts-ignore
// tslint:disable-next-line:no-any
@connect(state => ({ isIoPay: state.base.isIoPay }))
class VotingBannerModal extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showModal: false,
      currentCandidateName: "",
      shouldDisplayVotingModal: false,
      shouldDisplayMetaMaskReminder: false,
      userConfirmedMetaMaskReminder: false,
      currentCandidate: null,
      displayMobileList: false,
      isNative: false
    };
  }

  handleMetaMaskReminderOk = () => {
    const nextState = {
      shouldDisplayMetaMaskReminder: false,
      userConfirmedMetaMaskReminder: true,
      shouldDisplayVotingModal: true
    };
    this.setState(nextState);
  };
  // tslint:disable-next-line:no-any
  showVotingModal = (record: any) => {
    const { isIoPay } = this.props;

    if (this.state.userConfirmedMetaMaskReminder) {
      this.setState({
        currentCandidateName: record && record.registeredName,
        shouldDisplayVotingModal: true,
        currentCandidate: record
      });
    } else {
      this.setState({
        currentCandidateName: record && record.registeredName,
        shouldDisplayMetaMaskReminder: !isIoPay,
        shouldDisplayVotingModal: !!isIoPay,
        currentCandidate: record
      });
    }
  };

  render(): JSX.Element {
    const { isMobile, history, isIoPay } = this.props;
    const showVotingModal =
      isMobile && !isIoPay
        ? () => {
            history.push(isIoPay ? "/vote-native/" : "/vote/");
          }
        : this.showVotingModal;
    return (
      <>
        <VotingBanner
          showVotingModal={showVotingModal}
          displayMobileList={isMobile}
        />
        <VotingModal
          visible={this.state.shouldDisplayMetaMaskReminder}
          onOk={() => {
            this.handleMetaMaskReminderOk();
          }}
          onCancel={() =>
            this.setState({ shouldDisplayMetaMaskReminder: false })
          }
        />
        {
          // @ts-ignore
          <VoteNowContainer
            registeredName={this.state.currentCandidateName}
            displayOthers={false}
            forceDisplayModal={this.state.shouldDisplayVotingModal}
            requestDismiss={() =>
              this.setState({ shouldDisplayVotingModal: false })
            }
          />
        }
      </>
    );
  }
}

export { VotingBannerModal };
