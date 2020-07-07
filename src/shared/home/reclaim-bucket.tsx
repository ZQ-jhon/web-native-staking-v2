import CopyOutlined from "@ant-design/icons/CopyOutlined";
import Button from "antd/lib/button";
import Form, { FormInstance } from "antd/lib/form";
import Input from "antd/lib/input";
import { validateAddress } from "iotex-antenna/lib/account/utils";
import { t } from "onefx/lib/iso-i18n";
import React, { PureComponent, RefObject } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { connect } from "react-redux";
import { getAntenna } from "../../shared/common/get-antenna";
import { LinkButton } from "../common/buttons";
import { Flex } from "../common/flex";
import { validateIoAddress } from "../staking/field-validators";

//const regex = /^([0-9]+)I authorize 0x[0-9a-fA-F]{40} to claim in (0x[0-9A-Fa-f]{40})$/;

type IJSONMESSAGE = {
  bucket: Number;
  recipient: string;
  nonce: Number;
  reclaim: string;
};

type STATE = {
  visible: Boolean;
  addressCopied: Boolean;
  messageCopied: Boolean;
  bucketIndexCopied: Boolean;
  showMessageBox: Boolean;
  address: string;
  bucketIndex: string;
  jsonMessage: IJSONMESSAGE;
};

class ReclaimInnerTools extends PureComponent<null, STATE> {
  constructor(props: null) {
    super(props);
    this.state = {
      visible: false,
      addressCopied: false,
      bucketIndexCopied: false,
      messageCopied: false,
      showMessageBox: false,
      address: "",
      bucketIndex: "",
      jsonMessage: {
        bucket: 0,
        recipient: "",
        nonce: 0,
        reclaim: "",
      },
    };
  }

  formRef: RefObject<FormInstance> = React.createRef<FormInstance>();

  handleCancel = () => {
    this.setState({ visible: false });
  };

  showModal = async (showMessageBox: Boolean) => {
    const nonce = await getNonce(this.state.address);
    if (showMessageBox) {
      const jsonMessage = {
        bucket: Number(this.state.bucketIndex),
        nonce: nonce,
        recipient: this.state.address,
        reclaim: t("reclaim.reclaimMessage"),
      };
      // @ts-ignore
      this.setState({ visible: false, showMessageBox, jsonMessage });
    } else {
      this.setState({ visible: false });
    }
  };

  checkDisable = () => {
    const { address, bucketIndex } = this.state;
    if (
      address.length === 0 ||
      bucketIndex.length === 0 ||
      !validateAddress(address)
    ) {
      return true;
    } else {
      return false;
    }
  };

  copyMessage = () => {
    const text = JSON.stringify(this.state.jsonMessage);
    return (
      <div style={{ position: "absolute", marginTop: "-33px", right: "4px" }}>
        <p>
          <CopyToClipboard
            text={text}
            onCopy={() => {
              this.setState({ messageCopied: true });
              window.setTimeout(
                () => this.setState({ messageCopied: false }),
                2000
              );
            }}
          >
            {/* tslint:disable-next-line:react-a11y-anchors */}
            <CopyOutlined />
          </CopyToClipboard>
          {this.state.messageCopied && (
            <span style={{ color: "red" }}>Message Copied.</span>
          )}
        </p>
      </div>
    );
  };

  copyText = (name: string) => {
    const text =
      name === "Address" ? this.state.address : this.state.bucketIndex;
    return (
      <div>
        <CopyToClipboard
          text={text}
          onCopy={() => {
            name === "Address"
              ? this.setState({ addressCopied: true })
              : this.setState({ bucketIndexCopied: true });
            window.setTimeout(
              () =>
                this.setState({
                  addressCopied: false,
                  bucketIndexCopied: false,
                }),
              2000
            );
          }}
        >
          {/* tslint:disable-next-line:react-a11y-anchors */}
          <CopyOutlined />
        </CopyToClipboard>
        {this.state.bucketIndexCopied && name === "bucketIndex" && (
          <span style={{ color: "red" }}>Index Copied.</span>
        )}
        {this.state.addressCopied && name === "Address" && (
          <span style={{ color: "red" }}>Address Copied.</span>
        )}
      </div>
    );
  };

  reclaimBucketContent = () => {
    return (
      // @ts-ignore
      <Form layout={"vertical"} style={{ padding: "1em" }} ref={this.formRef}>
        <h1>{t("reclaim.bucketHeader")}</h1>
        <Flex width="100%" column={true} alignItems="flex-start">
          <p style={{ fontSize: "13px" }}>{t("reclaimBucket.introduction")}</p>
        </Flex>
        {/*
            // @ts-ignore */}
        <Form.Item
          label={t("reclaim.bucketIndex")}
          name="address"
          initialValue=""
          rules={[
            {
              required: true,
              message: t("recliam.bucketIndex.error"),
            },
          ]}
        >
          <Input
            onChange={(event) => {
              this.setState({
                bucketIndex: event.target.value,
                bucketIndexCopied: false,
              });
            }}
            addonAfter={this.copyText("bucketIndex")}
          />
        </Form.Item>
        {/*
            // @ts-ignore */}
        <Form.Item
          label={t("reclaim.recipientAddress")}
          name={"recipient_address"}
          initialValue=""
          rules={[
            {
              required: true,
              message: t("reclaim.recipientAddress.error"),
            },
            {
              validator: validateIoAddress,
            },
          ]}
        >
          <Input
            onChange={(event) => {
              this.setState({
                address: event.target.value,
                addressCopied: false,
              });
            }}
            addonAfter={this.copyText("Address")}
          />
        </Form.Item>
        <p style={{ fontSize: "12px" }}>{t("reclaim.continueWebTools")}</p>
        {this.state.showMessageBox && (
          // @ts-ignore
          <Form.Item
            label={t("reclaim.message")}
            name={"message_signature_hash"}
            initialValue={this.state.jsonMessage}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input.TextArea
              rows={4}
              value={JSON.stringify(this.state.jsonMessage)}
            />
            {this.copyMessage()}
            <LinkButton href="https://mycrypto.com/sign-and-verify-message/sign">
              Click here to sign the message
            </LinkButton>
          </Form.Item>
        )}
        {/*
            // @ts-ignore */}
        {!this.state.showMessageBox && (
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              disabled={this.checkDisable()}
              style={{ marginRight: "10px" }}
              onClick={() => this.showModal(true)}
            >
              {t("reclaim.contiunueButton")}
            </Button>
          </Form.Item>
        )}
      </Form>
    );
  };

  public render(): JSX.Element {
    return (
      <div style={{ width: "100vw", height: "100vh" }}>
        {this.reclaimBucketContent()}
      </div>
    );
  }
}

export const ReclaimTools = connect()(ReclaimInnerTools);

export async function getNonce(address: string): Promise<number> {
  const antenna = getAntenna();
  const { accountMeta } = await antenna.iotx.getAccount({ address });
  // @ts-ignore
  return accountMeta.nonce;
}
