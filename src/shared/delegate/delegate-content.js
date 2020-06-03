// @flow
import { t } from "onefx/lib/iso-i18n";
import { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { Query } from "react-apollo";
// $FlowFixMe
import { notification, Layout, Menu, Breadcrumb } from "antd";
import { DelegateVotesReceived } from "./delegate-votes-received";
import { GET_BP_CANDIDATE } from "../home/voting-gql-queries";
import { CandidateProfileViewContentContainer } from "../home/candidate-view-content";
import { CandidateProfileViewHeaderContainer } from "../home/candidate-view-header";
import { DelegateRewards } from "./delegate-rewards";
import { DelegateParams } from "./delegate-params";
import { CommonMargin } from "../common/common-margin";
import { colors } from "../common/styles/style-color2";

type Props = {
  eth: string,
  history: any,
  match: any
};

class Delegate extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
  }
  render() {
    const { history, match, eth } = this.props;
    if (!match || !match.params || !match.params.id) {
      return null;
    }
    const PANES = [
      {
        path: `/delegate/${match.params.id}`,
        tab: <span>{t("user-info.profile")}</span>
      },
      {
        path: `/delegate/${match.params.id}/my-votes`,
        tab: <span>{t("delegate.votesreceived")}</span>
      },
      {
        path: `/delegate/${match.params.id}/rewards`,
        tab: <span>{t("delegate.rewards")}</span>
      },
      {
        path: `/delegate/${match.params.id}/params`,
        tab: <span>{t("delegate.params")}</span>
      }
    ];
    const Content = ({ data }: any) => {
      switch (match.params.type) {
        case "my-votes":
          return <DelegateVotesReceived />;
        case "rewards":
          return <DelegateRewards registeredName={data.registeredName} />;
        case "params":
          return <DelegateParams data={data} />;
        default:
          return <CandidateProfileViewContentContainer data={data} />;
      }
    };
    const request = { candidateProfileId: match.params.id, eth };
    return (
      <Query ssr={false} query={GET_BP_CANDIDATE} variables={request}>
        {({ loading, error, data }) => {
          if (error && !loading) {
            notification.error({
              message: "Error",
              description: `failed to get BP candidate: ${error.message}`,
              duration: 3
            });
            return null;
          }
          if (data && data.bpCandidate) {
            return (
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
                  scare={1}
                />
                <Menu
                  mode="horizontal"
                  defaultSelectedKeys={[
                    String(
                      PANES.findIndex(p => p.path === history.location.pathname)
                    )
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
            );
          }
          return null;
        }}
      </Query>
    );
  }
}

// $FlowFixMe
export const DelegateContent = withRouter(
  connect(state => ({
    eth: state.base.eth
  }))(Delegate)
);
