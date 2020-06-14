import { t } from "onefx/lib/iso-i18n";
// @ts-ignore
import Helmet from "onefx/lib/react-helmet";
// @ts-ignore
import { styled } from "onefx/lib/styletron-react";
import { Component } from "react";
import React from "react";
import { connect } from "react-redux";
import { Flex } from "../../../common/flex";
import { fullOnPalm } from "../../../common/styles/style-media";
import { ContentPadding } from "../../../common/styles/style-padding";
import { FieldMargin } from "./field-margin";
import { FormContainer } from "./form-container";
import { LoginOrSignUp } from "./login-or-sign-up-button";

const LOGIN_FORM = "login";

type Props = {
  next: string;
};

class SignInInner extends Component<Props> {
  public render(): JSX.Element {
    return (
      <ContentPadding>
        <Flex minHeight="550px" center={true}>
          <Form id={LOGIN_FORM}>
            <Helmet title={`login - ${t("topbar.brand")}`} />
            <Flex column={true}>
              <Title>{t("auth/sign_in.title")}</Title>
              <FieldMargin>
                <LoginOrSignUp />
              </FieldMargin>
            </Flex>
          </Form>
        </Flex>
      </ContentPadding>
    );
  }
}

const Title = styled("h1", {
  textAlign: "center"
});

const Form = styled(FormContainer, {
  width: "320px",
  ...fullOnPalm
});

export const SignIn = connect(
  // tslint:disable-next-line:no-any
  (state: any) => ({ next: state.base.next })
)(SignInInner);
