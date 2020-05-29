// @flow
import EthContract from "ethjs-contract";
import window from "global/window";
import React, { PureComponent } from "react";
import { Query } from "react-apollo";
import { connect } from "react-redux";
import { t } from "onefx/lib/iso-i18n";
import Web3Utils from "web3-utils";
// $FlowFixMe
import { Alert, Button, Form, InputNumber, notification } from "antd";
import { MetamaskRequired } from "../smart-contract/metamask-required";
import Eth from "../common/ethjs-query";
import { DELEGATE_PROFILE_ABI } from "../smart-contract/delegate-profile-abi";
import { CommonMargin } from "../common/common-margin";
import { actionSmartContractCalled } from "../smart-contract/smart-contract-reducer";
import { GET_BP_CANDIDATE_REWARD_DISTRIBUTION } from "../smart-contract/smart-contract-gql-queries";
import { enableEthereum } from "../common/enable-ethereum";
import { SpinPreloader } from "../common/spin-preloader";

type Props = {
  contractAddr: string,
  form: any,
  eth?: string,
  smartContractCalled: boolean,
  actionSmartContractCalled: (payload: boolean) => void
};

type State = {
  loading: boolean
};

function castToUint16Hex(value: any): string {
  const hex = Web3Utils.numberToHex(value).replace("0x", "");
  if (hex.length > 4) {
    throw new Error(`Invalid uint16 value: ${value}`);
  }
  return "0".repeat(4 - hex.length) + hex;
}

function prependLength(hex: string): string {
  hex = hex.replace("0x", "");
  const len = Web3Utils.numberToHex(hex.length / 2).replace("0x", "");
  return "0".repeat(64 - len.length) + len + hex;
}

@connect(
  state => ({
    contractAddr: state.smartContract.delegateProfileContractAddr,
    smartContractCalled:
      state.smartContract && state.smartContract.smartContractCalled
  }),
  disptach => ({
    actionSmartContractCalled(payload: boolean) {
      disptach(actionSmartContractCalled(payload));
    }
  })
)
@MetamaskRequired
@Form.create({ name: "reward-distribution" })
class RewardDistributionContainer extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false
    };
  }

  format = (key: string, value: number) => {
    return (
      prependLength(Web3Utils.utf8ToHex(key)) +
      prependLength(castToUint16Hex(value))
    );
  };

  onSubmit = (e: any) => {
    e.preventDefault();
    this.setState({ loading: true });
    const { contractAddr, actionSmartContractCalled } = this.props;

    this.props.form.validateFields(async (err, values) => {
      if (err) {
        window.console.error(`failed to validate fields ${err}`);
        return;
      }
      try {
        const eth = new Eth(window.web3.currentProvider);
        const addr = window.web3.eth.accounts[0];
        const contract = new EthContract(eth)(DELEGATE_PROFILE_ABI).at(
          contractAddr
        );

        await enableEthereum();

        const tx = await contract.updateProfileWithByteCode(
          "0x" +
            this.format(
              "foundationRewardPortion",
              Math.round(values.foundationRewardPortion * 100)
            ) +
            this.format(
              "epochRewardPortion",
              Math.round(values.epochRewardPortion * 100)
            ) +
            this.format(
              "blockRewardPortion",
              Math.round(values.blockRewardPortion * 100)
            ),
          { from: addr }
        );
        window.console.log(`reward distribution values ${values} => ${tx}`);
        notification.success({
          message: t("profile.reward-distribution.confirming")
        });
        actionSmartContractCalled(true);
      } catch (e) {
        const message =
          e && e.value && e.value.code === -32603
            ? t("profile.reward-distribution.reject")
            : t("profile.reward-distribution.error");
        notification.error({ message });
        window.console.log(`Failed to update reward distribution. ${e}`);
      }
    });
    this.setState({ loading: false });
  };

  componentDidMount() {
    const { smartContractCalled, actionSmartContractCalled } = this.props;

    if (smartContractCalled) {
      window.setTimeout(() => actionSmartContractCalled(false), 5 * 60 * 1000);
    }
  }

  render() {
    const { form, smartContractCalled } = this.props;

    const { getFieldDecorator } = form;
    const request = { eth: this.props.eth || "" };
    return (
      <div>
        {smartContractCalled && (
          <div>
            <Alert message={t("contract.called")} type="success" showIcon />
            <CommonMargin />
          </div>
        )}
        <Query
          ssr={false}
          query={GET_BP_CANDIDATE_REWARD_DISTRIBUTION}
          variables={request}
        >
          {({ loading, error, data }) => {
            if (error && !loading) {
              notification.error({
                message: "Error",
                description: error.message,
                duration: 3
              });
              return "error when load data";
            }
            const distributions =
              (data && data.bpCandidateRewardDistribution) || {};

            return (
              <SpinPreloader spinning={loading}>
                <Form onSubmit={this.onSubmit} style={{ padding: "1em" }}>
                  <h1>{t("profile.reward-distribution")}</h1>

                  <Form.Item label={t("profile.block_reward_portion")}>
                    {getFieldDecorator("blockRewardPortion", {
                      initialValue: distributions.blockRewardPortion,
                      rules: [
                        {
                          required: true,
                          message: t("profile.block_reward_portion.required")
                        }
                      ]
                    })(
                      <InputNumber
                        min={0}
                        max={100}
                        precision={2}
                        formatter={value => `${value} %`}
                      />
                    )}
                  </Form.Item>
                  <Form.Item label={t("profile.epoch_reward_portion")}>
                    {getFieldDecorator("epochRewardPortion", {
                      initialValue: distributions.epochRewardPortion,
                      rules: [
                        {
                          required: true,
                          message: t("profile.epoch_reward_portion.required")
                        }
                      ]
                    })(
                      <InputNumber
                        min={0}
                        max={100}
                        precision={2}
                        formatter={value => `${value} %`}
                      />
                    )}
                  </Form.Item>
                  <Form.Item label={t("profile.foundation_reward_portion")}>
                    {getFieldDecorator("foundationRewardPortion", {
                      initialValue: distributions.foundationRewardPortion,
                      rules: [
                        {
                          required: true,
                          message: t(
                            "profile.foundation_reward_portion.required"
                          )
                        }
                      ]
                    })(
                      <InputNumber
                        min={0}
                        max={100}
                        precision={2}
                        formatter={value => `${value} %`}
                      />
                    )}
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      style={{ marginRight: "10px" }}
                      loading={this.state.loading}
                      onClick={this.onSubmit}
                    >
                      {t("profile.update-reward-distribution")}
                    </Button>
                  </Form.Item>
                </Form>
              </SpinPreloader>
            );
          }}
        </Query>
      </div>
    );
  }
}

export { RewardDistributionContainer };
