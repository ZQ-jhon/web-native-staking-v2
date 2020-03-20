/* tslint:disable:no-any */
// @flow
import { LoadingOutlined } from "@ant-design/icons";
import { Alert } from "antd";
import { get } from "dottie";
// @ts-ignore
import window from "global/window";
import { assetURL } from "onefx/lib/asset-url";
import { t } from "onefx/lib/iso-i18n";
import React, { PureComponent } from "react";

type State = {
  isMetaMaskInstalled?: boolean;
  isMetaMaskUnlocked?: boolean;
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
              href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn"
              rel="noopener noreferrer"
              target="_blank"
            >
              <img
                alt="download metamask"
                style={{ height: "60px" }}
                src={assetURL("download-metamask.png")}
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

export async function enableEthereum(): Promise<void> {
  if (get(window, "ethereum.enable") && !get(window, "web3.eth.accounts.0")) {
    await window.ethereum.enable();
  }
}

type Props = {
  // tslint:disable-next-line:no-any
  forwardedRef: any;
  isIoPay?: boolean;
};

// tslint:disable-next-line:no-any
export const MetamaskRequired = (InnerComponent: any) => {
  return class HOC extends PureComponent<Props, State> {
    static displayName: string = `HOC(${InnerComponent.displayName ||
      InnerComponent.name ||
      "Component"})`;

    state: State = {
      isMetaMaskInstalled: undefined,
      isMetaMaskUnlocked: true
    };

    web3: any;

    async componentDidMount(): Promise<void> {
      await this.setMetaMask();
    }

    async setMetaMask(): Promise<void> {
      // tslint:disable-next-line:no-typeof-undefined
      const isMetaMaskInstalled = typeof window.web3 !== "undefined";
      this.setState({ isMetaMaskInstalled });

      if (isMetaMaskInstalled) {
        this.web3 = window.web3;

        await enableEthereum();

        const isMetaMaskUnlocked =
          window.web3.eth.accounts && window.web3.eth.accounts.length > 0;
        if (!isMetaMaskUnlocked) {
          this.setState({ isMetaMaskUnlocked: false });
        }
      } else {
        // TODO (remove log this after stablize)
        window.console.log(
          "No metamask detected. Set a listener of window load event for metamask again."
        );
        window.addEventListener("load", this.setMetaMask);
      }
    }

    render(): JSX.Element {
      const { forwardedRef, ...props } = this.props;
      const { isMetaMaskInstalled, isMetaMaskUnlocked } = this.state;

      switch (isMetaMaskInstalled) {
        case undefined:
          return <LoadingOutlined />;
        case false:
          return <DownloadButton />;
        case true:
        default:
          if (isMetaMaskUnlocked) {
            return (
              <InnerComponent web3={this.web3} ref={forwardedRef} {...props} />
            );
          }
          return (
            <Alert
              message="Error"
              description={t("contract.please_unlock")}
              type="error"
              showIcon={true}
            />
          );
      }
    }
  };
};
