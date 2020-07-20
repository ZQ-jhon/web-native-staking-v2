import CopyOutlined from "@ant-design/icons/CopyOutlined";
import Button from "antd/lib/button";
import { SizeType } from "antd/lib/config-provider/SizeContext";
import Tooltip from "antd/lib/tooltip";
import { t } from "onefx/lib/iso-i18n";
import { Component } from "react";
import React from "react";
import copy from "text-to-clipboard";

type Props = {
  text: string;
  size?: SizeType;
};

type State = {
  trigger: "hover" | "focus" | "click" | "contextMenu" | undefined;
  title: string;
  copied: string;
  visible: boolean;
};

export class CopyButtonClipboardComponent extends Component<Props, State> {
  state: State = {
    trigger: "hover",
    title: t("copy.toClipboard"),
    copied: "",
    visible: false,
  };

  copyToAddress = () => {
    const { text } = this.props;
    copy.copyCB(text || "");
    this.setState({
      trigger: "click",
      title: t("copy.copied"),
      copied: "copied",
      visible: true,
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
      visible: true,
    });
  };

  render(): JSX.Element {
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
          icon={<CopyOutlined />}
          size={size}
          onClick={() => this.copyToAddress()}
          onMouseLeave={() => this.hideTips()}
          onMouseOver={() => this.btnReload()}
        />
      </Tooltip>
    );
  }
}
