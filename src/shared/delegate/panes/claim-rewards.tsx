import Alert from "antd/lib/alert";
import Button from "antd/lib/button";
import Divider from "antd/lib/divider";
import { FormInstance } from "antd/lib/form";
import Form from "antd/lib/form";
import Input from "antd/lib/input";
import Modal from "antd/lib/modal";
import { Buffer } from "buffer";
// @ts-ignore
import window from "global/window";
import gql from "graphql-tag";
import { fromRau } from "iotex-antenna/lib/account/utils";
import { fromString } from "iotex-antenna/lib/crypto/address";
import { t } from "onefx/lib/iso-i18n";
import { RouteComponentProps } from "onefx/lib/react-router";
import React, { RefObject } from "react";
import { PureComponent } from "react";
import { Query, QueryResult } from "react-apollo";
import { connect } from "react-redux";
import { CommonMargin } from "../../common/common-margin";
import { CopyButtonClipboardComponent } from "../../common/copy-button-clipboard";
import { getAntenna } from "../../common/get-antenna";
import { colors } from "../../common/styles/style-color2";
import {
  largerOrEqualTo,
  validateIoAddress,
} from "../../staking/field-validators";

export const GET_BP_CANDIDATES = gql`
  query bpCandidatesOnContract($address: String) {
    bpCandidatesOnContract(address: $address) {
      ioRewardAddr
    }
  }
`;

type Props = {
  eth: string;
} & RouteComponentProps;

type State = {
  ioAddress: string;
  rewardRau: string;
  ethAddress: string;
  pendingNonce: string;
  claimModalShow: boolean;
};

const ClaimRewardsContainer = connect((state: { base: { eth: string } }) => ({
  eth: state.base.eth,
}))(
  class ClaimRewards extends PureComponent<Props, State> {
    formRef: RefObject<FormInstance> = React.createRef<FormInstance>();

    constructor(props: Props) {
      super(props);
      this.state = {
        ioAddress: "",
        rewardRau: "",
        ethAddress: "",
        pendingNonce: "",
        claimModalShow: false,
      };
    }

    handleAddress = () => {
      const form = this.formRef.current;
      if (!form) {
        return;
      }
      form.validateFields().then(async (values) => {
        const { ioAddress } = values;
        const antenna = getAntenna();

        // @ts-ignore
        const state = await antenna.iotx.readState({
          protocolID: Buffer.from("rewarding"),
          methodName: Buffer.from("UnclaimedBalance"),
          arguments: [Buffer.from(ioAddress)],
        });
        const rewardRau = new window.TextDecoder("utf-8").decode(state.data);
        const ethAddress = fromString(ioAddress).stringEth();
        const { accountMeta } = await antenna.iotx.getAccount({
          address: ioAddress,
        });

        // @ts-ignore
        this.setState({
          ioAddress,
          ethAddress,
          pendingNonce: accountMeta ? accountMeta.pendingNonce : "",
          rewardRau,
        });
      });
    };
    renderForm = () => {
      return (
        <div>
          <Query
            query={GET_BP_CANDIDATES}
            variables={{ address: this.props.eth }}
          >
            {({ data }: QueryResult) => {
              const bpCandidates = (data && data.bpCandidatesOnContract) || [];
              const bpCandidate = bpCandidates[0];
              const ioAddress = bpCandidate && bpCandidate.ioRewardAddr;
              return (
                // @ts-ignore
                <Form.Item
                  help={t("claim-rewards.io_address.help")}
                  label={t("claim-rewards.your_iotex_reward_address")}
                  name={"ioAddress"}
                  initialValue={ioAddress}
                  rules={[
                    {
                      required: true,
                      message: t("claim-rewards.io_address.required"),
                    },
                    {
                      validator: validateIoAddress,
                    },
                  ]}
                >
                  <Input
                    onPressEnter={this.handleAddress}
                    style={{ width: 400 }}
                    placeholder={t("claim-rewards.io_address.placeholder")}
                  />
                </Form.Item>
              );
            }}
          </Query>
        </div>
      );
    };

    renderClaimReward = () => {
      const { ioAddress, rewardRau, ethAddress } = this.state;
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
            initialValue={Number(fromRau(rewardRau, "IOTX"))}
            unit="IOTX"
          />
          <Form.Item>
            <Button
              style={{ marginRight: "10px" }}
              type={"primary"}
              htmlType="submit"
              onClick={() => {
                this.setState({
                  claimModalShow: true,
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

    getCreditsToClaim(): string | number {
      return (
        ((this.formRef.current && this.formRef.current.getFieldsValue()) || {})
          .amount || 0
      );
    }

    render(): JSX.Element {
      const { ioAddress } = this.state;
      const updateIoctl =
        "curl https://raw.githubusercontent.com/iotexproject/iotex-core/master/install-cli.sh | sh";
      return (
        <div>
          <h1>{t("profile.claim_rewards")}</h1>
          <CommonMargin />
          <IoctlAlert message={t("rewards.tools.update")} code={updateIoctl} />
          <CommonMargin />
          {
            // @ts-ignore
            <Form ref={this.formRef}>
              {this.renderForm()}
              {ioAddress && this.renderClaimReward()}
              {this.claimModal()}
            </Form>
          }
        </div>
      );
    }
  }
);

export function AmountFormInputItem({
  initialValue,
  label,
  min,
  help,
  unit,
}: {
  initialValue?: number;
  label?: string;
  min?: number;
  help?: string;
  unit?: string;
}): JSX.Element {
  return (
    // @ts-ignore
    // tslint:disable-next-line:use-simple-attributes
    <Form.Item
      label={label || t("claim-reward.amount")}
      help={help}
      name={"amount"}
      initialValue={initialValue}
      rules={[
        { validator: largerOrEqualTo(min || 0) },
        {
          required: true,
          message: t("claim-reward.amount.error"),
        },
        {
          type: "number",
          message: t("claim-reward.amount.error"),
          transform: (value: string) => {
            return Number(value);
          },
        },
      ]}
    >
      <Input
        className="form-input"
        placeholder="1"
        addonAfter={unit}
        name="amount"
      />
    </Form.Item>
  );
}

export function IoctlAlert({
  message,
  code,
}: {
  message: string;
  code: string;
}): JSX.Element {
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
  getCode,
}: {
  show: boolean;
  code?: string;
  getCode?: Function;
  onClose: Function;
}): JSX.Element {
  let lCode = code;
  if (getCode) {
    lCode = getCode();
  }
  return (
    <Modal
      style={{ top: 100 }}
      title={<b>{t("claim-reards.copy.modal")}</b>}
      visible={show}
      onCancel={(_) => onClose()}
      footer={null}
    >
      <div
        style={{
          backgroundColor: colors.black10,
          padding: 15,
        }}
      >
        <span>{lCode}</span>{" "}
        <CopyButtonClipboardComponent text={String(lCode)} size={"middle"} />
      </div>
      <div style={{ display: "flex", justifyContent: "center", marginTop: 40 }}>
        <Button size="large" type="primary" onClick={(_) => onClose()}>
          {t("claim-reward.ok")}
        </Button>
      </div>
    </Modal>
  );
}

export { ClaimRewardsContainer };
