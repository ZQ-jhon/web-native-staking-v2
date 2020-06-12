/* tslint:disable:no-any */
// @flow
import { Alert, Button, Form, InputNumber, notification } from "antd";
import { FormInstance } from "antd/lib/form";
// @ts-ignore
import window from "global/window";
import { SpinPreloader } from "iotex-react-block-producers/lib/spin-preloader";
import { t } from "onefx/lib/iso-i18n";
import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { CommonMargin } from "../common/common-margin";
import { getIoPayAddress } from "../common/get-antenna";
import { IopayRequired } from "../common/iopay-required";
import { actionSmartContractCalled } from "../staking/smart-contract-reducer";
import { DelegateProfileContract } from "./delegate-profile-contract";

type Props = {
  contractAddr: string;
  smartContractCalled: boolean;
  actionSmartContractCalled(payload: boolean): void;
};

type State = {
  loading: boolean;
  error: any;
  data: any;
};

// @ts-ignore
@connect(
  state => ({
    contractAddr:
      // @ts-ignore
      state.staking && state.staking.delegateProfileContractAddr,
    smartContractCalled:
      // @ts-ignore
      state.smartContract && state.smartContract.smartContractCalled
  }),
  disptach => ({
    // tslint:disable-next-line:typedef
    actionSmartContractCalled(payload: boolean) {
      disptach(actionSmartContractCalled(payload));
    }
  })
)
// @ts-ignore
@IopayRequired
class RewardDistributionContainer extends PureComponent<Props, State> {
  formRef: React.RefObject<FormInstance> = React.createRef<FormInstance>();
  contract: DelegateProfileContract;

  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true,
      error: undefined,
      data: undefined
    };
    this.contract = new DelegateProfileContract({
      contractAddress: props.contractAddr
    });
  }

  // tslint:disable-next-line:no-any
  onSubmit = async (e: any) => {
    e.preventDefault();
    this.setState({ loading: true });
    const { actionSmartContractCalled } = this.props;
    if (!this.formRef.current) {
      return;
    }
    const values = await this.formRef.current.validateFields();
    window.console.log(`reward distribution values`, values);
    try {
      const address = await getIoPayAddress();
      const tx = await this.contract.updateProfile({
        foundationRewardPortion: values.foundationRewardPortion,
        epochRewardPortion: values.epochRewardPortion,
        blockRewardPortion: values.blockRewardPortion,
        address
      });
      window.console.log(`reward distribution tx`, tx);
      actionSmartContractCalled(true);
    } catch (e) {
      const message = t("profile.reward-distribution.error");
      notification.error({ message });
      window.console.log(`Failed to update reward distribution`, e);
    }
    this.setState({ loading: false });
  };

  async componentDidMount(): Promise<void> {
    const { smartContractCalled, actionSmartContractCalled } = this.props;

    if (smartContractCalled) {
      window.setTimeout(() => actionSmartContractCalled(false), 5 * 60 * 1000);
    }

    try {
      const address = await getIoPayAddress();
      const [
        foundationRewardPortion,
        epochRewardPortion,
        blockRewardPortion
      ] = await Promise.all([
        // this.contract.getProfiles(address),
        this.contract.getProfileByField("foundationRewardPortion", address),
        this.contract.getProfileByField("epochRewardPortion", address),
        this.contract.getProfileByField("blockRewardPortion", address)
      ]);
      const data = {
        foundationRewardPortion: foundationRewardPortion.value,
        epochRewardPortion: epochRewardPortion.value,
        blockRewardPortion: blockRewardPortion.value
      };
      window.console.log("data", data);
      this.setState({
        loading: false,
        error: undefined,
        data
      });
    } catch (e) {
      window.console.error("error when getProfiles", e);
      this.setState({
        loading: false,
        error: "error when getProfiles",
        data: undefined
      });
    }
  }

  // tslint:disable-next-line:max-func-body-length
  getInnerComponent({ loading, error, data }: State): JSX.Element {
    if (error && !loading) {
      return (
        <Alert message={"error when load data"} type="error" showIcon={true} />
      );
    }
    const distributions = data || {};

    return (
      <SpinPreloader spinning={loading}>
        {
          // @ts-ignore
          <Form
            ref={this.formRef}
            name={"reward-distribution"}
            style={{ padding: "1em" }}
            layout={"vertical"}
          >
            <h1>{t("profile.reward-distribution")}</h1>
            {
              // @ts-ignore
              <Form.Item
                label={t("profile.block_reward_portion")}
                name="blockRewardPortion"
                initialValue={distributions.blockRewardPortion}
                rules={[
                  {
                    required: true,
                    message: t("profile.block_reward_portion.required")
                  }
                ]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  precision={2}
                  formatter={value => `${value} %`}
                />
              </Form.Item>
            }
            {
              // @ts-ignore
              <Form.Item
                label={t("profile.epoch_reward_portion")}
                name="epochRewardPortion"
                initialValue={distributions.epochRewardPortion}
                rules={[
                  {
                    required: true,
                    message: t("profile.epoch_reward_portion.required")
                  }
                ]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  precision={2}
                  formatter={value => `${value} %`}
                />
              </Form.Item>
            }
            {
              // @ts-ignore
              <Form.Item
                label={t("profile.foundation_reward_portion")}
                name="foundationRewardPortion"
                initialValue={distributions.foundationRewardPortion}
                rules={[
                  {
                    required: true,
                    message: t("profile.foundation_reward_portion.required")
                  }
                ]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  precision={2}
                  formatter={value => `${value} %`}
                />
              </Form.Item>
            }

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                style={{ marginRight: "10px" }}
                loading={this.state.loading}
                onClick={this.onSubmit}
                disabled={loading || error}
              >
                {t("profile.update-reward-distribution")}
              </Button>
            </Form.Item>
          </Form>
        }
      </SpinPreloader>
    );
  }

  // tslint:disable-next-line:max-func-body-length
  render(): JSX.Element {
    const { smartContractCalled } = this.props;

    return (
      <div>
        {smartContractCalled && (
          <div>
            <Alert
              message={t("contract.called")}
              type="success"
              showIcon={true}
            />
            <CommonMargin />
          </div>
        )}
        {this.getInnerComponent(this.state)}
      </div>
    );
  }
}

export { RewardDistributionContainer };
