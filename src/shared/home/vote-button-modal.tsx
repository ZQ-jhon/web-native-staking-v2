import Button from "antd/lib/button";
import Dropdown from "antd/lib/dropdown";
import Icon from "antd/lib/icon";
import Menu from "antd/lib/menu";
import { isMobile } from "is-mobile";
import { t } from "onefx/lib/iso-i18n";
import React, { PureComponent } from "react";
import { CommonModal } from "../common/common-modal";
import { Flex } from "../common/flex";
import { VotingCandidateView } from "./voting-candidate-view";

type VotingModalProps = {
  visible: boolean;
  isNative: boolean;
  onOk: Function;
  onCancel: Function;
};

export function VotingModal({
  visible,
  isNative,
  onCancel,
  onOk
}: VotingModalProps): JSX.Element {
  return (
    <CommonModal
      title={<b>{t("voting.metamask-reminder.title")}</b>}
      okText={t("button.understand")}
      cancelText={t("button.cancel")}
      visible={visible}
      onOk={onOk}
      onCancel={onCancel}
    >
      <p
        dangerouslySetInnerHTML={{
          __html: t(
            isNative
              ? "voting.iopay-reminder.content"
              : "voting.metamask-reminder.content"
          )
        }}
      />
    </CommonModal>
  );
}

type VotingButtonProps = {
  disabled?: boolean;
  launch(isNative: boolean): void;
  size?: "small" | "large";
  children: JSX.Element | String;
  extra?: Object;
};

export class VotingButton extends PureComponent<VotingButtonProps> {
  render(): JSX.Element {
    const { launch, disabled, children, extra = {} } = this.props;

    const handleClick = (isNative: boolean) => () => launch(isNative);
    const menu = (
      <Menu>
        <Menu.Item key="erc20">
          <span role="button" onClick={handleClick(false)}>
            {t("candidate.vote.erc20")}
          </span>
        </Menu.Item>
        <Menu.Item key="native">
          <span role="button" onClick={handleClick(true)}>
            {t("candidate.vote.native")}
          </span>
        </Menu.Item>
      </Menu>
    );

    return isMobile() ? (
      <Button type={"primary"} {...extra} onClick={handleClick(false)}>
        {children}
      </Button>
    ) : (
      <Dropdown overlay={menu} disabled={disabled}>
        <Button type="primary" {...extra}>
          {children}
          {/*
        // @ts-ignore */}
          <Icon type="caret-down" />
        </Button>
      </Dropdown>
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
  userConfirmedMetaMaskReminder: boolean;
  isNative: boolean;
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
      displayMobileList: false,
      isNative: false
    };
  }

  // tslint:disable-next-line:no-any
  showVotingModal = (record: any, isNative: boolean) => {
    let state = {
      currentCandidateName: record && record.registeredName,
      currentCandidate: record,
      isNative
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
    const { isNative } = this.state;
    // tslint:disable-next-line:no-any
    const launch = (record: any) => (isNative: boolean) =>
      this.showVotingModal(record, isNative);
    const disabled = !record.status || record.status === "UNQUALIFIED";
    return (
      <Flex center={true}>
        <VotingButton launch={launch(record)} disabled={disabled}>
          {t("candidate.vote")}
        </VotingButton>
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
          isNative={this.state.isNative}
          onOk={() => this.setState({ shouldDisplayVotingModal: false })}
          onCancel={() => this.setState({ shouldDisplayVotingModal: false })}
        />
      </Flex>
    );
  }
}
