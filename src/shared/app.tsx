import { styled } from "onefx/lib/styletron-react";
import React, { Component } from "react";
import { RouteComponentProps, Switch } from "react-router";
import { Route } from "react-router-dom";
import { Footer, FOOTER_ABOVE } from "./common/footer";
// @ts-ignore
import initGoogleAnalytics from "./common/google-analytics";
import { Head } from "./common/head";
import { NotFound } from "./common/not-found";
import { ScrollToTop } from "./common/scroll-top";
import { colors } from "./common/styles/style-color";
import { fonts } from "./common/styles/style-font";
import { TopBar } from "./common/top-bar";
import { TokenMigrationTool } from "./token-migration-tool";

type Props = {
  googleTid: string;
  locale: string;
} & RouteComponentProps;

export class App extends Component<Props> {
  public componentDidMount(): void {
    initGoogleAnalytics({ tid: this.props.googleTid });
  }

  public render(): JSX.Element {
    return (
      <RootStyle>
        <Head />
        <TopBar />
        <div style={FOOTER_ABOVE}>
          <ScrollToTop>
            <Switch>
              <Route exact={true} path="/" component={TokenMigrationTool} />
              <Route component={NotFound} />
            </Switch>
          </ScrollToTop>
        </div>
        <Footer />
      </RootStyle>
    );
  }
}

const RootStyle = styled("div", () => ({
  ...fonts.body,
  backgroundColor: colors.white,
  color: colors.text01,
  textRendering: "optimizeLegibility"
}));
