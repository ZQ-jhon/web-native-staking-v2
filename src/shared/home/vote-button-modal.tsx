import Button from "antd/lib/button";
import {t} from "onefx/lib/iso-i18n";
import React, {PureComponent} from "react";
import {CommonModal} from "../common/common-modal";
import {Flex} from "../common/flex";
import {VoteNowContainer} from "../staking/vote-now-steps/vote-now-container";

type VotingModalProps = {
  visible: boolean;
  onOk: Function;
  onCancel: Function;
};

export function VotingModal({
  visible,
  onCancel,
  onOk
}: VotingModalProps): JSX.Element {
  return (
    <CommonModal
      title={<b>{t("voting.iopay-reminder.title")}</b>}
      okText={t("button.understand")}
      cancelText={t("button.cancel")}
      visible={visible}
      onOk={onOk}
      onCancel={onCancel}
    >
      <p
        dangerouslySetInnerHTML={{
          __html: t("voting.iopay-reminder.content")
        }}
      />
    </CommonModal>
  );
}

type VotingButtonProps = {
  disabled?: boolean;
  launch(): void;
  size?: "small" | "large";
  children: JSX.Element | String;
  extra?: Object;
};

export class VotingButton extends PureComponent<VotingButtonProps> {
  render(): JSX.Element {
    const { launch, disabled, children, extra = {} } = this.props;
    return (
      <Button
        disabled={disabled}
        type={"primary"}
        {...extra}
        onClick={launch}
      >
        {children}
      </Button>
    );
  }
}

type Props = {
  // tslint:disable-next-line:no-any
  record: any;
};

type State = {
  showModal: boolean;
  currentCandidateName: string;
  shouldDisplayVotingModal: boolean;
  // tslint:disable-next-line:no-any
  currentCandidate: any;
  displayMobileList: boolean;
  shouldDisplayMetaMaskReminder: boolean;
  userConfirmedMetaMaskReminder: boolean
};

export class VoteButtonModal extends PureComponent<Props, State> {
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

  // tslint:disable-next-line:no-any
  showVotingModal = (record: any) => {
    let state = {
      currentCandidateName: record && record.registeredName,
      currentCandidate: record
    };
    state = this.state.userConfirmedMetaMaskReminder
      ? {
          ...state,
          // @ts-ignore
          shouldDisplayVotingModal: true
        }
      : { ...state, shouldDisplayMetaMaskReminder: true };
    this.setState(state);
  };

  handleMetaMaskReminderOk = () => {
    const nextState = {
      shouldDisplayMetaMaskReminder: false,
      userConfirmedMetaMaskReminder: true,
      shouldDisplayVotingModal: true
    };
    this.setState(nextState);
  };

  render(): JSX.Element {
    const { record } = this.props;
    // tslint:disable-next-line:no-any
    const launch = (record: any) => () => this.showVotingModal(record);
    const disabled = !record.status || record.status === "UNQUALIFIED";
    return (
      <Flex center={true}>
        <VotingButton launch={launch(record)} disabled={disabled}>
          {t("candidate.vote")}
        </VotingButton>
        <VotingModal
          visible={this.state.shouldDisplayMetaMaskReminder}
          onOk={() => {
            this.handleMetaMaskReminderOk();
          }}
          onCancel={() =>
            this.setState({ shouldDisplayMetaMaskReminder: false })
          }
        />
        {(
          // @ts-ignore
          <VoteNowContainer
            registeredName={this.state.currentCandidateName}
            displayOthers={false}
            forceDisplayModal={this.state.shouldDisplayVotingModal}
            requestDismiss={() => this.setState({ shouldDisplayVotingModal: false })}
          />
        )}
      </Flex>
    );
  }
}
