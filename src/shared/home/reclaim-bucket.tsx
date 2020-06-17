import React, { PureComponent, RefObject } from "react";
import { connect } from "react-redux";
import Button from "antd/lib/button";
import { Input } from "antd";
import Form, { FormInstance } from "antd/lib/form";
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
        reclaim:
          "This is to certify I am transferring the ownership of said bucket to said recipient on IoTeX blockchain"
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
      <p>You can reclaim the bucket by running the following ioctl command:</p>
      <h4>{`ioctl stake2 reclaim ${Number(
        this.state.bucketIndex
      )} Ethereum -s ${this.state.address} -p 1 -l 300000`}</h4>
      <p>
        or if you wish to use the web tool, make sure ioPay is opened (and it
        has the recipient private key/account), then click Continue
      </p>
    </div>
  );

  public render(): JSX.Element {
    const { showMessageBox } = this.state;
    return (
      <div style={{ width: "100vw", height: "100vh" }}>
        <Form layout={"vertical"} style={{ padding: "1em" }} ref={this.formRef}>
          <h1>Reclaim Bucket</h1>
          <Form.Item name={"id"} initialValue="id">
            <Input name="id" type="hidden" placeholder={""} />
          </Form.Item>

          <Form.Item
            label="Bucket Index"
            name="address"
            initialValue=""
            rules={[
              {
                required: true,
                message: "enter the value of index"
              }
            ]}
          >
            <Input
              onChange={(event: any) => {
                this.setState({
                  bucketIndex: event.target.value
                });
              }}
            />
          </Form.Item>
          <Form.Item
            label="Recipient Address"
            name="message signature hash"
            initialValue=""
            rules={[
              {
                required: true,
                message: "enter the value of signature hash"
              }
            ]}
          >
            <Input
              onChange={(event: any) => {
                this.setState({
                  address: event.target.value
                });
              }}
            />
          </Form.Item>
          {showMessageBox && (
            <Form.Item
              label="Message to sign using HD-Wallet"
              name="message signature hash"
              initialValue={this.state.jsonMessage}
              rules={[
                {
                  required: true,
                  message: "enter the value of signature hash"
                }
              ]}
            >
              <Input.TextArea
                rows={4}
                value={JSON.stringify(this.state.jsonMessage)}
              />
              <p>Copy the message to sign using HDWallet</p>
            </Form.Item>
          )}
          {!showMessageBox && (
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                disabled={this.checkDisable()}
                style={{ marginRight: "10px" }}
                onClick={this.showModal}
              >
                Continue
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
