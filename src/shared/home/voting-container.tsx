import { t } from "onefx/lib/iso-i18n";
import Helmet from "onefx/lib/react-helmet";
import { withRouter } from "onefx/lib/react-router";
import React, { Component } from "react";
import { connect } from "react-redux";
import { ContentPadding } from "../common/styles/style-padding";
import { VotingBannerModal } from "./voting-banner-modal";
import { VotingTab } from "./voting-tab";

type Props = {
  // tslint:disable-next-line:no-any
  history?: any;
  isMobile: Boolean;
};

// @ts-ignore
@withRouter
// @ts-ignore
// tslint:disable-next-line:no-any
@connect((state: any) => ({
  isMobile: state.base.isMobile
}))
class VotingContainer extends Component<Props> {
  render(): JSX.Element {
    return (
      //@ts-ignore
      <ContentPadding>
        {/*
        // @ts-ignore */}
        <Helmet
          meta={[
            { name: "twitter:card", content: "summary_large_image" },
            { name: "twitter:site", content: "@iotex_io" },
            { name: "twitter:title", content: t("voting.tweet.summary.title") },
            {
              name: "twitter:description",
              content: t("voting.tweet.summary.description")
            },
            { name: "twitter:image", content: t("voting.tweet.summary.image") }
          ]}
          title={`${t("meta.title.voting")} - ${t(
            "meta.description.delegates"
          )}`}
        />
        {/*
        // @ts-ignore */}
        <VotingBannerModal />
        <VotingTab />
      </ContentPadding>
    );
  }
}

export { VotingContainer };
