import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { VotingModal } from "./vote-button-modal";
import { VotingBanner } from "./voting-banner";
import { VotingCandidateView } from "./voting-candidate-view";

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
  showVotingModal = (record: any, isNative: boolean) => {
    const { isIoPay } = this.props;

    if (this.state.userConfirmedMetaMaskReminder) {
      this.setState({
        currentCandidateName: record && record.registeredName,
        shouldDisplayVotingModal: true,
        currentCandidate: record,
        isNative
      });
    } else {
      this.setState({
        currentCandidateName: record && record.registeredName,
        shouldDisplayMetaMaskReminder: !isIoPay,
        shouldDisplayVotingModal: !!isIoPay,
        currentCandidate: record,
        isNative
      });
    }
  };

  render(): JSX.Element {
    const { isMobile, history, isIoPay } = this.props;
    const { isNative } = this.state;
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
          isNative={isNative}
          onOk={() => {
            this.handleMetaMaskReminderOk();
          }}
          onCancel={() =>
            this.setState({ shouldDisplayMetaMaskReminder: false })
          }
        />
        <VotingCandidateView
          registeredName={this.state.currentCandidateName}
          showModal={this.state.shouldDisplayVotingModal}
          isNative={isNative}
          onOk={() => this.setState({ shouldDisplayVotingModal: false })}
          onCancel={() => this.setState({ shouldDisplayVotingModal: false })}
        />
      </>
    );
  }
}

export { VotingBannerModal };
