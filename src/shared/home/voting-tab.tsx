import Tabs from "antd/lib/tabs";
import { t } from "onefx/lib/iso-i18n";
import { RouteComponentProps, withRouter } from "onefx/lib/react-router";
import React, { Component } from "react";
import { MyVotes } from "./my-votes";
import { Voting } from "./voting";

type RoutingTabItem = {
  text: string;
  component: JSX.Element;
  path: string;
};

const { TabPane } = Tabs;

type Props = {} & RouteComponentProps;

type State = {
  activeKey: string;
};

const VotingTab = withRouter(
  class VotingTab extends Component<Props, State> {
    constructor(props: Props) {
      super(props);

      let pathname = props.history.location.pathname;
      if (pathname.endsWith("/")) {
        pathname = pathname.substring(0, pathname.length - 1);
      }

      this.state = {
        activeKey: pathname
      };
    }

    render(): JSX.Element {
      const { history } = this.props;
      const { activeKey } = this.state;
      const ROUTING_TABS: Array<RoutingTabItem> = [
        {
          text: "topbar.delegate_list",
          // @ts-ignore
          component: <Voting />,
          path: ""
        },
        {
          text: "topbar.my_votes",
          // @ts-ignore
          component: <MyVotes />,
          path: "/my-votes"
        }
      ];

      return (
        <Tabs
          // @ts-ignore
          activeKey={activeKey}
          onChange={(key: String) => {
            history.push(String(key));
            this.setState({ activeKey: String(key) });
          }}
        >
          {ROUTING_TABS.map(({ text, path, component }: RoutingTabItem) => (
            <TabPane tab={t(text)} key={path}>
              {component}
            </TabPane>
          ))}
        </Tabs>
      );
    }
  }
);

export { VotingTab };
