/* eslint-disable no-invalid-this */
// @flow
// @ts-ignore
import { Button } from "antd";
import { Tooltip } from "antd";
// @ts-ignore
import { t } from "onefx/lib/iso-i18n";
import React, { Component } from "react";
import copy from "text-to-clipboard";
import { SizeType } from "antd/lib/config-provider/SizeContext";

type Props = {
  text: string,
  size?: "small" | "medium" | "large"
};

type State = {
  trigger: "hover" | "focus" | "click" | "contextMenu",
  title: string,
  copied: string,
  visible: boolean
};

export class CopyButtonClipboardComponent extends Component<Props, State> {
  state: State = {
    trigger: "hover",
    title: t("copy.toClipboard"),
    copied: "",
    visible: false
  };

  copyToAddress = () => {
    const { text } = this.props;
    copy.copyCB(text || "");
    this.setState({
      trigger: "click",
      title: t("copy.copied"),
      copied: "copied",
      visible: true
    });
  };

  handleVisibleChange = (visible: boolean) => {
    this.setState({ visible });
  };

  hideTips = () => {
    this.setState({ copied: "", visible: false });
  };

  btnReload = () => {
    this.setState({
      trigger: "hover",
      title: t("copy.toClipboard"),
      copied: "",
      visible: true
    });
  };

  render() {
    const { trigger, title, copied, visible } = this.state;
    const { size } = this.props;
    return (
      <Tooltip
        placement="top"
        trigger={trigger}
        title={title}
        visible={visible}
        onVisibleChange={this.handleVisibleChange}
      >
        <Button
          className={copied}
          shape="circle"
          icon="copy"
          size={
            // $FlowFixMe
            size as SizeType
          }
          onClick={() => this.copyToAddress()}
          onMouseLeave={() => this.hideTips()}
          onMouseOver={() => this.btnReload()}
        />
      </Tooltip>
    );
  }
}
