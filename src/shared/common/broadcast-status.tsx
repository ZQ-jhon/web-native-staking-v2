// @flow
import React, { Component } from "react";
// $FlowFixMe
import Icon from "antd/lib/icon";
//import { t } from "onefx/lib/iso-i18n";
import { CopyButtonClipboardComponent } from "./copy-button-clipboard";
import { colors } from "./styles/style-color2";
// @ts-ignore
import window from "global/window";
import Web3Utils from "web3-utils";
import { getEthworkAddress } from "./eth-help";
import { getNativeNetworkEndpoint } from "../xapps/xapp-request";
import { getMobileNativeAntenna } from "./get-antenna";

const TX_INTERVAL = 6000;

type BroadcastStatusProps = {
  txHash: string,
  onCompleted?: (success: boolean) => void,
  isNative?: boolean
};

export class BroadcastStatus extends Component<
  BroadcastStatusProps,
  { status: number }
> {
  timer = null;

  state = {
    status: -1
  };

  componentDidMount() {
    const { txHash, onCompleted } = this.props;
    this.fetching(txHash, onCompleted);
  }

  componentWillReceiveProps(nextProps: BroadcastStatusProps) {
    const { txHash, onCompleted } = nextProps;
    if (txHash !== this.props.txHash) this.fetching(txHash, onCompleted);
  }

  fetching(txHash: string, onCompleted?: (success: boolean) => void) {
    const { isNative = false } = this.props;
    if (isNative) {
      this.setState({ status: 1 });
      return;
    }

    this.setState({ status: -1 });
    const broadcastStatus = this;
    broadcastStatus.timer = window.setInterval(() => {
      window.web3.eth.getTransactionReceipt(txHash, function(error, result) {
        window.console.log("getTransactionReceipt");
        if (!error) {
          window.console.log(result);
          if (result && result.status !== undefined) {
            window.clearInterval(broadcastStatus.timer);
            broadcastStatus.setState({
              status: Web3Utils.hexToNumber(result.status)
            });
            if (onCompleted) onCompleted(true);
          }
        } else {
          window.console.error(error);
          window.clearInterval(broadcastStatus.timer);
          if (onCompleted) onCompleted(false);
        }
      });
    }, TX_INTERVAL);
  }

  componentWillUnmount() {
    window.clearInterval(this.timer);
  }

  render() {
    const { txHash, isNative = false } = this.props;
    const { status } = this.state;
    const iconType =
      status >= 1 ? "check-circle" : status < 0 ? "loading" : "close-circle";
    const iconColor = status == 0 ? colors.error : colors.success;
    const href = isNative
      ? `https://${getNativeNetworkEndpoint(
          getMobileNativeAntenna().currentProvider()
        )}/action/${txHash}`
      : `https://${getEthworkAddress(
          window.web3.currentProvider
        )}/tx/${txHash}`;

    return (
      <div>
        <div style={{ marginTop: "30px" }} />
        <p style={{ fontSize: "24px", fontWeight: "bold" }}>
          <Icon type="check-circle" style={{ color: colors.success }} />
          <span style={{ marginLeft: "10px" }}>{t("broadcast.success")}</span>
        </p>
        <p>
          {t("broadcast.txhash")}
          <span>
            {"   "}
            <Icon type={iconType} style={{ color: iconColor }} />{" "}
          </span>
        </p>
        <p>
          <span>
            <strong>
              <a
                rel="noreferrer noopener"
                href={href}
                target="_blank"
                style={{ cursor: "pointer" }}
              >
                {txHash}
              </a>
            </strong>
          </span>
          <span style={{ marginLeft: "5px" }}>
            <CopyButtonClipboardComponent text={txHash} />
          </span>
        </p>
      </div>
    );
  }
}
