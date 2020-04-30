import Tabs from "antd/lib/tabs";
import { t } from "onefx/lib/iso-i18n";
import React, { Component } from "react";
import { MyVotes } from "./my-votes";
import { Voting } from "./voting";

type RoutingTabItem = {
  text: string;
  component: JSX.Element;
};

const { TabPane } = Tabs;

type Props = {};

type State = {
  activeKey: String;
};

class VotingTab extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      activeKey: "topbar.delegate_list"
    };
  }
  render(): JSX.Element {
    const { activeKey } = this.state;
    const ROUTING_TABS: Array<RoutingTabItem> = [
      {
        text: "topbar.delegate_list",
        // @ts-ignore
        component: <Voting />
      },
      {
        text: "topbar.my_votes",
        // @ts-ignore
        component: <MyVotes />
      }
    ];
    return (
      <Tabs
        // @ts-ignore
        activeKey={activeKey}
        onChange={(key: String) => this.setState({ activeKey: key })}
      >
        {ROUTING_TABS.map(({ text, component }: RoutingTabItem) => (
          <TabPane tab={t(text)} key={text}>
            {component}
          </TabPane>
        ))}
      </Tabs>
    );
  }
}
export { VotingTab };
