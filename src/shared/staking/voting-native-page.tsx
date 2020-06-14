import Breadcrumb from "antd/lib/breadcrumb";
import { t } from "onefx/lib/iso-i18n";
import Helmet from "onefx/lib/react-helmet";
import { withRouter } from "onefx/lib/react-router";
import { Link } from "onefx/lib/react-router-dom";
import React, { Component } from "react";
import { CommonMargin } from "../common/common-margin";
import { ContentPadding } from "../common/styles/style-padding";
import { VoteNowContainer } from "./vote-now-steps/vote-now-container";

type Props = {
  match: {
    params: {
      registeredName: string;
    };
  };
};
// @ts-ignore
@withRouter
class VoteNativePage extends Component<Props> {
  render(): JSX.Element {
    const { match } = this.props;
    let { registeredName } = match.params;
    if (registeredName) {
      registeredName = decodeURIComponent(registeredName);
    }
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
        <CommonMargin />
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/">{t("topbar.voting")}</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to={`/vote-native/${encodeURIComponent(registeredName)}`}>
              {registeredName}
            </Link>
          </Breadcrumb.Item>
        </Breadcrumb>
        <CommonMargin />
        {
          // @ts-ignore
          <VoteNowContainer
            registeredName={registeredName}
            displayOthers={false}
            forceDisplayModal={true}
            disableModal={true}
          />
        }
      </ContentPadding>
    );
  }
}

export { VoteNativePage };
