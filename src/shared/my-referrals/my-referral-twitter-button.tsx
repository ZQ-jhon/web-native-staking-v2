// @flow
import {Button} from "antd";
// @ts-ignore
import window from "global/window";
import {t} from "onefx/lib/iso-i18n";
import React, {Component} from "react";
import {connect} from "react-redux";
import {getStaking} from "../common/get-staking";
import {IopayRequired} from "../common/iopay-required";
import {convertToString, getTwitterAccount, TWEET_WEB_INTENT_URL} from "../common/twitter";

type Props = {
  // tslint:disable-next-line:no-any
  onClick?: any,
  // tslint:disable-next-line:no-any
  data?: any,
  siteUrl?: string
};

type States = {
  address?: string
};

// @ts-ignore
@IopayRequired
// @ts-ignore
@connect(state => ({
// @ts-ignore
  siteUrl: state.base.siteUrl
}))
class MyReferralTwitterButton extends Component<Props, States> {
  async componentDidMount(): Promise<void> {
    try{
      const staking = getStaking();
      const address = await staking.getIoPayAddress();
      this.setState({address});
    } catch (e) {
      window.console.log("error when load iotx balance", e);
    }
  }
  render(): JSX.Element {
    const { data = {}, siteUrl = "" } = this.props;
    const { address = "" } = this.state;

    const url = generateReferralLink(
      siteUrl,
      address
    );
    const name = getTwitterAccount(data) || data.name;

    const tweetWebIntentParameters = convertToString({
      text: t("voting.tweet.content", { name }),
      via: "iotex_io",
      url,
      related: "$iotx_io"
    }).replace(/%250a%20/g, "%0a");

    return (
      <a
        href={`${TWEET_WEB_INTENT_URL}?${tweetWebIntentParameters}`}
        data-size="large"
      >
        <Button
          style={{
            fontWeight: "bold",
            fontSize: "14px"
          }}
          type={"primary"}
          size="large"
          onClick={this.props.onClick}
        >
          {t("my_stake.share_twitter")}
        </Button>
      </a>
    );
  }
}

export function generateReferralLink(siteUrl: string, address?: string): string {
  return `${siteUrl}/?src=${address ? address.substr(8, 8) : ""}`;
}

export { MyReferralTwitterButton };
