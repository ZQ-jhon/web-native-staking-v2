// @flow
import { Route, Switch, withRouter, RouteComponentProps } from "react-router";
import { Layout, Menu } from "antd";
import {
  SolutionOutlined,
  InboxOutlined,
  DashboardOutlined,
  InfoCircleOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { connect } from "react-redux";
import React, { PureComponent } from "react";
import { t } from "onefx/lib/iso-i18n";
import { CommonMargin } from "../common/common-margin";
import { Head } from "../common/head";
import { TOP_BAR_HEIGHT, TopBar } from "../common/top-bar";
import { ContentPadding } from "../common/styles/style-padding";
import { RootStyle } from "../common/root-style";
import { CandidateProfileContainer } from "../home/candidate-profile";
// import { NameRegistrationContainer } from "../smart-contract/name-registration";
import { secondFontFamily } from "../common/styles/style-font";
// @ts-ignore
import Footer from "iotex-react-footer";
import { Settings } from "./settings";
import { Welcome } from "./welcome";
import { VotesIReceived } from "./votes-i-received";
import { Technical } from "./technical";
// import { ClaimRewards } from "./claim-rewards";
// import { MoveToEthWallet } from "./moveto-ethwallet";
// import { Distribution } from "./distribution/distribution";
// import { DelegateRewards } from "../delegate/delegate-rewards";
// import { RewardDistributionContainer } from "./reward-distribution-container";

type Props = RouteComponentProps & {
  history: any;
};

type State = {
  toggled: boolean;
};

class ProfileApp extends PureComponent<Props, State> {
  props: Props;
  state: State = { toggled: false };

  render() {
    const { history } = this.props;
    const { Sider, Content } = Layout;
    // const SubMenu = Menu.SubMenu;

    const PANES = [
      {
        path: "/profile/",
        tab: (
          <span>
            <InfoCircleOutlined />
            <span className="nav-text">{t("profile.welcome")}</span>
          </span>
        ),
        component: Welcome,
        hide: false,
      },
      {
        path: "/profile/profile",
        tab: (
          <span>
            <DashboardOutlined />
            <span className="nav-text">{t("profile.profile")}</span>
          </span>
        ),
        component: CandidateProfileContainer,
        hide: false,
      },
      // {
      //   path: "/profile/reward-distribution",
      //   tab: (
      //     <span>
      //       <PercentageOutlined />
      //       <span className="nav-text">{t("profile.reward-distribution")}</span>
      //     </span>
      //   ),
      //   component: RewardDistributionContainer
      // },
      {
        path: "/profile/technical/",
        tab: (
          <span>
            <SolutionOutlined />
            <span className="nav-text">{t("profile.technical")}</span>
          </span>
        ),
        component: Technical,
        hide: false,
      },
      // {
      //   path: "/profile/name-registration/",
      //   tab: (
      //     <span>
      //       <Icon type="link" />
      //       <span className="nav-text">{t("profile.name_registration")}</span>
      //     </span>
      //   ),
      //   component: NameRegistrationContainer
      // },
      {
        path: "/profile/received/",
        tab: (
          <span>
            <InboxOutlined />
            <span className="nav-text">{t("profile.received")}</span>
          </span>
        ),
        component: VotesIReceived,
        hide: false,
      },
      // {
      //   path: "",
      //   tab: (
      //     <SubMenu
      //       key="rewards"
      //       title={
      //         <span>
      //           <TrophyOutlined />
      //           <span>{t("profile.rewards_distribution")}</span>
      //         </span>
      //       }
      //     >
      //       <Menu.Item
      //         key="rewards_1"
      //         onClick={() => history.push("/profile/claim-rewards/")}
      //       >
      //         {t("profile.claim_rewards")}
      //       </Menu.Item>
      //       <Menu.Item
      //         key="rewards_2"
      //         onClick={() => history.push("/profile/moveto-ethwallet/")}
      //       >
      //         {t("profile.move_to_eth_wallet")}
      //       </Menu.Item>
      //       <Menu.Item
      //         key="rewards_3"
      //         onClick={() => history.push("/profile/distribute-rewards/")}
      //       >
      //         {t("profile.calculate_rewards")}
      //       </Menu.Item>
      //       <Menu.Item
      //         key="rewards_4"
      //         onClick={() => history.push("/profile/distribute-iotx/")}
      //       >
      //         {t("profile.distribute_iotx")}
      //       </Menu.Item>
      //     </SubMenu>
      //   ),
      //   component: null
      // },
      // {
      //   path: "/profile/claim-rewards/",
      //   tab: (
      //     <span>
      //       <SettingOutlined />
      //       <span className="nav-text">{t("profile.settings")}</span>
      //     </span>
      //   ),
      //   component: ClaimRewards,
      //   hide: true
      // },
      // {
      //   path: "/profile/moveto-ethwallet/",
      //   tab: (
      //     <span>
      //       <SettingOutlined />
      //       <span className="nav-text">{t("profile.settings")}</span>
      //     </span>
      //   ),
      //   component: MoveToEthWallet,
      //   hide: true
      // },
      // {
      //   path: "/profile/distribute-rewards/",
      //   tab: (
      //     <span>
      //       <SettingOutlined />
      //       <span className="nav-text">{t("profile.settings")}</span>
      //     </span>
      //   ),
      //   component: DelegateRewards,
      //   hide: true
      // },
      // {
      //   path: "/profile/distribute-iotx/",
      //   tab: (
      //     <span>
      //       <SettingOutlined />
      //       <span className="nav-text">{t("profile.settings")}</span>
      //     </span>
      //   ),
      //   component: Distribution,
      //   hide: true
      // },
      {
        path: "/profile/settings/",
        tab: (
          <span>
            <SettingOutlined />
            <span className="nav-text">{t("profile.settings")}</span>
          </span>
        ),
        component: Settings,
        hide: false,
      },
    ];
    return (
      <RootStyle>
        <Head title={`${t("profile.title")} - ${t("meta.description")}`} />

        <TopBar />
        <Layout>
          <CommonMargin />
          <ContentPadding>
            <Layout
              style={{
                padding: "24px 0",
                background: "#fff",
                minHeight: `calc((100vh - ${TOP_BAR_HEIGHT}px) - 86px)`,
              }}
              hasSider={true}
            >
              <Sider
                breakpoint="sm"
                width={240}
                collapsedWidth="80"
                style={{ background: "#fff" }}
              >
                <Menu
                  mode="inline"
                  defaultSelectedKeys={[
                    String(
                      PANES.findIndex(
                        (p) => p.path === history.location.pathname
                      )
                    ),
                  ]}
                  style={{ height: "100%" }}
                >
                  {PANES.map((p, i) => {
                    if (!p.hide) {
                      return PANES[i].path === "" ? (
                        p.tab
                      ) : (
                        <Menu.Item
                          key={i}
                          onClick={() => history.push(PANES[i].path)}
                        >
                          {p.tab}
                        </Menu.Item>
                      );
                    }
                    return null;
                  })}
                </Menu>
              </Sider>
              <Content
                style={{
                  background: "#fff",
                  margin: "0 16px",
                  fontFamily: secondFontFamily,
                }}
              >
                <Switch>
                  {PANES.map((p, i) => {
                    if (p.component) {
                      return (
                        <Route
                          key={i}
                          path={p.path}
                          exact
                          component={p.component}
                        />
                      );
                    }
                    return null;
                  })}
                </Switch>
              </Content>
            </Layout>
          </ContentPadding>
          <CommonMargin />
          <Footer />
        </Layout>
      </RootStyle>
    );
  }
}

// $FlowFixMe
export const ProfileAppContainer = withRouter(
  connect(function mapStateToProps(state: {
    base: { analytics: { googleTid: string } };
  }) {
    return {
      googleTid: state.base.analytics.googleTid,
    };
  })(ProfileApp)
);
