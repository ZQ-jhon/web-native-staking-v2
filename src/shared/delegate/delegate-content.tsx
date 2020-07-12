import Breadcrumb from "antd/lib/breadcrumb";
import Layout from "antd/lib/layout";
import Menu from "antd/lib/menu";
import notification from "antd/lib/notification";
import { SpinPreloader } from "iotex-react-block-producers/lib/spin-preloader";
import { t } from "onefx/lib/iso-i18n";
import { RouteComponentProps } from "onefx/lib/react-router";
import { Component } from "react";
import React from "react";
import { Query, QueryResult } from "react-apollo";
import { withRouter } from "react-router";
import { TBpCandidate } from "../../types";
import { webBpApolloClient } from "../common/apollo-client";
import { CommonMargin } from "../common/common-margin";
import { colors } from "../common/styles/style-color2";
import { ContentPadding } from "../common/styles/style-padding";
import { GET_BP_CANDIDATE } from "../staking/smart-contract-gql-queries";
import { CandidateProfileViewContentContainer } from "./candidate-view-content";
import { CandidateProfileViewHeaderContainer } from "./candidate-view-header";
// import { DelegateParams } from "./delegate-params";
// import { DelegateRewards } from "./delegate-rewards";
import { DelegateVotesReceived } from "./delegate-votes-received";

export type Props = {
  match: {
    params: {
      id: string;
      type: string;
    };
  };
} & RouteComponentProps;

class Delegate extends Component<Props> {
  props: Props;

  // tslint:disable-next-line:max-func-body-length
  render(): JSX.Element {
    const { history, match } = this.props;
    if (!match || !match.params || !match.params.id) {
      return <></>;
    }
    const PANES = [
      {
        path: `/delegate/${match.params.id}`,
        tab: <span>{t("user-info.profile")}</span>,
      },
      {
        path: `/delegate/${match.params.id}/my-votes`,
        tab: <span>{t("delegate.votesreceived")}</span>,
      },
      {
        path: `/delegate/${match.params.id}/rewards`,
        tab: <span>{t("delegate.rewards")}</span>,
      },
      {
        path: `/delegate/${match.params.id}/params`,
        tab: <span>{t("delegate.params")}</span>,
      },
    ];
    const Content = ({ data }: { data: TBpCandidate }) => {
      switch (match.params.type) {
        case "my-votes":
          return <DelegateVotesReceived />;
        /*  case "rewards":
          return <DelegateRewards registeredName={data.registeredName} />;
        case "params":
          return <DelegateParams data={data} />;*/
        default:
          return <CandidateProfileViewContentContainer data={data} />;
      }
    };
    const request = { candidateProfileId: match.params.id, eth: "" };
    return (
      <ContentPadding>
        <Query
          ssr={false}
          query={GET_BP_CANDIDATE}
          variables={request}
          client={webBpApolloClient}
        >
          {({
            loading,
            error,
            data,
          }: QueryResult<{ bpCandidate: TBpCandidate }>) => {
            if (error && !loading) {
              notification.error({
                message: "Error",
                description: `failed to get BP candidate: ${error.message}`,
                duration: 3,
              });
              return <></>;
            }
            return (
              <SpinPreloader spinning={loading}>
                {data && data.bpCandidate ? (
                  <Layout style={{ background: colors.white }}>
                    <CommonMargin>
                      <Breadcrumb>
                        <Breadcrumb.Item>
                          <a href={"/"}>{t("topbar.voting")}</a>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                          {data && data.bpCandidate && data.bpCandidate.name}
                        </Breadcrumb.Item>
                      </Breadcrumb>
                    </CommonMargin>
                    <CandidateProfileViewHeaderContainer
                      data={data.bpCandidate}
                    />
                    <Menu
                      mode="horizontal"
                      defaultSelectedKeys={[
                        String(
                          PANES.findIndex(
                            (p) => p.path === history.location.pathname
                          )
                        ),
                      ]}
                      style={{ height: "100%" }}
                    >
                      {PANES.map((p, i) => (
                        <Menu.Item key={i} onClick={() => history.push(p.path)}>
                          {p.tab}
                        </Menu.Item>
                      ))}
                    </Menu>
                    <Content data={data.bpCandidate} />
                  </Layout>
                ) : (
                  <div />
                )}
              </SpinPreloader>
            );
          }}
        </Query>
      </ContentPadding>
    );
  }
}
export const DelegateContent = withRouter(Delegate);
