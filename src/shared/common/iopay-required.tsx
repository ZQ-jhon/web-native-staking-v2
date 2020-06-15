/* tslint:disable:no-any */
// @flow
import LoadingOutlined from "@ant-design/icons/LoadingOutlined";
import Alert from "antd/lib/alert";
// @ts-ignore
import { assetURL } from "onefx/lib/asset-url";
import { t } from "onefx/lib/iso-i18n";
import React, { PureComponent } from "react";
import { connect } from "react-redux";
// @ts-ignore
import sleepPromise from "sleep-promise";
import { Flex } from "./flex";
import { getAntenna } from "./get-antenna";

type State = {
  isIoPayMobileConnected?: boolean;
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
  forwardedRef?: any;
  isIoPayMobile?: boolean;
};

// tslint:disable-next-line:no-any
export const IopayRequired = (InnerComponent: any) => {
  // @ts-ignore
  @connect((state: any) => ({
    isIoPayMobile: state.base.isIoPayMobile
  }))
  class HOC extends PureComponent<Props, State> {
    static displayName: string = `HOC(${InnerComponent.displayName ||
      InnerComponent.name ||
      "Component"})`;

    state: State = {
      isIoPayMobileConnected: undefined
    };

    async componentDidMount(): Promise<void> {
      const { isIoPayMobile = false } = this.props;
      if (!isIoPayMobile) {
        await this.connectIoPayDesktop();
      }
    }

    connectIoPayDesktop = async (): Promise<void> => {
      const antenna = getAntenna();
      // tslint:disable-next-line:no-typeof-undefined
      let iopayConnected =
        antenna &&
        antenna.iotx &&
        antenna.iotx.accounts &&
        antenna.iotx.accounts[0];
      if (!Boolean(iopayConnected)) {
        await sleepPromise(3000);
        iopayConnected =
          antenna &&
          antenna.iotx &&
          antenna.iotx.accounts &&
          antenna.iotx.accounts[0];
      }
      this.setState({ isIoPayMobileConnected: Boolean(iopayConnected) });
    };

    render(): JSX.Element {
      const { forwardedRef, isIoPayMobile, ...props } = this.props;
      const { isIoPayMobileConnected } = this.state;
      if (isIoPayMobile) {
        return (
          <InnerComponent
            antenna={getAntenna()}
            ref={forwardedRef}
            {...props}
          />
        );
      }
      switch (isIoPayMobileConnected) {
        case undefined:
          return (
            <Flex center={true} width={"100%"}>
              <LoadingOutlined />
            </Flex>
          );
        case false:
          return <DownloadButton />;
        case true:
        default:
          return (
            <InnerComponent
              antenna={getAntenna()}
              ref={forwardedRef}
              {...props}
            />
          );
      }
    }
  }
  return HOC;
};
