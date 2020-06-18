import { Input } from "antd";
import Button from "antd/lib/button";
import Form, { FormInstance } from "antd/lib/form";
import { t } from "onefx/lib/iso-i18n";
import React, { PureComponent, RefObject } from "react";
import { connect } from "react-redux";
import { CommonModal } from "../common/common-modal";

type IJSONMESSAGE = {
  bucket: Number;
  recipient: string;
  nonce: Number;
  reclaim: string;
};

type STATE = {
  visible: Boolean;
  showMessageBox: Boolean;
  address: String;
  bucketIndex: String;
  jsonMessage: IJSONMESSAGE;
};

class ReclaimInnerTools extends PureComponent<null, STATE> {
  constructor(props: null) {
    super(props);
    this.state = {
      visible: false,
      showMessageBox: false,
      address: "",
      bucketIndex: "",
      jsonMessage: {
        bucket: 0,
        recipient: "",
        nonce: 0,
        reclaim: ""
      }
    };
  }

  formRef: RefObject<FormInstance> = React.createRef<FormInstance>();

  handleCancel = () => {
    this.setState({ visible: false });
  };

  showModal = () => {
    this.setState({ visible: true });
  };

  closeModal = (showMessageBox: Boolean) => {
    if (showMessageBox) {
      const jsonMessage = {
        bucket: Number(this.state.bucketIndex),
        nonce: 136,
        recipient: this.state.address,
        reclaim: t("reclaim.reclaimMessage")
      };
      // @ts-ignore
      this.setState({ visible: false, showMessageBox, jsonMessage });
    } else {
      this.setState({ visible: false });
    }
  };
  checkDisable = () => {
    const { address, bucketIndex } = this.state;
    if (address.length === 0 || bucketIndex.length === 0) {
      return true;
    } else {
      return false;
    }
  };
  getFooter = () => (
    <div>
      <Button type="primary" onClick={() => this.closeModal(false)}>
        Cancel
      </Button>
      <Button type="primary" onClick={() => this.closeModal(true)}>
        Continue
      </Button>
    </div>
  );

  renderOptions = () => (
    <div>
      <p>{t("reclaim.popUpMessage.runIoctlCmd")}:</p>
      <h4>{`ioctl stake2 reclaim ${Number(
        this.state.bucketIndex
      )} Ethereum -s ${this.state.address} -p 1 -l 300000`}</h4>
      <p>{t("reclaim.continueWebTools")}</p>
    </div>
  );

  public render(): JSX.Element {
    return (
      <div style={{ width: "100vw", height: "100vh" }}>
        {/*
            // @ts-ignore */}
        <Form layout={"vertical"} style={{ padding: "1em" }} ref={this.formRef}>
          <h1>{t("reclaim.bucketHeader")}</h1>
          {/*
                // @ts-ignore */}
          <Form.Item
            label={t("reclaim.bucketIndex")}
            name="address"
            initialValue=""
            rules={[
              {
                required: true,
                message: t("recliam.bucketIndex.error")
              }
            ]}
          >
            <Input
              onChange={event => {
                this.setState({
                  bucketIndex: event.target.value
                });
              }}
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
                message: t("reclaim.recipientAddress.error")
              }
            ]}
          >
            <Input
              onChange={event => {
                this.setState({
                  address: event.target.value
                });
              }}
            />
          </Form.Item>
          {this.state.showMessageBox && (
            // @ts-ignore
            <Form.Item
              label={t("reclaim.message")}
              name={"message_signature_hash"}
              initialValue={this.state.jsonMessage}
              rules={[
                {
                  required: true
                }
              ]}
            >
              <Input.TextArea
                rows={4}
                value={JSON.stringify(this.state.jsonMessage)}
              />
              <p>{t("reclaim.copyMessaage")}</p>
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
                onClick={this.showModal}
              >
                {t("reclaim.contiunueButton")}
              </Button>
            </Form.Item>
          )}
          <CommonModal
            className="vote-modal"
            title="Reclaim Options"
            visible={this.state.visible}
            onCancel={this.handleCancel}
            footer={this.getFooter()}
          >
            {this.renderOptions()}
          </CommonModal>
        </Form>
      </div>
    );
  }
}

export const ReclaimTools = connect()(ReclaimInnerTools);
