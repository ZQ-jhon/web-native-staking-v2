import CaretDownOutlined from "@ant-design/icons/CaretDownOutlined";
import Avatar from "antd/lib/avatar";
import Collapse from "antd/lib/collapse";
import Layout from "antd/lib/layout";
import { t } from "onefx/lib/iso-i18n";
import { RouteComponentProps } from "onefx/lib/react-router";
import React, { Component, CSSProperties } from "react";
import { withRouter } from "react-router";
import { TBpCandidate } from "../../types";
import { colors } from "../common/styles/style-color2";

const TEXT_SIZE = 38;
const MIDDLE = 0.75;

const { Content } = Layout;

const Panel = Collapse.Panel;

type Props = {
  data: TBpCandidate;
  match: {
    params: {
      id: string;
      type: string;
    };
  };
} & RouteComponentProps;

const customPanelStyle: CSSProperties = {
  fontSize: `${TEXT_SIZE * MIDDLE}px`,
  opacity: 1,
  fontWeight: "bold",
  background: colors.white,
  borderRadius: 4,
  marginBottom: 12,
  border: 0,
  overflow: "hidden",
};

type State = {
  showVotingModal: boolean;
};

class CandidateViewProfileContent extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showVotingModal: false,
    };
  }

  render(): JSX.Element {
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
              style={{
                backgroundColor: colors.white,
                borderRadius: 3,
                borderColor: colors.black80,
                borderWidth: 1,
                borderStyle: "solid",
              }}
            >
              {/* tslint:disable-next-line:use-simple-attributes */}
              <CaretDownOutlined
                rotate={isActive ? 0 : -90}
                style={{ color: colors.black80 }}
              />
            </Avatar>
          )}
          expandIconPosition="right"
          defaultActiveKey={collapses.map((a) => a.key)}
        >
          {collapses.map((item) => (
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
                  fontSize: "14px",
                }}
              >
                <p dangerouslySetInnerHTML={{ __html: item.content }} />
              </div>
            </Panel>
          ))}
        </Collapse>
        <div id="disqus_thread" />
      </Content>
    );
  }
}

// tslint:disable-next-line:no-any
const getCollapsesParams = (data: any) => {
  return [
    {
      key: "1",
      inputId: "introduction",
      type: "P",
      content: data.introduction,
      header: t("candidates.introduction"),
    },
    {
      key: "2",
      inputId: "team",
      type: "P",
      content: data.team,
      header: t("candidates.team"),
    },
    {
      key: "3",
      inputId: "techSetup",
      type: "P",
      content: data.techSetup,
      header: t("candidates.tech_setup"),
    },
    {
      key: "4",
      inputId: "communityPlan",
      type: "P",
      content: data.communityPlan,
      header: t("candidates.community_plan"),
    },
    {
      key: "5",
      inputId: "rewardPlan",
      type: "P",
      content: data.rewardPlan,
      header: t("candidates.reward_plan"),
    },
  ];
};

export const CandidateProfileViewContentContainer = withRouter(
  CandidateViewProfileContent
);
