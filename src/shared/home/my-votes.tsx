import PlusOutlined from "@ant-design/icons/PlusOutlined";
import notification from "antd/lib/notification";
import Tabs from "antd/lib/tabs";
import { t } from "onefx/lib/iso-i18n";
import Helmet from "onefx/lib/react-helmet";
import React, { Component } from "react";
import { connect } from "react-redux";
import { CommonMargin } from "../common/common-margin";
import { VotingButton } from "../home/vote-button-modal";
import { VoteNowContainer } from "../staking/vote-now-steps/vote-now-container";
import { MyVotesTable } from "./my-votes-table";

type State = {
  showVoteNowModal: boolean;
};

type Props = {};

// path: /my-votes
export function MyVotes(): JSX.Element {
  return (
    <div>
      <Helmet title={`${t("my_stake.title")} - ${t("meta.description")}`} />
      <CommonMargin />
      <StakingContractContainer />
    </div>
  );
}

// $FlowFixMe
export const StakingContractContainer = connect()(
  class StakingContract extends Component<Props, State> {
    constructor(props: Props) {
      super(props);
      this.state = {
        showVoteNowModal: false
      };
    }

    render(): JSX.Element {
      const isIoPay = false;

      return (
        <div style={{ width: "100%" }}>
          <VotingButton
            launch={() => this.setState({ showVoteNowModal: true })}
            disabled={false}
            extra={{ size: "large" }}
          >
            <span>
              <PlusOutlined />
              {t("my_stake.new_vote")}
            </span>
          </VotingButton>

          <MyVotesTab isIoPay={isIoPay} />
          {
            // @ts-ignore
            <VoteNowContainer
              displayOthers={false}
              forceDisplayModal={this.state.showVoteNowModal}
              requestDismiss={() => this.setState({ showVoteNowModal: false })}
            />
          }
        </div>
      );
    }
  }
);

type MyVotesProps = {
  isIoPay?: boolean;
};

function MyVotesTab({ isIoPay }: MyVotesProps): JSX.Element {
  const { TabPane } = Tabs;
  const defaultActiveKey = isIoPay ? "2" : "1";
  return (
    <Tabs
      defaultActiveKey={defaultActiveKey}
      onChange={activeKey => {
        /**
         * FIXME: temporary fix, we should enhance the ws plugin so that the caller can customize the handler if connection can not be established.
         */
        if (activeKey === "2" && !isIoPay) {
          notification.warn({
            message: t("my_votes.nativeStaking.open_ioPay_alert"),
            duration: 5
          });
        }
      }}
    >
      {!isIoPay && (
        <TabPane
          tab={VotesTabContainer({ name: "my_votes.erc20_tab", total: 0 })}
          key="1"
        >
          <MyVotesTable />
        </TabPane>
      )}
      <TabPane
        tab={VotesTabContainer({ name: "my_votes.native_tab", total: 0 })}
        key="2"
      >
        <MyVotesTable />
      </TabPane>
    </Tabs>
  );
}

type VotesTabContainerProps = {
  name: string;
  total: number;
};

function VotesTabContainer({
  name,
  total
}: VotesTabContainerProps): JSX.Element {
  return (
    <>
      <span>{t(name)}</span>
      {!Number.isNaN(total) && (
        <span style={{ marginLeft: "1em" }}>{total}</span>
      )}
    </>
  );
}
