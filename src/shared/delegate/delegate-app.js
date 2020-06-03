// @flow
import { Component } from "react";
import { Layout } from "antd";
import { connect } from "react-redux";
import { Route } from "react-router-dom";
import { Switch } from "react-router";
import { withRouter } from "react-router";
import { styled } from "onefx/lib/styletron-react";
import { NotFound } from "../common/not-found";
import { ContentDocument } from "../common/styles/style-document";
import { DelegateContent } from "./delegate-content";
import { FOOTER_ABOVE } from "../common/footer";
import Footer from "iotex-react-footer";
import { TopBar } from "../common/top-bar";
import { fonts } from "../common/styles/style-font";
import { colors } from "../common/styles/style-color2";
import { Head } from "../common/head";
import { DelgeateNameRegistration } from "./delegate-name-registration";

type Props = {
  location: any,
  locale: string
};

class Delegate extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
  }
  render() {
    const { locale } = this.props;
    return (
      <RootStyle>
        <Head locale={locale} />
        <TopBar />
        <div style={FOOTER_ABOVE}>
          <ContentDocument>
            <Layout>
              <Switch>
                <Route
                  exact
                  path="/delegate/:id/:type?"
                  component={DelegateContent}
                />
                <Route
                  exact
                  path="/delegate/name-registration"
                  component={DelgeateNameRegistration}
                />
                <Route component={NotFound} />
              </Switch>
            </Layout>
          </ContentDocument>
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

// $FlowFixMe
export const DelegateApp = withRouter(
  connect(state => ({
    locale: state.base.locale
  }))(Delegate)
);
