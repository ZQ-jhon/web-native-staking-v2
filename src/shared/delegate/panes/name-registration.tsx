/* tslint:disable:use-simple-attributes react-a11y-anchors */
// @flow
// $FlowFixMe
import Alert from "antd/lib/alert";
import Button from "antd/lib/button";
import Form from "antd/lib/form";
import { FormInstance } from "antd/lib/form";
import Input from "antd/lib/input";
import InputNumber from "antd/lib/input-number";
import notification from "antd/lib/notification";
import Switch from "antd/lib/switch";
// @ts-ignore
import window from "global/window";
import { toRau } from "iotex-antenna/lib/account/utils";
import {
  CandidateRegister,
  CandidateUpdate,
} from "iotex-antenna/lib/action/types";
import { t } from "onefx/lib/iso-i18n";
import React, { FormEvent, PureComponent, RefObject } from "react";
import { connect } from "react-redux";
import { getStaking } from "../../../server/gateway/staking";
import { ownersToNames } from "../../common/apollo-client";
import { CommonMargin } from "../../common/common-margin";
import { formItemLayout } from "../../common/form-item-layout";
import { getAntenna } from "../../common/get-antenna";
import { IopayRequired } from "../../common/iopay-required";
import { DEFAULT_STAKING_GAS_LIMIT } from "../../common/token-utils";
import {
  getStakeDurationMaxValue,
  smallerOrEqualTo,
  validateCanName,
  validateIoAddress,
  validateStakeDuration,
} from "../../staking/field-validators";
import { actionSmartContractCalled } from "../../staking/smart-contract-reducer";

export const min = 1200000;
export const max = 1000000000000000000000;

type Props = {
  smartContractCalled: boolean;
  actionSmartContractCalled(payload: boolean): void;
  addr: string;
  tokenContractAddr?: string;
};

type State = {
  isUpdating: boolean;
  candName?: string;
  isFetchingUpdatingInfo: boolean;
  disabled: boolean;
};

