import FacebookOutlined from "@ant-design/icons/FacebookOutlined";
import GlobalOutlined from "@ant-design/icons/GlobalOutlined";
import LinkedinOutlined from "@ant-design/icons/LinkedinOutlined";
import MediumOutlined from "@ant-design/icons/MediumOutlined";
import RedditOutlined from "@ant-design/icons/RedditOutlined";
import TeamOutlined from "@ant-design/icons/TeamOutlined";
import TwitterOutlined from "@ant-design/icons/TwitterOutlined";
import WeiboOutlined from "@ant-design/icons/WeiboOutlined";
import Avatar from "antd/lib/avatar";
import Button from "antd/lib/button";
import Layout from "antd/lib/layout";
// @ts-ignore
import window from "global/window";
import { t } from "onefx/lib/iso-i18n";
import Helmet from "onefx/lib/react-helmet";
import { RouteComponentProps } from "onefx/lib/react-router";
import { styled } from "onefx/lib/styletron-react";
import React, { Component } from "react";
import { withRouter } from "react-router";
import { TBpCandidate } from "../../types";
import { BannerImg, shareStyle, Title } from "../common/component-style";
import { Flex } from "../common/flex";
import { colors } from "../common/styles/style-color2";
import { fullOnPalm, media } from "../common/styles/style-media";
import {
  convertToString,
  getTwitterAccount,
  TWEET_WEB_INTENT_URL,
  TwitterScriptSource,
} from "../common/twitter";
import { VotingButton } from "../home/vote-button-modal";
import { VoteNowContainer } from "../staking/vote-now-steps/vote-now-container";

const MAX_WIDTH = 560;
const HEADER_HEIGHT = 160;
const TEXT_SIZE = 38;
const LINE_HEIGHT = 2;
const MIDDLE = 0.75;
const LOWEST = 0.55;

const { Header } = Layout;

type Props = {
  scale?: number;
  data: TBpCandidate;
} & RouteComponentProps;

type State = {
  showVotingModal: boolean;
};

class CandidateProfileViewHeader extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showVotingModal: false,
    };
  }

  componentDidMount(): void {
    // tslint:disable-next-line:no-function-expression typedef
    (function () {
      // DON'T EDIT BELOW THIS LINE
      const d = window.document;
      const s = d.createElement("script");
      const h = d.head || d.body;
      s.src = "https://iotexmember.disqus.com/embed.js";
      s.setAttribute("data-timestamp", Number(new Date()));
      if (h) {
        h.appendChild(s);
      }
    })();
  }

  showVotingModal(): void {
    this.setState({ showVotingModal: true });
  }

  // tslint:disable-next-line:no-any
  renderActionButtons(data: any): JSX.Element {
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
          launch={() => this.showVotingModal()}
          extra={{ style: { width: "100%", height: "50px" } }}
        >
          {t("candidate.vote")}
        </VotingButton>
        <VoteNowContainer
          displayOthers={false}
          forceDisplayModal={this.state.showVotingModal}
          requestDismiss={() => this.setState({ showVotingModal: false })}
          registeredName={data.registeredName}
        />
      </Flex>
    );
  }

  // tslint:disable-next-line:max-func-body-length
  render(): JSX.Element {
    const { data } = this.props;
    let { scale = 1 } = this.props;
    const imageScale = scale;
    scale = scale === 1 ? scale : scale * 0.9;
    const lineHeight = LINE_HEIGHT * scale;

    const actionButtons = this.renderActionButtons(data);

    const url = window.location && window.location.href;

    const name = getTwitterAccount(data) || data.name;
    const text = `Big congrats to @iotex_io Mainnet Alpha launch! Now Delegates have started to build the @iotex_io network. Let’s make it stronger together! I will vote for @${name} as a Delegate - how about YOU? #IoTeXdelegate #IoTeXvotess $IOTX-E`;
    const tweetWebIntentParameters = convertToString({
      text,
      via: "iotex_io",
      url,
      related: "$iotx_io",
    });

    const isNonOfficialIotex =
      data.name && data.name.toLowerCase().includes("iotex");
    const annotateText = isNonOfficialIotex ? (
      <Flex
        media={{
          [media.media700]: {
            marginTop: "16px",
          },
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
          ...headerStyles,
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
                    lineHeight: 1,
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
                      marginLeft: "3px",
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
                <SocialIcon url={data.website} scale={scale} />
                {data.socialMedia.map((e: string, i: number) => (
                  <SocialIcon key={i} url={e} scale={scale} />
                ))}
              </Flex>

              <Title
                style={{
                  fontSize: "20px",
                  lineHeight: MIDDLE * lineHeight,
                  color: colors.UNQUALIFIED,
                }}
              >
                {" "}
                {data.location}{" "}
              </Title>
              {
                // @ts-ignore
                <Text fontSize={"20"} scale={scale}>
                  {" "}
                  {data.blurb}{" "}
                </Text>
              }
            </Flex>
          </Flex>
          {actionButtons}
        </Flex>
        {annotateText}
        <a
          href={`${TWEET_WEB_INTENT_URL}?${tweetWebIntentParameters}`}
          data-size="large"
        >
          <Button type={"primary"} size="large" style={shareStyle}>
            {t("delegate.vote_share")}
          </Button>
        </a>
        <TwitterScriptSource />
      </Header>
    );
  }
}

type SocialIconType = {
  url?: string;
  type?: string;
  scale?: number;
};

const SocialIcon = ({ url, scale = 1 }: SocialIconType) => {
  // tslint:disable-next-line:no-any
  function handleClick(e: any): void {
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
      href={""}
    >
      {url && <IconType url={url} scale={scale} />}
    </a>
  );
};

export const Text = styled("span", ({ scale, ...otherProps }) => ({
  lineHeight: LINE_HEIGHT * scale * MIDDLE,
  fontSize: `${scale * TEXT_SIZE * LOWEST}px`,
  color: colors.grayText,
  ...otherProps,
}));

const IconType = ({ url, scale }: { url: string; scale: number }) => {
  const style = {
    color: colors.nav03,
    opacity: 0.6,
    marginRight: "0.5em",
    marginBottom: "0.1em",
    fontSize: TEXT_SIZE * scale * MIDDLE,
  };

  if (url.includes("twitter.com")) {
    return <TwitterOutlined style={style} />;
  } else if (url.includes("medium.com")) {
    return <MediumOutlined style={style} />;
  } else if (url.includes("linkedin.com")) {
    return <LinkedinOutlined style={style} />;
  } else if (url.includes("t.me")) {
    return <TeamOutlined style={style} />;
  } else if (url.includes("reddit.com")) {
    return <RedditOutlined style={style} />;
  } else if (url.includes("weibo.com")) {
    return <WeiboOutlined style={style} />;
  } else if (url.includes("facebook.com")) {
    return <FacebookOutlined style={style} />;
  }
  return <GlobalOutlined style={style} />;
};

export const CandidateProfileViewHeaderContainer = withRouter(
  CandidateProfileViewHeader
);
