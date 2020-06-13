import Button from "antd/lib/button";
import { t } from "onefx/lib/iso-i18n";
import React, { Component } from "react";
import { getAntenna } from "../../../common/get-antenna";
import { IopayRequired } from "../../../common/iopay-required";
import { axiosInstance } from "./axios-instance";
import { InputError } from "./input-error";

type State = {
  isLoading: boolean;
  message: string;
  nonce: string;
  error: {
    code: string;
    message: string;
  } | null;
};

// @ts-ignore
@IopayRequired
export class LoginOrSignUp extends Component<{}, State> {
  state: State = {
    isLoading: true,
    message: "",
    nonce: "",
    error: null
  };

  async componentDidMount(): Promise<void> {
    try {
      const { data } = await axiosInstance.post("/api/sign-in/meta");
      this.setState({
        isLoading: false,
        message: data.message,
        nonce: data.nonce
      });
    } catch (e) {
      this.setState({
        isLoading: false,
        error: {
          code: "FAILED_TO_INIT",
          message: "failed to initalize"
        }
      });
    }
  }

  onSubmit = async (e: Event) => {
    const { nonce } = this.state;
    e.preventDefault();
    const acct = getAntenna().iotx.accounts[0];
    const msg = `Login with ${acct.address} and the nonce of ${nonce}`;
    const sig = await acct.sign(msg);
    const { data } = await axiosInstance.post("/api/sign-in/", {
      sig: sig.toString("hex"),
      address: acct.address
    });
    if (data.ok && data.shouldRedirect) {
      return (window.location.href = data.next);
    } else if (data.error) {
      this.setState({ error: data.error });
    }
  };

  render(): JSX.Element {
    return (
      <>
        <Button
          type="primary"
          htmlType="submit"
          // @ts-ignore
          onClick={(e: Event) => this.onSubmit(e)}
          style={{ width: "100%" }}
          size="large"
          loading={this.state.isLoading}
        >
          {t("auth/button_submit")}
        </Button>
        {this.state.error && (
          <InputError>{this.state.error.message}</InputError>
        )}
      </>
    );
  }
}
