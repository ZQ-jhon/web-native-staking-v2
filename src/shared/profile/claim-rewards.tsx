/* eslint-disable no-invalid-this */
// @flow
import { Buffer } from "buffer";
import { t } from "onefx/lib/iso-i18n";
import { PureComponent } from "react";
import { Form, Input, Button, Modal, Alert, Divider } from "antd";
import { fromRau } from "iotex-antenna/lib/account/utils";
import { fromString } from "iotex-antenna/lib/crypto/address";
import { connect } from "react-redux";
import window from "global/window";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import {
  largerOrEqualTo,
  validateIoAddress
} from "../smart-contract/field-validators";
import { getAntenna } from "../common/get-antenna";
// $FlowFixMe
import { colors } from "../common/styles/style-color2";
import { CopyButtonClipboardComponent } from "../common/copy-button-clipboard";
import { CommonMargin } from "../common/common-margin";

export const GET_BP_CANDIDATES = gql`
  query bpCandidatesOnContract($address: String) {
    bpCandidatesOnContract(address: $address) {
      ioRewardAddr
    }
  }
`;

type Props = {
  history: any,
  eth: string,
  form: any
};

type State = {
  ioAddress: string,
  rewardRau: string,
  ethAddress: string,
  pendingNonce: string,
  claimModalShow: boolean
};

@connect(state => ({
  eth: state.base.eth
}))
@Form.create({ name: "claim-rewards" })
class ClaimRewards extends PureComponent<Props, State> {
  state: State = {
    ioAddress: "",
    rewardRau: "",
    ethAddress: "",
    pendingNonce: "",
    claimModalShow: false
  };

  handleAddress = () => {
    this.props.form.validateFields(async (err, value) => {
      if (err) {
        return;
      }
      const { ioAddress } = value;
      const antenna = getAntenna();

      const state = await antenna.iotx.readState({
        protocolID: Buffer.from("rewarding"),
        methodName: Buffer.from("UnclaimedBalance"),
        arguments: [Buffer.from(ioAddress)]
      });
      const rewardRau = new window.TextDecoder("utf-8").decode(state.data);
      const ethAddress = fromString(ioAddress).stringEth();
      const { accountMeta } = await antenna.iotx.getAccount({
        address: ioAddress
      });

      this.setState({
        ioAddress,
        ethAddress,
        pendingNonce: accountMeta.pendingNonce,
        rewardRau
      });
    });
  };
  renderForm = () => {
    const { getFieldDecorator } = this.props.form;
    return (
      <div>
        <Query
          query={GET_BP_CANDIDATES}
          variables={{ address: this.props.eth }}
        >
          {({ data }) => {
            const bpCandidates = (data && data.bpCandidatesOnContract) || [];
            const bpCandidate = bpCandidates[0];
            const ioAddress = bpCandidate && bpCandidate.ioRewardAddr;
            return (
              <Form.Item
                help={t("claim-rewards.io_address.help")}
                label={t("claim-rewards.your_iotex_reward_address")}
              >
                {getFieldDecorator("ioAddress", {
                  initialValue: ioAddress,
                  rules: [
                    {
                      required: true,
                      message: t("claim-rewards.io_address.required")
                    },
                    {
                      validator: validateIoAddress
                    }
                  ]
                })(
                  <Input
                    onPressEnter={this.handleAddress}
                    style={{ width: 400 }}
                    placeholder={t("claim-rewards.io_address.placeholder")}
                  />
                )}
              </Form.Item>
            );
          }}
        </Query>
      </div>
    );
  };

  renderClaimReward = () => {
    const { ioAddress, rewardRau, ethAddress } = this.state;
    const { form } = this.props;
    return (
      <div>
        <Divider orientation="left">{t("claim-reward.query_result")}</Divider>
        <Form.Item label={t("claim-reward.reward_address")}>
          <div>{ioAddress}</div>
        </Form.Item>
        <Form.Item label={t("claim-reward.eth_address")}>
          <div>{ethAddress}</div>
        </Form.Item>
        <Form.Item label={t("claim-reward.available_credits")}>
          <div>{fromRau(rewardRau, "IOTX")} IOTX</div>
        </Form.Item>
        <AmountFormInputItem
          form={form}
          initialValue={fromRau(rewardRau, "IOTX")}
          unit="IOTX"
        />
        <Form.Item>
          <Button
            style={{ marginRight: "10px" }}
            type={"primary"}
            htmlType="submit"
            onClick={() => {
              this.setState({
                claimModalShow: true
              });
            }}
          >
            {t("claim-reward.submit")}
          </Button>
        </Form.Item>
      </div>
    );
  };
  claimModal = () => {
    const { ioAddress } = this.state;
    const code = `ioctl action claim ${this.getCreditsToClaim()} -s ${ioAddress} `;
    return (
      <CodeModal
        show={this.state.claimModalShow}
        code={code}
        onClose={() => this.setState({ claimModalShow: false })}
      />
    );
  };

  getCreditsToClaim() {
    return (this.props.form.getFieldsValue() || {}).amount || 0;
  }

  render() {
    const { ioAddress } = this.state;
    const updateIoctl =
      "curl https://raw.githubusercontent.com/iotexproject/iotex-core/master/install-cli.sh | sh";
    return (
      <div>
        <h1>{t("profile.claim_rewards")}</h1>
        <CommonMargin />
        <IoctlAlert message={t("rewards.tools.update")} code={updateIoctl} />
        <CommonMargin />

        {this.renderForm()}
        <Form>
          {ioAddress && this.renderClaimReward()}
          {this.claimModal()}
        </Form>
      </div>
    );
  }
}

export function AmountFormInputItem({
  form,
  initialValue,
  label,
  min,
  help,
  unit
}: {
  form: any,
  initialValue?: number,
  label?: string,
  min?: number,
  help?: string,
  unit?: string
}) {
  const { getFieldDecorator } = form;
  return (
    <Form.Item label={label || t("claim-reward.amount")} help={help}>
      {getFieldDecorator("amount", {
        initialValue,
        rules: [
          { validator: largerOrEqualTo(min || 0) },
          {
            required: true,
            message: t("claim-reward.amount.error")
          },
          {
            type: "number",
            message: t("claim-reward.amount.error"),
            transform: (value: string) => {
              return Number(value);
            }
          }
        ]
      })(
        <Input
          className="form-input"
          placeholder="1"
          addonAfter={unit}
          name="amount"
        />
      )}
    </Form.Item>
  );
}

export function IoctlAlert({ message, code }: any) {
  return (
    <Alert
      showIcon={true}
      type="info"
      message={message}
      description={
        <div>
          <code>{code}</code>{" "}
          <CopyButtonClipboardComponent text={code} size={"small"} />
        </div>
      }
    />
  );
}

export function CodeModal({
  show,
  code,
  onClose,
  getCode
}: {
  show: boolean,
  code?: string,
  getCode?: Function,
  onClose: Function
}) {
  if (getCode) {
    code = getCode();
  }
  return (
    <Modal
      style={{ top: 100 }}
      title={<b>{t("claim-reards.copy.modal")}</b>}
      visible={show}
      onCancel={() => onClose()}
      footer={null}
    >
      <div
        style={{
          backgroundColor: colors.black10,
          padding: 15
        }}
      >
        <span>{code}</span>{" "}
        <CopyButtonClipboardComponent text={String(code)} size={"default"} />
      </div>
      <div style={{ display: "flex", justifyContent: "center", marginTop: 40 }}>
        <Button size="large" type="primary" onClick={() => onClose()}>
          {t("claim-reward.ok")}
        </Button>
      </div>
    </Modal>
  );
}

export { ClaimRewards };
