import { fromBytes } from "iotex-antenna/lib/crypto/address";
import { t } from "onefx/lib/iso-i18n";
import React, { ReactNode } from "react";
import { PureComponent } from "react";
import { connect } from "react-redux";
import { Button } from "../../common/button";
import { CommonMargin } from "../../common/common-margin";
import { Flex } from "../../common/flex";

const Settings = connect((state: { base: { eth: string } }) => ({
  eth: state.base.eth
}))(
  class SettingsInner extends PureComponent<{ eth: string }> {
    render(): ReactNode {
      const { eth } = this.props;
      const addr = eth
        ? fromBytes(Buffer.from(String(eth).replace(/^0x/, ""), "hex")).string()
        : "";

      return (
        <Flex width="100%" column={true} alignItems="flex-start">
          <h1>{t("profile.settings")}</h1>
          {
            <p
              dangerouslySetInnerHTML={{
                __html: t("profile.settings.content", {
                  ioAddress: addr,
                  ethAddress: eth
                })
              }}
            />
          }
          <CommonMargin />
          <div>
            <Button secondary={true} href="/logout">
              {t("auth/sign_out")}
            </Button>
          </div>
        </Flex>
      );
    }
  }
);

export { Settings };
