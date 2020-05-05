/* tslint:disable:no-any */
// @flow
import {LoadingOutlined} from "@ant-design/icons";
import {Alert} from "antd";
// @ts-ignore
import {assetURL} from "onefx/lib/asset-url";
import {t} from "onefx/lib/iso-i18n";
import React, {PureComponent} from "react";
import {connect} from "react-redux";
// @ts-ignore
import sleepPromise from "sleep-promise";
import {getAntenna} from "./get-antenna";

type State = {
  isIopayConnected?: boolean;
};

export function DownloadButton(): JSX.Element {
  return (
    <div>
      <Alert
        message="Error"
        description={
          <div>
            <div>{t("contract.install")}</div>
            <a
              href="https://iopay.iotex.io/desktop/"
              rel="noopener noreferrer"
              target="_blank"
            >
              <img
                alt="download metamask"
                style={{ height: "60px" }}
                src={assetURL("favicon.png")}
              />
            </a>
          </div>
        }
        type="error"
        showIcon={true}
      />
    </div>
  );
}

type Props = {
  // tslint:disable-next-line:no-any
  forwardedRef: any;
  isIoPay?: boolean;
};

// tslint:disable-next-line:no-any
export const IopayRequired = (InnerComponent: any) => {
  // @ts-ignore
  @connect((state: any) => ({
    isIoPay: state.base.isIoPay
  }))
  class HOC extends PureComponent<Props, State> {
    static displayName: string = `HOC(${InnerComponent.displayName ||
    InnerComponent.name ||
    "Component"})`;

    state: State = {
      isIopayConnected: undefined
    };

    async componentDidMount(): Promise<void> {
      const { isIoPay = false } = this.props;
      if (!isIoPay) {
        await this.setMetaMask();
      }
    }

    setMetaMask = async (): Promise<void> => {
      const antenna = getAntenna();
      await sleepPromise(3000);
      // tslint:disable-next-line:no-typeof-undefined
      const iopayConnected =
        antenna &&
        antenna.iotx &&
        antenna.iotx.accounts &&
        antenna.iotx.accounts[0];

      this.setState({ isIopayConnected: Boolean(iopayConnected) });
    };

    render(): JSX.Element {
      const { forwardedRef, isIoPay, ...props } = this.props;
      const { isIopayConnected } = this.state;
      if (isIoPay) {
        return (
          <InnerComponent ref={forwardedRef} {...props} />
        );
      }
      switch (isIopayConnected) {
        case undefined:
          return <LoadingOutlined />;
        case false:
          return <DownloadButton />;
        case true:
        default:
          return (
            <InnerComponent ref={forwardedRef} {...props} />
          );
      }
    }
  };
  return HOC;
};
