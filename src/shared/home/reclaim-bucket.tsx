import Alert from "antd/lib/alert";
import Button from "antd/lib/button";
import Form, { FormInstance } from "antd/lib/form";
import Input from "antd/lib/input";
import TextArea from "antd/lib/input/TextArea";
import Layout from "antd/lib/layout";
import { Buffer } from "buffer";
import { toRau, validateAddress } from "iotex-antenna/lib/account/utils";
import { t } from "onefx/lib/iso-i18n";
import React, {Component, PureComponent, RefObject} from "react";
import { connect } from "react-redux";
import { getStaking } from "../../server/gateway/staking";
import {getAntenna} from "../../shared/common/get-antenna";
import { LinkButton } from "../common/buttons";
import {CommonMargin} from "../common/common-margin";
import {RootStyle} from "../common/component-style";
import {CopyButtonClipboardComponent} from "../common/copy-button-clipboard";
import { Flex } from "../common/flex";
import {IopayRequired} from "../common/iopay-required";
import { colors } from "../common/styles/style-color";
import {Pd} from "../common/styles/style-padding";
import { DEFAULT_STAKING_GAS_LIMIT } from "../common/token-utils";
import { validateIoAddress } from "../staking/field-validators";
import { MAX_WIDTH } from "./voting";

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
  tsx: string;
  sig: string;
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
      tsx: "",
      sig: "",
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

  showModal = async (showMessageBox: Boolean) => {
    const nonce = await getNonce(this.state.address);
    if (showMessageBox) {
      const jsonMessage = {
        bucket: Number(this.state.bucketIndex),
        nonce: nonce + 1,
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
    return address.length === 0 ||
      bucketIndex.length === 0 ||
      !validateAddress(address);
  };

  sendToBlockChain = async () => {
   const payload = {
      type: "Ethereum",
      msg: JSON.stringify(this.state.jsonMessage),
      sig: this.state.sig.replace("0x", "")
    };
    const payloadStringtify = JSON.stringify(payload);
    const payloadBytes = Buffer.from(payloadStringtify);
    const tsx = await getStaking().transferOwnership({
      bucketIndex: Number(this.state.bucketIndex),
      voterAddress: this.state.address,
      // @ts-ignore
      payload: payloadBytes,
      gasLimit: DEFAULT_STAKING_GAS_LIMIT,
      gasPrice: toRau("1", "Qev"),
    });
    this.setState({ tsx });
  };


  // tslint:disable-next-line:max-func-body-length
  reclaimBucketContent = () => {
    return (
      <Layout style={{ ...layoutStyle, marginBottom: "15px" }}>
        {
          // @ts-ignore
          <Form
            layout={"vertical"}
            style={{ padding: "1em" }}
            ref={this.formRef}>
            <h1><b>{t("reclaim.bucketHeader")}</b></h1>
            {this.state.tsx.length > 0 && (
              <div>
                <Alert
                  message={t("reclaim.success")}
                  type="success"
                  showIcon={true}
                />
                <CommonMargin />
              </div>
            )}
            <Flex width="100%" column={true} alignItems="flex-start">
              <p style={{ fontSize: "13px" }}>
                {t("reclaimBucket.introduction")}
              </p>
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
                addonAfter={<CopyButtonClipboardComponent text={this.state.bucketIndex} size={"small"} />}
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
                addonAfter={<CopyButtonClipboardComponent text={this.state.address} size={"small"} />}
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
                <div style={{ position: "absolute", marginTop: "-33px", right: "4px" }}>
                  <CopyButtonClipboardComponent text={JSON.stringify(this.state.jsonMessage)} size={"small"} />
                </div>
                <LinkButton href="https://mycrypto.com/sign-and-verify-message/sign">
                  {t("reclaim.click-to-sign")}
                </LinkButton>
              </Form.Item>
            )}
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
            {
              this.state.jsonMessage.recipient.length > 0 && (
                <Form.Item
                  label={t("reclaim.sig.desc")}
                >
                  <TextArea
                    onChange={(event) => {
                      this.setState({
                        sig: event.target.value,
                      });
                    }}
                  />
                </Form.Item>
              )}
            {this.state.jsonMessage.recipient.length > 0 && (
              <Form.Item>
                {
                  // @ts-ignore
                  <Reclaim
                    disabled={this.checkDisable()}
                    submit={this.sendToBlockChain}
                  />
                }
              </Form.Item>
            )}
          </Form>
        }
      </Layout>
    );
  };

  public render(): JSX.Element {
    return (
      <RootStyle>
        <Layout>
          <CommonMargin />
          <Pd>
            {this.reclaimBucketContent()}
          </Pd>
        </Layout>
      </RootStyle>
    );
  }
}

const layoutStyle = {
  width: "100%",
  maxWidth: `${MAX_WIDTH}px`,
  backgroundColor: colors.white,
  fontFamily: "arial",
};

export const Reclaim = IopayRequired(
    class ClaimButton extends Component<{ disabled: boolean, submit(): {}; }> {

      render(): JSX.Element {
        return (
          <Button
            type="primary"
            htmlType="submit"
            disabled={this.props.disabled}
            style={{ marginRight: "10px" }}
            onClick={this.props.submit}
          >
            {t("reclaim.sign-and-send")}
          </Button>
        );
      }
    }
);

export const ReclaimTools = connect()(ReclaimInnerTools);

export async function getNonce(address: string): Promise<number> {
  const antenna = getAntenna();
  const { accountMeta } = await antenna.iotx.getAccount({ address });
  // @ts-ignore
  return accountMeta.nonce;
}
