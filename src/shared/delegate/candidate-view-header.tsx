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
import { Query, QueryResult } from "react-apollo";
import { withRouter } from "react-router";
import { TBpCandidate } from "../../types";
import { analyticsApolloClient } from "../common/apollo-client";
import { BannerImg, Title } from "../common/component-style";
import { Flex } from "../common/flex";
import { colors } from "../common/styles/style-color2";
import { fullOnPalm, media } from "../common/styles/style-media";
import { TwitterScriptSource } from "../common/twitter";
import { convertHttps } from "../common/url-utils";
import { VotingButton } from "../home/vote-button-modal";
import {
  GET_EPOCH,
  GET_REWARDS_RATIO_BY_DELEGATE,
} from "../staking/smart-contract-gql-queries";
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

interface RewardsQueryVariables {
  startEpoch: number;
  epochCount: number;
  voterAddress?: string;
  delegateName?: string;
}

interface RewardsRatioQueryResult {
  hermes2: {
    byDelegate: {
      distributionRatio: [
        {
          epochNumber: number;
          blockRewardRatio: number;
          foundationBonusRatio: number;
          epochRewardRatio: number;
        }
      ];
    };
  };
}

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
        <BannerImg
          className="banner-frame"
          src={convertHttps(data.bannerUrl)}
        />
        <Flex alignItems={"normal"} marginTop="24px" marginBottom="12px">
          <Flex marginBottom="24px">
            <Avatar
              className="profile-frame"
              shape="square"
              size={HEADER_HEIGHT * imageScale}
              src={convertHttps(data.logo)}
              style={{ alignSelf: "baseline" }}
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
              <Query
                query={GET_EPOCH}
                ssr={false}
                client={analyticsApolloClient}
              >
                {({
                  data: epochData,
                  error,
                  loading,
                }: QueryResult<{ chain: { mostRecentEpoch: number } }>) => {
                  if (loading || error || !epochData) {
                    return null;
                  }
                  const variables: RewardsQueryVariables = {
                    startEpoch: epochData.chain.mostRecentEpoch,
                    epochCount: 1,
                    delegateName: String(data.name).toLowerCase(),
                  };
                  return (
                    <Query
                      ssr={false}
                      query={GET_REWARDS_RATIO_BY_DELEGATE}
                      client={analyticsApolloClient}
                      variables={variables}
                    >
                      {({
                        data: ratioData,
                        error,
                        loading,
                      }: QueryResult<RewardsRatioQueryResult>) => {
                        if (loading || error || !ratioData) {
                          return null;
                        }
                        return (
                          <div style={{ lineHeight: 1.5 }}>
                            {
                              // @ts-ignore
                              <Text scale={0.6} style={{ color: "black" }}>
                                {t("candidate.herems.distribution_ratios")}
                                :&nbsp;
                                {
                                  ratioData.hermes2.byDelegate
                                    .distributionRatio[0].blockRewardRatio
                                }
                                %&nbsp;{t("candidate.herems.block_reward")}
                                ,&nbsp;
                                {
                                  ratioData.hermes2.byDelegate
                                    .distributionRatio[0].epochRewardRatio
                                }
                                %&nbsp;
                                {t("candidate.herems.epoch_reward")}
                                ,&nbsp;
                                {
                                  ratioData.hermes2.byDelegate
                                    .distributionRatio[0].foundationBonusRatio
                                }
                                % &nbsp;
                                {t("candidate.herems.foundation_bonus_reward")}
                                .&nbsp;
                              </Text>
                            }
                            <a href="https://hermes.to/">
                              {t("candidate.herems.more_details")}.
                            </a>
                          </div>
                        );
                      }}
                    </Query>
                  );
                }}
              </Query>
            </Flex>
          </Flex>
          {actionButtons}
        </Flex>

        {annotateText}
        <VotingButton
          launch={() => this.showVotingModal()}
          extra={{
            style: {
              width: "100%",
              height: "50px",
              fontSize: 20,
              marginTop: 12,
            },
          }}
        >
          <b>{t("candidate.vote")}</b>
        </VotingButton>
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
