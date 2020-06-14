import PlusOutlined from "@ant-design/icons/PlusOutlined";
import Alert from "antd/lib/alert";
import { t } from "onefx/lib/iso-i18n";
import Helmet from "onefx/lib/react-helmet";
import React, { Component } from "react";
import { connect } from "react-redux";
import { CommonMargin } from "../common/common-margin";
import { IopayRequired } from "../common/iopay-required";
import { VotingButton } from "../home/vote-button-modal";
import { VoteNowContainer } from "../staking/vote-now-steps/vote-now-container";
import { BucketsLoader } from "./account-meta";
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
      <StakingContractContainer />
      <CommonMargin />
    </div>
  );
}

export class StakingContractContainer extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showVoteNowModal: false
    };
  }

  render(): JSX.Element {
    return (
      <div>
        <SmartContractCalled />
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

        <CommonMargin />

        <MyVotesTableWrapper />

        <VoteNowContainer
          displayOthers={false}
          forceDisplayModal={this.state.showVoteNowModal}
          requestDismiss={() => this.setState({ showVoteNowModal: false })}
        />
      </div>
    );
  }
}

@IopayRequired
// @ts-ignore
class MyVotesTableWrapper extends Component {
  render(): JSX.Element {
    return (
      <>
        <BucketsLoader />
        <MyVotesTable />
      </>
    );
  }
}

const SmartContractCalled = connect(
  (state: { smartContract: { smartContractCalled: boolean } }) => {
    return {
      smartContractCalled:
        state.smartContract && state.smartContract.smartContractCalled
    };
  }
)(function Inner({
  smartContractCalled
}: {
  smartContractCalled: boolean;
}): JSX.Element {
  return (
    <>
      {smartContractCalled && (
        <div>
          <Alert
            message={t("contract.called")}
            type="success"
            showIcon={true}
          />
          <CommonMargin />
        </div>
      )}
    </>
  );
});
