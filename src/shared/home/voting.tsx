import Button from "antd/lib/button";
import Layout from "antd/lib/layout";
import BlockProducers, {
  RenderDelegateComponent
} from "iotex-react-block-producers";
import { assetURL } from "onefx/lib/asset-url";
import { t } from "onefx/lib/iso-i18n";
import React, { Component } from "react";
import { connect } from "react-redux";
import {RouteComponentProps, withRouter} from "react-router";
import { webBpApolloClient as apolloClient } from "../common/apollo-client";
import { colors } from "../common/styles/style-color";
import { VoteButtonModal } from "./vote-button-modal";

export const MAX_WIDTH = 1320;

type State = {
  showModal: boolean;
  currentCandidateName: string;
  // tslint:disable-next-line:no-any
  currentCandidate: any;
  shouldDisplayMetaMaskReminder: boolean;
  userConfirmedMetaMaskReminder: boolean;
};

type Props = {
  isMobile: boolean;
} & RouteComponentProps;

class VotingInner extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showModal: false,
      currentCandidateName: "",
      shouldDisplayMetaMaskReminder: false,
      userConfirmedMetaMaskReminder: false,
      currentCandidate: null
    };
  }

  // @ts-ignore
  // tslint:disable-next-line:no-any
  renderAction = (text: string, record: any) => {
    return <VoteButtonModal record={record} />;
  };

  // tslint:disable-next-line:no-any
  mobileVoteButtonRender: RenderDelegateComponent = (delegate: any) => {
    const { history } = this.props;
    const disabled = !delegate.status || delegate.status === "UNQUALIFIED";
    return (
      <div style={{ padding: "0 15px", textAlign: "center" }}>
        <Button
          style={{ width: "90px", height: "37px" }}
          type="primary"
          onClick={() => {
            if (history && history.push) {
              history.push(
                `vote-native/${encodeURIComponent(delegate.registeredName)}`
              );
            }
          }}
          disabled={disabled}
        >
          {t("candidate.vote")}
        </Button>
      </div>
    );
  };

  render(): JSX.Element {
    const layoutStyle = {
      width: "100%",
      maxWidth: `${MAX_WIDTH}px`,
      backgroundColor: colors.white
    };

    return (
      <div style={{ position: "relative" }}>
        <Layout style={{ ...layoutStyle, marginBottom: "15px" }}>
          <BlockProducers
            apolloClient={apolloClient}
            extraColumns={[
              {
                title: t("candidate.node_version"),
                key: "nodeVersion",
                dataIndex: "nodeVersion",
                render: (text?: string) => {
                  return `${text || ""}`;
                }
              },
              {
                title: "",
                key: "action",
                width: "140px",
                render: this.renderAction,
                customRender: null
              }
            ]}
            extraMobileComponents={[this.mobileVoteButtonRender]}
            badgeImg={assetURL("bnbridge/hermes.svg")}
          />
        </Layout>
      </div>
    );
  }
}

export const Voting = withRouter(
  connect((state: { base: { isMobile: boolean } }) => ({
    isMobile: state.base.isMobile
  }))(VotingInner)
);
