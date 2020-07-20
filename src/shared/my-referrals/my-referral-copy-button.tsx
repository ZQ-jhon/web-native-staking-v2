// @flow
// @ts-ignore
import window from "global/window";
import { t } from "onefx/lib/iso-i18n";
import React, { Component } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { ValueSpan } from "../common/component-style";
import { Flex } from "../common/flex";
import { colors } from "../common/styles/style-color2";

type Props = {
  // tslint:disable-next-line:no-any
  coppingValue?: any;
};

type State = {
  copied: boolean;
};

export class MyReferralCopyButton extends Component<Props, State> {
  state: State = {
    copied: false,
  };

  render(): JSX.Element {
    const { coppingValue = "" } = this.props;
    const button = this.state.copied ? (
      <span style={{ color: colors.PRODUCING, marginLeft: "16px" }}>
        {t("my_referrals.copied")}
      </span>
    ) : (
      <CopyToClipboard
        text={coppingValue}
        onCopy={() => {
          this.setState({ copied: true });
          window.setTimeout(() => this.setState({ copied: false }), 2000);
        }}
      >
        {/* tslint:disable-next-line:react-a11y-anchors */}
        <a style={{ color: colors.PRODUCING }}>{t("my_referrals.copy")}</a>
      </CopyToClipboard>
    );

    return (
      <Flex>
        <ValueSpan style={{ marginRight: "8px" }}>
          {t("my_referrals.referral_link")}:&nbsp;
          <span style={{ backgroundColor: "#eee" }}>{coppingValue}</span>
        </ValueSpan>
        {button}
      </Flex>
    );
  }
}
