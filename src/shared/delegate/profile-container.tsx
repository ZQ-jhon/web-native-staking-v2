// @flow
import DashboardOutlined from "@ant-design/icons/DashboardOutlined";
import InfoOutlined from "@ant-design/icons/InfoOutlined";
import LinkOutlined from "@ant-design/icons/LinkOutlined";
import PercentageOutlined from "@ant-design/icons/PercentageOutlined";
import SettingOutlined from "@ant-design/icons/SettingOutlined";
import SolutionOutlined from "@ant-design/icons/SolutionOutlined";
import TrophyOutlined from "@ant-design/icons/TrophyOutlined";

import InboxOutlined from "@ant-design/icons/InboxOutlined";
import Layout from "antd/lib/layout";
import Menu from "antd/lib/menu";
import { t } from "onefx/lib/iso-i18n";
import { RouteComponentProps } from "onefx/lib/react-router";
import { Route, Switch } from "onefx/lib/react-router";
import React, { PureComponent } from "react";
import { CommonMargin } from "../common/common-margin";
import { RootStyle } from "../common/component-style";
import { secondFontFamily } from "../common/styles/style-font";
import { ContentPadding } from "../common/styles/style-padding";
import { TOP_BAR_HEIGHT } from "../common/top-bar";
import { CandidateProfileContainer } from "./panes/candidate-profile";
import { ClaimRewardsContainer } from "./panes/claim-rewards";
import { DelegateRewards } from "./panes/delegate-rewards";
import { NameRegistrationContainer } from "./panes/name-registration";
import { RewardDistributionContainer } from "./panes/reward-distribution-container";
import { Settings } from "./panes/settings";
import { Technical } from "./panes/technical";
import { VotesReceivedTable } from "./panes/votes-received-table";
import { Welcome } from "./panes/welcome";

type Props = {} & RouteComponentProps;

type State = {
  toggled: boolean;
};

export class ProfileContainer extends PureComponent<Props, State> {
  props: Props;
  state: State = { toggled: false };

  // tslint:disable-next-line:max-func-body-length
  render(): JSX.Element {
    const { history } = this.props;
    const { Sider, Content } = Layout;
    const SubMenu = Menu.SubMenu;

    const PANES = [
      {
        path: "/profile/",
        tab: (
          <span>
            <InfoOutlined />
            <span className="nav-text">{t("profile.welcome")}</span>
          </span>
        ),
        component: Welcome,
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
      },
      {
        path: "/profile/reward-distribution",
        tab: (
          <span>
            <PercentageOutlined />
            <span className="nav-text">{t("profile.reward-distribution")}</span>
          </span>
        ),
        component: RewardDistributionContainer,
      },
      {
        path: "/profile/technical/",
        tab: (
          <span>
            <SolutionOutlined />
            <span className="nav-text">{t("profile.technical")}</span>
          </span>
        ),
        component: Technical,
      },
      {
        path: "/profile/name-registration/",
        tab: (
          <span>
            <LinkOutlined />
            <span className="nav-text">{t("profile.name_registration")}</span>
          </span>
        ),
        component: NameRegistrationContainer,
      },
      {
        path: "/profile/received/",
        tab: (
          <span>
            <InboxOutlined />
            <span className="nav-text">{t("profile.received")}</span>
          </span>
        ),
        component: VotesReceivedTable,
      },
      {
        path: "",
        tab: (
          <SubMenu
            key="rewards"
            title={
              <span>
                <TrophyOutlined />
                <span>{t("profile.rewards_distribution")}</span>
              </span>
            }
          >
            <Menu.Item
              key="rewards_1"
              onClick={() => history.push("/profile/claim-rewards/")}
            >
              {t("profile.claim_rewards")}
            </Menu.Item>
            <Menu.Item
              key="rewards_2"
              onClick={() => history.push("/profile/distribute-rewards/")}
            >
              {t("profile.calculate_rewards")}
            </Menu.Item>
          </SubMenu>
        ),
        component: null,
      },
      {
        key: "rewards_1",
        path: "/profile/claim-rewards/",
        tab: (
          <span>
            <SettingOutlined />
            <span className="nav-text">{t("profile.settings")}</span>
          </span>
        ),
        component: ClaimRewardsContainer,
        hide: true,
      },
      {
        key: "rewards_2",
        path: "/profile/distribute-rewards/",
        tab: (
          <span>
            <SettingOutlined />
            <span className="nav-text">{t("profile.settings")}</span>
          </span>
        ),
        component: DelegateRewards,
        hide: true,
      },
      {
        path: "/profile/settings/",
        tab: (
          <span>
            <SettingOutlined />
            <span className="nav-text">{t("profile.settings")}</span>
          </span>
        ),
        component: Settings,
      },
    ];

    const index = PANES.findIndex((p) => p.path === history.location.pathname);
    const open =
      index >= 0 && index < PANES.length && PANES[index].hide ? "rewards" : "";
    const defaultSelectedKey = open ? PANES[index].key : index;

    return (
      <RootStyle>
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
                  defaultSelectedKeys={[String(defaultSelectedKey)]}
                  defaultOpenKeys={[open]}
                  style={{ height: "100%" }}
                >
                  {PANES.map((p, i) => {
                    // @ts-ignore
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
                          exact={true}
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
        </Layout>
      </RootStyle>
    );
  }
}
