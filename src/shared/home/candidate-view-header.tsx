/* eslint-disable max-lines */
// @flow
import React, { Component } from "react";
// @ts-ignore
import window from "global/window";
import { t } from "onefx/lib/iso-i18n";
import { Avatar, Button, Layout } from "antd";
import { Icon } from "@ant-design/compatible";
import { styled } from "onefx/lib/styletron-react";
import Helmet from "onefx/lib/react-helmet";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { Flex } from "../common/flex";
import { colors } from "../common/styles/style-color2";
import { VotingCandidateView } from "../smart-contract/voting-candidate-view";
import { CommonModal } from "../common/common-modal";
import { fullOnPalm, media } from "../common/styles/style-media";
import { BannerImg, shareStyle, Title } from "../common/component-style";
import { TWEET_WEB_INTENT_URL, TwitterScriptSource } from "../common/twitter";
import {
  convertToString,
  getIconType,
  getTwitterAccount
} from "./voting-render";
import { VotingButton } from "../home/vote-button-modal";

const MAX_WIDTH = 560;
const HEADER_HEIGHT = 160;
const TEXT_SIZE = 38;
const LINE_HEIGHT = 2;
const MIDDLE = 0.75;
const LOWEST = 0.55;

const { Header } = Layout;

type Props = {
  scale?: number;
  eth: string;
  match?: any;
  data: any;
  isIoPay?: boolean;
};

type State = {
  showVotingModal: boolean;
  showMetaMaskReminder: boolean;
  enableDetailedVote: boolean;
  isNative: boolean;
};
// @ts-ignore
@connect(state => ({ isIoPay: state.base.isIoPay }))
class CandidateProfileViewHeader extends Component<Props, State> {
  props: Props;

  constructor(props: Props) {
    super(props);
    this.state = {
      showVotingModal: false,
      showMetaMaskReminder: false,
      enableDetailedVote: false,
      isNative: false
    };
  }

  componentDidMount() {
    (function() {
      // DON'T EDIT BELOW THIS LINE
      const d = window.document;
      const s = d.createElement("script");
      const h = d.head || d.body;
      s.src = "https://iotexmember.disqus.com/embed.js";
      // $FlowFixMe
      s.setAttribute("data-timestamp", Number(new Date()));
      // $FlowFixMe
      if (h) {
        h.appendChild(s);
      }
    })();
  }

  showVotingModal(isNative: boolean) {
    const { isIoPay } = this.props;

    if (this.state.enableDetailedVote || isIoPay) {
      this.setState({ showVotingModal: true, isNative });
    } else {
      this.setState({ showMetaMaskReminder: true });
    }
  }

  renderActionButtons(data: any) {
    return (
      <Flex column={true} width="138px" media={fullOnPalm}>
        <Button
          type={"primary"}
          size="large"
          style={{ width: "100%", height: "81px", marginBottom: "30px" }}
        >
          {t("delegate.ranking")}
          <br />
          {`#${data.rank || "---"}`}
        </Button>
        <VotingButton
          // @ts-ignore
          launch={(isNative: boolean) => this.showVotingModal(isNative)}
          extra={{ style: { width: "100%", height: "50px" } }}
        >
          {t("candidate.vote")}
        </VotingButton>
      </Flex>
    );
  }

  renderDialogues(data: any) {
    return (
      <div>
        <VotingCandidateView
          registeredName={(data && data.registeredName) || ""}
          showModal={this.state.showVotingModal}
          requestDismiss={() => this.setState({ showVotingModal: false })}
          currentCandidate={data}
          isNative={this.state.isNative}
        />
        <CommonModal
          title={<b>{t("voting.metamask-reminder.title")}</b>}
          okText={t("button.understand")}
          cancelText={t("button.cancel")}
          visible={this.state.showMetaMaskReminder}
          onOk={() =>
            this.setState({
              showMetaMaskReminder: false,
              enableDetailedVote: true,
              showVotingModal: true
            })
          }
          onCancel={() => this.setState({ showMetaMaskReminder: false })}
        >
          <p
            dangerouslySetInnerHTML={{
              __html: t("voting.metamask-reminder.content")
            }}
          />
        </CommonModal>
      </div>
    );
  }

