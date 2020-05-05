// @flow
// @ts-ignore
import window from "global/window";
import { t } from "onefx/lib/iso-i18n";
import React, { Component } from "react";
import { ValueSpan } from "../common/component-style";
import { Flex } from "../common/flex";
import { colors } from "../common/styles/style-color2";
import { MyReferralCopyButton } from "./my-referral-copy-button";

type Props = {
  siteUrl: string
};

export class MyReferralLink extends Component<Props> {
  props: Props;

  constructor(props: Props) {
    super(props);
  }

  render(): JSX.Element {
    const link = generateReferralLink(
      this.props.siteUrl,
      window.web3.eth.accounts[0]
    );

    return (
      <Flex
        width={"100%"}
        column={true}
        alignItems={"baseline"}
        padding={"18px 0"}
      >
        <Flex width={"100%"} justifyContent={"left"} paddingBottom={"18px"}>
          <ValueSpan style={{ marginRight: "8px" }}>
            {t("my_referrals.bonus")}
          </ValueSpan>
          <a
            target="blank"
            href="https://medium.com/@iotex/iotex-community-referral-program-official-launch-4578ae91f96"
            style={{ color: colors.PRODUCING }}
          >
            {t("my_referrals.detail")}
          </a>
        </Flex>
        <MyReferralCopyButton coppingValue={link} />
      </Flex>
    );
  }
}

export function generateReferralLink(siteUrl: string, address?: string): string {
  return `${siteUrl}/?src=${address ? address.substr(8, 8) : ""}`;
}