const NameRegistrationContainer = IopayRequired(
  connect(
    (state: { smartContract: { smartContractCalled: boolean } }) => {
      return {
        smartContractCalled:
          state.smartContract && state.smartContract.smartContractCalled,
      };
    },
    (disptach) => ({
      actionSmartContractCalled(payload: boolean): void {
        disptach(actionSmartContractCalled(payload));
      },
    })
  )(
    class NameRegistration extends PureComponent<Props, State> {
      constructor(props: Props) {
        super(props);
        const candName = ownersToNames[getAntenna().iotx.accounts[0].address];
        this.state = {
          candName,
          isUpdating: Boolean(candName),
          isFetchingUpdatingInfo: true,
          disabled: true,
        };
      }

      registerFormRef: RefObject<FormInstance> = React.createRef<
        FormInstance
      >();
      updateFormRef: RefObject<FormInstance> = React.createRef<FormInstance>();

      onRegister = async (e: FormEvent) => {
        const { actionSmartContractCalled } = this.props;
        e.preventDefault();
        const form = this.registerFormRef.current;
        if (!form) {
          return;
        }
        let values;
        try {
          values = (await form.validateFields()) as CandidateRegister;
          window.console.log("values", values);
        } catch (err) {
          window.console.error(
            "failed to validateFields for name-registration",
            err
          );
          return;
        }

        try {
          await getStaking().registerCandidate({
            ...values,
            stakedAmount: toRau(values.stakedAmount, "Iotx"),
            gasLimit: DEFAULT_STAKING_GAS_LIMIT,
            gasPrice: toRau("1", "Qev"),
          });
          actionSmartContractCalled(true);
          notification.success({
            message: t("name_registration.submit.success_tip"),
          });
        } catch (error) {
          notification.error({
            message: `failed to register: ${error}`,
          });
        }
      };

      onUpdate = async (e: FormEvent) => {
        const { actionSmartContractCalled } = this.props;
        e.preventDefault();
        const form = this.updateFormRef.current;
        if (!form) {
          return;
        }
        let values;
        try {
          values = (await form.validateFields()) as CandidateUpdate;
          window.console.log("values", values);
        } catch (err) {
          window.console.error(
            "failed to validateFields for name-registration",
            err
          );
          return;
        }

        try {
          await getStaking().updateCandidate({
            ...values,
            gasLimit: DEFAULT_STAKING_GAS_LIMIT,
            gasPrice: toRau("1", "Qev"),
          });
          actionSmartContractCalled(true);
          notification.success({
            message: t("name_registration.submit.success_tip"),
          });
        } catch (error) {
          notification.error({
            message: `failed to register: ${error}`,
          });
        }
      };

      handleChange = () => {
        const { isUpdating } = this.state;
        const form = isUpdating
          ? this.updateFormRef.current
          : this.registerFormRef.current;
        this.setState({ disabled: false });
        const errors = form && form.getFieldsError();
        if (!!errors) {
          errors.map((err) => {
            if (!!err.errors.length) {
              this.setState({ disabled: true });
            }
          });
        }
      };

      async componentDidMount(): Promise<void> {
        const { isUpdating, isFetchingUpdatingInfo, candName } = this.state;
        if (isUpdating && isFetchingUpdatingInfo && candName) {
          const resp = await getStaking().getCandidate(candName);
          if (resp) {
            this.setState({
              isFetchingUpdatingInfo: false,
            });
            const form = this.updateFormRef.current;
            if (!form) {
              return;
            }
            form.setFields([
              {
                name: "operatorAddress",
                // @ts-ignore
                value: resp.operatorAddress,
              },
              {
                name: "rewardAddress",
                // @ts-ignore
                value: resp.rewardAddress,
              },
            ]);
          }
        }
      }

      // tslint:disable-next-line:max-func-body-length
      renderUpdatingForm = (): JSX.Element => {
        const { smartContractCalled } = this.props;
        const { candName } = this.state;
        return (
          // @ts-ignore
          <Form
            onSubmit={this.onUpdate}
            onFieldsChange={this.handleChange}
            ref={this.updateFormRef}
          >
            <h1>{t("profile.register_name")}</h1>
            <CommonMargin />
            {smartContractCalled && (
              <div>
                <Alert
                  message={t("contract.called")}
                  type="success"
                  showIcon={true}
                  closable={true}
                />
              </div>
            )}
            <CommonMargin />
            <div>
              {/*
                // @ts-ignore */}
              <Form.Item
                {...formItemLayout}
                label={
                  <label style={{ whiteSpace: "break-spaces" }}>
                    {t("name_regsitration.name")}
                  </label>
                }
                labelAlign={"left"}
                name={"name"}
                initialValue={candName}
                rules={[
                  {
                    required: true,
                    message: t("name_regsitration.name.required"),
                  },
                  {
                    validator: validateCanName,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              {/*
                // @ts-ignore */}
              <Form.Item
                {...formItemLayout}
                label={t("name_regsitration.owner")}
                labelAlign={"left"}
                name={"ownerAddress"}
                initialValue={getAntenna().iotx.accounts[0].address}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input disabled={true} />
              </Form.Item>
              {/*
                // @ts-ignore */}
              <Form.Item
                {...formItemLayout}
                style={{ marginBottom: "3px" }}
                label={t("name_regsitration.operator_pub_key")}
                labelAlign={"left"}
                name={"operatorAddress"}
                rules={[
                  {
                    required: true,
                  },
                  {
                    message: t("name_regsitration.operator_pub_key.required"),
                  },
                  {
                    validator: validateIoAddress,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              {/*
                // @ts-ignore */}
              <Form.Item {...formItemLayout} label={<span />}>
                <Alert
                  message={t("profile.op-address.set_warning")}
                  type="warning"
                  showIcon={true}
                  banner={true}
                />
              </Form.Item>
              {/*
                // @ts-ignore */}
              <Form.Item
                {...formItemLayout}
                style={{ marginBottom: "3px" }}
                labelAlign={"left"}
                label={t("name_regsitration.reward_pub_key")}
                name={"rewardAddress"}
                rules={[
                  {
                    required: true,
                  },
                  {
                    message: t("name_regsitration.reward_pub_key.required"),
                  },
                  {
                    validator: validateIoAddress,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              {/*
                // @ts-ignore */}
              <Form.Item {...formItemLayout} label={<span />}>
                <Alert
                  message={t("profile.reward-address.set_warning")}
                  type="warning"
                  showIcon={true}
                  banner={true}
                />
              </Form.Item>
              <Alert
                message={
                  // tslint:disable-next-line:react-no-dangerous-html
                  <span
                    dangerouslySetInnerHTML={{
                      __html: t("profile.update-candidate.other-fields", {
                        href: "/my-votes",
                        text: "my-votes",
                      }),
                    }}
                  />
                }
                type="info"
                showIcon={true}
                banner={true}
              />
              <CommonMargin />
              <Form.Item>
                <Button
                  style={{ marginRight: "10px" }}
                  type={"primary"}
                  htmlType="submit"
                  onClick={this.onUpdate}
                  disabled={this.state.disabled}
                >
                  {t("name_registration.update")}
                </Button>
              </Form.Item>
            </div>
          </Form>
        );
      };

      // tslint:disable-next-line:max-func-body-length
      renderRegisterForm = (): JSX.Element => {
        const { smartContractCalled } = this.props;
        return (
          // @ts-ignore
          <Form
            onSubmit={this.onRegister}
            ref={this.registerFormRef}
            onFieldsChange={this.handleChange}
          >
            <h1>{t("profile.register_name")}</h1>
            <CommonMargin />
            {smartContractCalled && (
              <div>
                <Alert
                  message={t("contract.called")}
                  type="success"
                  showIcon={true}
                  closable={true}
                />
              </div>
            )}
            <CommonMargin />
            <div className="site-layout-content">
              {/*
                // @ts-ignore */}
              <Form.Item
                {...formItemLayout}
                labelAlign={"left"}
                label={
                  <label style={{ whiteSpace: "break-spaces" }}>
                    {t("name_regsitration.name")}
                  </label>
                }
                name={"name"}
                rules={[
                  {
                    required: true,
                    message: t("name_regsitration.name.required"),
                  },
                  {
                    validator: validateCanName,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              {/*
                // @ts-ignore */}
              <Form.Item
                {...formItemLayout}
                labelAlign={"left"}
                label={t("name_regsitration.stakedAmount")}
                name={"stakedAmount"}
                rules={[
                  {
                    required: true,
                    // @ts-ignore
                    message: t("my_stake.stakedAmount.min", { min }),
                  },
                  {
                    validator: smallerOrEqualTo(max, min),
                  },
                ]}
              >
                <InputNumber min={min} />
              </Form.Item>
              {/*
                // @ts-ignore */}
              <Form.Item
                {...formItemLayout}
                labelAlign={"left"}
                label={t("name_regsitration.stakedDuration")}
                name={"stakedDuration"}
                rules={[
                  {
                    required: true,
                    message: t("my_stake.stakeDuration.required"),
                  },
                  {
                    validator: validateStakeDuration(
                      getStakeDurationMaxValue(),
                      0
                    ),
                  },
                ]}
              >
                <InputNumber />
              </Form.Item>
              {/*
                // @ts-ignore */}
              <Form.Item
                {...formItemLayout}
                labelAlign={"left"}
                label={t("name_regsitration.autoStake")}
                name={"autoStake"}
                initialValue={false}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Switch />
              </Form.Item>
            </div>
            <div className="site-layout-content">
              {/*
                // @ts-ignore */}
              <Form.Item
                {...formItemLayout}
                labelAlign={"left"}
                label={t("name_regsitration.owner")}
                name={"ownerAddress"}
                initialValue={getAntenna().iotx.accounts[0].address}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input disabled={true} />
              </Form.Item>
              {/*
                // @ts-ignore */}
              <Form.Item
                {...formItemLayout}
                style={{ marginBottom: "3px" }}
                labelAlign={"left"}
                label={t("name_regsitration.operator_pub_key")}
                name={"operatorAddress"}
                rules={[
                  {
                    required: true,
                    message: t("name_regsitration.operator_pub_key.required"),
                  },
                  {
                    validator: validateIoAddress,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              {/*
                // @ts-ignore */}
              <Form.Item {...formItemLayout} label={<span />}>
                <Alert
                  message={t("profile.op-address.unset_warning")}
                  type="warning"
                  showIcon={true}
                  banner={true}
                />
              </Form.Item>

              {/*
                // @ts-ignore */}
              <Form.Item
                {...formItemLayout}
                labelAlign={"left"}
                style={{ marginBottom: "3px" }}
                label={t("name_regsitration.reward_pub_key")}
                name={"rewardAddress"}
                rules={[
                  {
                    required: true,
                    message: t("name_regsitration.reward_pub_key.required"),
                  },
                  {
                    validator: validateIoAddress,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              {/*
                // @ts-ignore */}
              <Form.Item {...formItemLayout} label={<span />}>
                <Alert
                  message={t("profile.reward-address.unset_warning")}
                  type="warning"
                  showIcon={true}
                  banner={true}
                />
              </Form.Item>
              <Form.Item>
                <Button
                  style={{ marginRight: "10px" }}
                  type={"primary"}
                  htmlType="submit"
                  onClick={this.onRegister}
                  disabled={this.state.disabled}
                >
                  {t("name_registration.register")}
                </Button>
              </Form.Item>
            </div>
          </Form>
        );
      };

      // tslint:disable-next-line:max-func-body-length
      render(): JSX.Element {
        const { isUpdating } = this.state;

        if (isUpdating) {
          return this.renderUpdatingForm();
        }
        return this.renderRegisterForm();
      }
    }
  )
);

export { NameRegistrationContainer };
