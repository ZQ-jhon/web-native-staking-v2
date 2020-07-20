import { t } from "onefx/lib/iso-i18n";
import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { CommonModal } from "../common/common-modal";
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
  showHelpModal: boolean;
};

// @ts-ignore
@connect(state => ({
  // @ts-ignore
  isIoPayMobile: state.base.isIoPayMobile,
  // @ts-ignore
  isInAppWebview: state.base.isInAppWebview,
  // @ts-ignore
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
      displayMobileList: false,
      showHelpModal: !!(this.props.isInAppWebview && !this.props.isIoPayMobile)
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
    const { isMobile, isInAppWebview } = this.props;
    return (
      <>
        <VotingBanner
          showVotingModal={this.showVotingModal}
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
        <CommonModal
          title={null}
          okText={t("button.continue")}
          cancelText={null}
          visible={this.state.showHelpModal}
          onOk={() => {
            this.setState({ showHelpModal: false });
          }}
          onCancel={() => {
            this.setState({ showHelpModal: false });
          }}
        >
          <p
            dangerouslySetInnerHTML={{
              __html: t("voting.banner_content.modal")
            }}
          />
        </CommonModal>
      </>
    );
  }
}

export { VotingBannerModal };
