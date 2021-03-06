import { Switch } from "onefx/lib/react-router";
import { Route } from "onefx/lib/react-router-dom";
import { styled } from "onefx/lib/styletron-react";
import React, { Component } from "react";
import { Footer, FOOTER_ABOVE } from "./common/footer";
// @ts-ignore
import initGoogleAnalytics from "./common/google-analytics";
import { Head } from "./common/head";
import { NotFound } from "./common/not-found";
import { ScrollToTop } from "./common/scroll-top";
import { colors } from "./common/styles/style-color";
import { fonts } from "./common/styles/style-font";
import { TopBar } from "./common/top-bar";
import { DelegateContent } from "./delegate/delegate-content";
import { ProfileContainer } from "./delegate/profile-container";
import { ReclaimTools } from "./home/reclaim-bucket";
import { VotingContainer } from "./home/voting-container";
import { SignIn } from "./onefx-auth-provider/identity-provider/view/sign-in";
import { VoteNativePage } from "./staking/voting-native-page";

type Props = {
  googleTid: string;
  locale: string;
};

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
              <Route exact={true} path="/" component={VotingContainer} />
              <Route exact={true} path="/login" component={SignIn} />
              <Route
                exact={true}
                path="/my-votes"
                component={VotingContainer}
              />
              <Route
                exact={true}
                path="/reclaim-bucket"
                component={ReclaimTools}
              />
              <Route
                exact={true}
                path="/vote-native/:registeredName"
                component={VoteNativePage}
              />
              <Route
                exact={true}
                path="/vote-native/"
                component={VoteNativePage}
              />
              <Route
                exact={true}
                path="/profile/*"
                component={ProfileContainer}
              />
              <Route
                exact={true}
                path="/delegate/:id/:type?"
                component={DelegateContent}
              />
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
  textRendering: "optimizeLegibility",
}));