  render() {
    const { data } = this.props;
    let { scale = 1 } = this.props;
    const imageScale = scale;
    scale = scale === 1 ? scale : scale * 0.9;
    const lineHeight = LINE_HEIGHT * scale;

    const actionButtons = this.renderActionButtons(data);
    const dialogues = this.renderDialogues(data);

    const url = window.location && window.location.href;

    const name = getTwitterAccount(data) || data.name;
    const text = `Big congrats to @iotex_io Mainnet Alpha launch! Now Delegates have started to build the @iotex_io network. Let’s make it stronger together! I will vote for @${name} as a Delegate - how about YOU? #IoTeXdelegate #IoTeXvotess $IOTX-E`;
    const tweetWebIntentParameters = convertToString({
      text,
      via: "iotex_io",
      url,
      related: "$iotx_io"
    });

    const isNonOfficialIotex =
      data.name && data.name.toLowerCase().includes("iotex");
    const annotateText = isNonOfficialIotex ? (
      <Flex
        media={{
          [media.media700]: {
            marginTop: "16px"
          }
        }}
      >
        <span style={{ color: colors.grayText }}>
          {t("delegate.annotate.non-official")}
        </span>
      </Flex>
    ) : (
      ""
    );
    const headerStyles = isNonOfficialIotex ? { lineHeight: "21px" } : {};

    return (
      <Header
        className="profile"
        style={{
          backgroundColor: colors.white,
          height: "auto",
          padding: "1em",
          ...headerStyles
        }}
      >
        <Helmet title={`${data.name} - ${t("meta.description.delegates")}`} />
        <BannerImg className="banner-frame" src={data.bannerUrl} />
        <Flex alignItems={"normal"} marginTop="24px">
          <Flex marginBottom="24px">
            <Avatar
              className="profile-frame"
              shape="square"
              size={HEADER_HEIGHT * imageScale}
              src={data.logo}
            />
            <Flex
              column={true}
              alignItems={"baseline"}
              marginLeft={"20px"}
              marginRight={"auto"}
              alignContent={"left"}
              flex={1}
              maxWidth={`${imageScale * MAX_WIDTH}px`}
            >
              <Flex alignItems={"flex-start"}>
                <span
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    lineHeight: 1
                  }}
                >
                  {data.name}
                </span>
                {isNonOfficialIotex && (
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "bold",
                      lineHeight: 1,
                      color: colors.grayText,
                      marginLeft: "3px"
                    }}
                  >
                    {" *"}
                  </span>
                )}
              </Flex>
              <Flex
                lineHeight={lineHeight * LOWEST}
                maxWidth={`${(scale * MAX_WIDTH) / 2}px`}
                marginTop={"18px"}
                marginBottom={"13px"}
                justifyContent="end"
              >
                <SocialIcon url={data.website} type="global" scale={scale} />
                {data.socialMedia.map((e, i) => (
                  <SocialIcon
                    key={i}
                    url={e}
                    type={getIconType(e)}
                    scale={scale}
                  />
                ))}
              </Flex>
              <Title
                style={{
                  fontSize: "20px",
                  lineHeight: MIDDLE * lineHeight,
                  color: colors.UNQUALIFIED
                }}
              >
                {" "}
                {data.location}{" "}
              </Title>
              // @ts-ignore
              <Text fontSize={"20"} scale={scale}>
                {" "}
                {data.blurb}{" "}
              </Text>
            </Flex>
          </Flex>
          {actionButtons}
        </Flex>
        {annotateText}
        <a
          href={`${TWEET_WEB_INTENT_URL}?${tweetWebIntentParameters}`}
          data-size="large"
        >
          // @ts-ignore
          <Button type={"primary"} size="large" style={shareStyle}>
            {t("delegate.vote_share")}
          </Button>
        </a>
        <TwitterScriptSource />
        {dialogues}
      </Header>
    );
  }
}

type SocialIconType = {
  url?: string;
  type?: string;
  scale?: number;
};

function SocialIcon({ url, type, scale = 1 }: SocialIconType) {
  function handleClick(e: any) {
    if (!e) {
      return;
    }
    window.open(e);
  }

  return (
    <a
      onClick={() => {
        handleClick(url);
      }}
    >
      {type && (
        <Icon
          type={type}
          style={{
            color: colors.nav03,
            opacity: 0.6,
            marginRight: "0.5em",
            marginBottom: "0.1em",
            fontSize: TEXT_SIZE * scale * MIDDLE
          }}
        />
      )}
    </a>
  );
}
//@ts-ignore
export const Text = styled("span", ({ scale, ...otherProps }) => ({
  lineHeight: LINE_HEIGHT * scale * MIDDLE,
  fontSize: `${scale * TEXT_SIZE * LOWEST}px`,
  color: colors.grayText,
  ...otherProps
}));

// $FlowFixMe
export const CandidateProfileViewHeaderContainer = withRouter(
  // @ts-ignore
  connect((state: { base: { eth: string } }) => ({
    eth: state.base.eth
  }))(CandidateProfileViewHeader)
);
