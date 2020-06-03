import React from "react";
import { t } from "onefx/lib/iso-i18n";
import { connect } from "react-redux";
import { PureComponent } from "react";
import { Flex } from "../common/flex";
import { CommonMargin } from "../common/common-margin";
import { Button } from "../common/button";

class SettingsInner extends PureComponent<{ eth: string }> {
  render() {
    const { eth } = this.props;
    return (
      <Flex width="100%" column={true} alignItems="flex-start">
        <h1>{t("profile.settings")}</h1>
        <pre>{eth}</pre>
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

export const Settings = connect(function mapStateToProps(state: {
  base: { eth: string };
}) {
  return {
    eth: state.base.eth,
  };
})(SettingsInner);
