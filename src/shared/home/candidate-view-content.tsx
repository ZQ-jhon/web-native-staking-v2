// @flow
import React, { Component } from "react";
import { Avatar, Collapse, Icon, Layout } from "antd";
import MarkdownIt from "markdown-it";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { colors } from "../common/styles/style-color2";
import { getCollapsesParams } from "./voting-render";

const md = new MarkdownIt();
const TEXT_SIZE = 38;
const MIDDLE = 0.75;

const { Content } = Layout;

const Panel = Collapse.Panel;

type Props = {
  eth: string;
  match?: any;
  data: any;
};

const customPanelStyle = {
  fontSize: `${TEXT_SIZE * MIDDLE}px`,
  opacity: 1,
  fontWeight: "bold",
  background: colors.white,
  borderRadius: 4,
  marginBottom: 12,
  border: 0,
  overflow: "hidden"
};

type State = {
  showVotingModal: boolean;
  showMetaMaskReminder: boolean;
  enableDetailedVote: boolean;
};

class CandidateViewProfileContent extends Component<Props, State> {
  props: Props;

  constructor() {
    super();
    this.state = {
      showVotingModal: false,
      showMetaMaskReminder: false,
      enableDetailedVote: false
    };
  }

  showVotingModal() {
    if (this.state.enableDetailedVote) {
      this.setState({ showVotingModal: true });
    } else {
      this.setState({ showMetaMaskReminder: true });
    }
  }
  render() {
    const { data } = this.props;
    const collapses = getCollapsesParams(data);
    return (
      <Content style={{ backgroundColor: colors.white, paddingTop: "20px" }}>
        <Collapse
          bordered={false}
          expandIcon={({ isActive }) => (
            <Avatar
              shape="square"
              size={24}
              style={{ backgroundColor: colors.deltaUp, borderRadius: 0 }}
            >
              <Icon
                type="right"
                rotate={isActive ? 90 : 0}
                style={{ color: colors.white }}
              />
            </Avatar>
          )}
          defaultActiveKey={collapses.map(a => a.key)}
        >
          {collapses.map(item => (
            <Panel
              className={"collapseTitle"}
              style={customPanelStyle}
              header={item.header}
              key={item.key}
            >
              <div
                style={{
                  backgroundColor: colors.black10,
                  fontWeight: "normal",
                  padding: "1em",
                  lineHeight: 1.5,
                  fontSize: "14px"
                }}
              >
                <p dangerouslySetInnerHTML={getHtml(item.content)} />
              </div>
            </Panel>
          ))}
        </Collapse>
        <div id="disqus_thread" />
      </Content>
    );
  }
}

function getHtml(content) {
  return { __html: md.render(content) };
}

// $FlowFixMe
export const CandidateProfileViewContentContainer = withRouter(
  connect(state => ({
    eth: state.base.eth
  }))(CandidateViewProfileContent)
);
