import PlusOutlined from "@ant-design/icons/PlusOutlined";
import RedoOutlined from "@ant-design/icons/RedoOutlined";
import Alert from "antd/lib/alert";
import { t } from "onefx/lib/iso-i18n";
import Helmet from "onefx/lib/react-helmet";
import { styled } from "onefx/lib/styletron-react";
import React, { Component, PureComponent } from "react";
import { connect } from "react-redux";
import { CommonMargin } from "../common/common-margin";
import { IopayRequired } from "../common/iopay-required";
import { colors } from "../common/styles/style-color";
import { fonts } from "../common/styles/style-font";
import { VotingButton } from "../home/vote-button-modal";
import { VoteNowContainer } from "../staking/vote-now-steps/vote-now-container";
import { BucketsLoader } from "./account-meta";
import { MyVotesTable } from "./my-votes-table";

type State = {
  showVoteNowModal: boolean;
  isBlur: boolean;
};

type Props = {
  isMobile?: boolean;
  isIoPayMobile?: boolean;
  isInAppWebview?: boolean;
};

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

// @ts-ignore
@connect((state) => ({
  // @ts-ignore
  isIoPayMobile: state.base.isIoPayMobile,
  // @ts-ignore
  isInAppWebview: state.base.isInAppWebview,
  // @ts-ignore
  isMobile: state.base.isMobile,
}))
export class StakingContractContainer extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showVoteNowModal: false,
      isBlur: false,
    };
  }

  refreshPage = () => {
    window.location.reload();
  };

  componentDidMount(): void {
    window.onblur = () => {
      this.setState({
        isBlur: true,
      });
    };
  }
  openDeepLink = () => {
    const a = document.createElement("a");
    const tagId = "startIoPay";
    a.setAttribute("href", "iopay://io.iotex.iopay/open?action=stake");
    a.setAttribute("id", tagId);
    if (document.getElementById(tagId)) {
      // @ts-ignore
      document.body.removeChild(document.getElementById(tagId));
    }
    document.body.appendChild(a);
    a.click();
  };

  ioPayIsInstall = () => {
    this.openDeepLink();
    setTimeout(() => {
      if (!this.state.isBlur) {
        location.href = "http://iopay.iotex.io";
      }
    }, 3000);
  };

  render(): JSX.Element {
    const { isIoPayMobile, isMobile } = this.props;
    return (
      <div>
        <SmartContractCalled />
        {isMobile && !isIoPayMobile ? (
          <VotingButton
            launch={() => {
              this.ioPayIsInstall();
            }}
            disabled={false}
            extra={{ size: "large" }}
          >
            <span>
              <PlusOutlined />
              {t("my_stake.button.vote_with_iopay")}
            </span>
          </VotingButton>
        ) : (
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
        )}

        <RefreshButtonStyle onClick={() => this.refreshPage()}>
          <RedoOutlined style={{ marginRight: 4 }} />
          {t("my_stake.refresh_list")}
        </RefreshButtonStyle>

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
        state.smartContract && state.smartContract.smartContractCalled,
    };
  }
)(function Inner({
  smartContractCalled,
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

const RefreshButtonStyle = styled("span", () => ({
  ...fonts.body,
  backgroundColor: colors.white,
  color: colors.primary,
  float: "right",
  lineHeight: "55px",
}));
