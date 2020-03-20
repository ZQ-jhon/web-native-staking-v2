/* tslint:disable:use-simple-attributes */
import {
  ExportOutlined,
  MoneyCollectOutlined,
  SwitcherOutlined,
  TrophyOutlined,
  UserSwitchOutlined
} from "@ant-design/icons";
import { Layout, Menu } from "antd";
import { t } from "onefx/lib/iso-i18n";
import { styled } from "onefx/lib/styletron-react";
import React, { Component } from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { TOP_BAR_HEIGHT } from "../common/top-bar";
import { TokenMigrationPane } from "./token-migration-panel";

const { Content, Sider } = Layout;

type TabItemProps = {
  text: string;
  // tslint:disable-next-line:no-any
  icon?: any;
  clsName?: string;
};

function TabItem({ text, icon, clsName = "" }: TabItemProps): JSX.Element {
  return (
    <TabSpan>
      {icon}
      <span className={clsName}>{t(text)}</span>
    </TabSpan>
  );
}

type MenuTabItemProps = {
  key: string;
  icon: JSX.Element;
  title: string;
  clsName?: string;
  items: Array<{ subPath: string; text: string }>;
  // tslint:disable-next-line:no-any
  history: any;
};

function MenuTabItem({
  key,
  icon,
  title,
  items,
  clsName = ""
}: MenuTabItemProps): JSX.Element {
  return (
    <Menu.SubMenu
      key={key}
      title={
        <span>
          {icon}
          <span className={clsName}>{t(title)}</span>
        </span>
      }
    >
      {items.map(({ subPath, text }, idx) => (
        <Menu.Item
          key={`${key}_${idx + 1}`}
          onClick={() => (window.location.href = getPath(subPath))}
        >
          {t(text)}
        </Menu.Item>
      ))}
    </Menu.SubMenu>
  );
}

const getPath = (subPath: string): string => `/tools/${subPath}`;

type Props = {} & RouteComponentProps;

class ToolsContainer extends Component<Props> {
  props: Props;

  // tslint:disable-next-line:max-func-body-length
  render(): JSX.Element | null {
    const { history } = this.props;

    const PANES = [
      {
        path: getPath("multi-send"),
        tabs: MenuTabItem({
          key: "multi_send",
          icon: <ExportOutlined />,
          title: "tools.multi_send",
          items: [
            { subPath: "multisend-iotex", text: "tools.multi_send.iotex" },
            { subPath: "multisend-erc20", text: "tools.multi_send.erc20" }
          ],
          history
        }),
        // $FlowFixMe
        component: () => (
          <a href="/tools/multisend-iotex">{t("tools.multi_send")}</a>
        ),
        defaultSelectedKey: "multi_send_1"
      },
      {
        path: getPath("multisend-iotex"),
        tab: TabItem({ text: "tools.multi_send.native" }),
        // $FlowFixMe
        component: () => (
          <a href="/tools/multisend-iotex">{t("tools.multi_send")}</a>
        ),
        hide: true,
        key: "mutlsend_1"
      },
      {
        path: getPath("multisend-erc20"),
        tab: TabItem({ text: "tools.multi_send.erc20" }),
        // $FlowFixMe
        component: () => (
          <a href="/tools/multisend-iotex">{t("tools.multi_send")}</a>
        ),
        hide: true,
        key: "mutlsend_2"
      },
      {
        path: getPath("token-swap"),
        tabs: MenuTabItem({
          key: "token_swap",
          icon: <TrophyOutlined />,
          title: "tools.token_swap",
          items: [
            { subPath: "iotex", text: "tools.swap_to_iotex_native" },
            { subPath: "ERC-20", text: "profile.move_to_eth_wallet" }
          ],
          history
        }),
        // $FlowFixMe
        defaultSelectedKey: "token_swap_1"
      },
      {
        path: getPath("iotex"),
        tab: TabItem({ text: "tools.swap_to_iotex_native" }),
        hide: true,
        key: "token_swap_1"
      },
      {
        path: getPath("ERC-20"),
        tab: TabItem({ text: "profile.move_to_eth_wallet" }),
        hide: true,
        key: "token_swap_2"
      },
      // {
      //   path: getPath("swap-v2"),
      //   tab: TabItem({ text: "tools.swap_v2" }),
      //   // $FlowFixMe
      //   hide: !["development", "test"].includes(env),
      //   key: "swap-v2"
      // },
      {
        path: getPath("address-convert"),
        tab: TabItem({
          text: "tools.address_convert",
          icon: <SwitcherOutlined />
        })
      },
      {
        path: getPath("faucet"),
        tab: TabItem({
          text: "tools.faucet_test_net",
          icon: <MoneyCollectOutlined />
        })
      },
      {
        path: getPath("airdrop"),
        tab: TabItem({
          text: "tools.mainnet_title",
          icon: <MoneyCollectOutlined />
        })
      },
      {
        key: "token-migration",
        path: "/tools/token-migration",
        tab: TabItem({
          text: "tools.token_migration",
          icon: <UserSwitchOutlined />
        }),
        component: () => <TokenMigrationPane />
      }
    ];
    const PANE = PANES[PANES.length - 1];

    if (!PANE) {
      return null;
    }

    const activeKey = "token-migration";

    return (
      <Layout
        style={{
          padding: "24px 0",
          background: "#fff",
          minHeight: `calc((100vh - ${TOP_BAR_HEIGHT}px) - 86px)`,
          width: "100%"
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
            defaultOpenKeys={["multi_send", "token_swap"]}
            defaultSelectedKeys={[activeKey]}
            style={{ height: "100%" }}
          >
            {PANES.map((p, i) => {
              if (!p.hide) {
                return p.tabs ? (
                  p.tabs
                ) : (
                  <Menu.Item
                    key={p.key || i}
                    onClick={() => (window.location.href = p.path)}
                  >
                    <span>{p.tab}</span>
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
            margin: "0 16px"
          }}
        >
          {// @ts-ignore
          PANE.component && PANE.component()}
        </Content>
      </Layout>
    );
  }
}

export const ToolsContent = withRouter(ToolsContainer);

export const TabSpan = styled("div", {
  textAlign: "left"
});
