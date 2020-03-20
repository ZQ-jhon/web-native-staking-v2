import { t } from "onefx/lib/iso-i18n";
import React, { Component } from "react";
import Helmet from "react-helmet";
import { CommonMargin } from "./common/common-margin";
import { RoutingTab } from "./common/routing-tab";
import { ContentPadding } from "./common/styles/style-padding";
import { ToolsContent } from "./tools/tools-container";

export class TokenMigrationTool extends Component {
  public render(): JSX.Element {
    return (
      <ContentPadding>
        <Helmet title={`${t("tools.title")} - ${t("meta.description")}`} />
        <CommonMargin />
        <RoutingTab activeRoute="/tools/" />
        <ToolsContent />
      </ContentPadding>
    );
  }
}
