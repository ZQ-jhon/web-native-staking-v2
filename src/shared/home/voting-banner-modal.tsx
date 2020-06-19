import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { VoteNowContainer } from "../staking/vote-now-steps/vote-now-container";
import { VotingModal } from "./vote-button-modal";
import { VotingBanner } from "./voting-banner";

type Props = {
  isMobile: boolean;
  // tslint:disable-next-line:no-any
  history: any;
  isIoPayMobile?: boolean;
  isInAppWebview?: boolean;
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
};

// @ts-ignore
// tslint:disable-next-line:no-any
@connect(state => ({
  isIoPayMobile: state.base.isIoPayMobile,
  isInAppWebview: state.base.isInAppWebview,
  isMobile: state.base.isMobile
}))
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
      displayMobileList: false
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
    const { isIoPayMobile } = this.props;

    if (this.state.userConfirmedMetaMaskReminder) {
      this.setState({
        currentCandidateName: record && record.registeredName,
        shouldDisplayVotingModal: true,
        currentCandidate: record
      });
    } else {
      this.setState({
        currentCandidateName: record && record.registeredName,
        shouldDisplayMetaMaskReminder: !isIoPayMobile,
        shouldDisplayVotingModal: !!isIoPayMobile,
        currentCandidate: record
      });
    }
  };

  render(): JSX.Element {
    const { isMobile, history, isIoPayMobile, isInAppWebview } = this.props;
    const showVotingModal =
      isMobile && !isIoPayMobile
        ? () => {
            history.push(isIoPayMobile ? "/vote-native/" : "/vote/");
          }
        : this.showVotingModal;
    return (
      <>
        <VotingBanner
          showVotingModal={showVotingModal}
          displayMobileList={!!isMobile}
          isInAppWebview={!!isInAppWebview}
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
