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
  CandidateUpdate
} from "iotex-antenna/lib/action/types";
import { t } from "onefx/lib/iso-i18n";
import React, { FormEvent, PureComponent, RefObject } from "react";
import { connect } from "react-redux";
import { getStaking } from "../../../server/gateway/staking";
import { ownersToNames } from "../../common/apollo-client";
import { CommonMargin } from "../../common/common-margin";
import { getAntenna } from "../../common/get-antenna";
import { IopayRequired } from "../../common/iopay-required";
import { DEFAULT_STAKING_GAS_LIMIT } from "../../common/token-utils";
import {
  validateCanName,
  validateIoAddress
} from "../../staking/field-validators";
import { actionSmartContractCalled } from "../../staking/smart-contract-reducer";

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
          state.smartContract && state.smartContract.smartContractCalled
      };
    },
    disptach => ({
      actionSmartContractCalled(payload: boolean): void {
        disptach(actionSmartContractCalled(payload));
      }
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
          disabled: false
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
            gasPrice: toRau("1", "Qev")
          });
          actionSmartContractCalled(true);
          notification.success({
            message: t("name_registration.submit.success_tip")
          });
        } catch (error) {
          notification.error({
            message: `failed to register: ${error}`
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
            gasPrice: toRau("1", "Qev")
          });
          actionSmartContractCalled(true);
          notification.success({
            message: t("name_registration.submit.success_tip")
          });
        } catch (error) {
          notification.error({
            message: `failed to register: ${error}`
          });
        }
      };

      handleChange = () => {
        const form = this.updateFormRef.current;
        this.setState({ disabled: false });
        const errors = form && form.getFieldsError();
        if (!!errors) {
          errors.map(err => {
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
              isFetchingUpdatingInfo: false
            });
            const form = this.updateFormRef.current;
            if (!form) {
              return;
            }
            form.setFields([
              {
                name: "operatorAddress",
                // @ts-ignore
                value: resp.operatorAddress
              },
              {
                name: "rewardAddress",
                // @ts-ignore
                value: resp.rewardAddress
              }
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
                label={t("name_regsitration.name")}
                name={"name"}
                initialValue={candName}
                rules={[
                  {
                    required: true,
                    message: t("name_regsitration.name.required")
                  },
                  {
                    validator: validateCanName
                  }
                ]}
              >
                <Input />
              </Form.Item>
              {/*
                // @ts-ignore */}
              <Form.Item
                label={t("name_regsitration.owner")}
                name={"ownerAddress"}
                initialValue={getAntenna().iotx.accounts[0].address}
                rules={[
                  {
                    required: true
                  }
                ]}
              >
                <Input disabled={true} />
              </Form.Item>
              {/*
                // @ts-ignore */}
              <Form.Item
                label={t("name_regsitration.operator_pub_key")}
                name={"operatorAddress"}
                rules={[
                  {
                    required: true
                  },
                  {
                    message: t("name_regsitration.operator_pub_key.required")
                  },
                  {
                    validator: validateIoAddress
                  }
                ]}
              >
                <Input />
              </Form.Item>
              {/*
                // @ts-ignore */}
              <Form.Item
                label={t("name_regsitration.reward_pub_key")}
                name={"rewardAddress"}
                rules={[
                  {
                    required: true
                  },
                  {
                    message: t("name_regsitration.reward_pub_key.required")
                  },
                  {
                    validator: validateIoAddress
                  }
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item>
                <Button
                  style={{ marginRight: "10px" }}
                  type={"primary"}
                  htmlType="submit"
                  onClick={this.onUpdate}
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
      renderRegisterForm = (): JSX.Element => {
        const { smartContractCalled } = this.props;
        return (
          // @ts-ignore
          <Form onSubmit={this.onRegister} ref={this.registerFormRef}>
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
                label={t("name_regsitration.name")}
                name={"name"}
                rules={[
                  {
                    required: true,
                    message: t("name_regsitration.name.required")
                  },
                  {
                    validator: validateCanName
                  }
                ]}
              >
                <Input />
              </Form.Item>
              {/*
                // @ts-ignore */}
              <Form.Item
                label={t("name_regsitration.owner")}
                name={"ownerAddress"}
                initialValue={getAntenna().iotx.accounts[0].address}
                rules={[
                  {
                    required: true
                  }
                ]}
              >
                <Input disabled={true} />
              </Form.Item>
              {/*
                // @ts-ignore */}
              <Form.Item
                label={t("name_regsitration.operator_pub_key")}
                name={"operatorAddress"}
                rules={[
                  {
                    required: true
                  },
                  {
                    message: t("name_regsitration.operator_pub_key.required")
                  },
                  {
                    validator: validateIoAddress
                  }
                ]}
              >
                <Input />
              </Form.Item>
              {/*
                // @ts-ignore */}
              <Form.Item
                label={t("name_regsitration.reward_pub_key")}
                name={"rewardAddress"}
                rules={[
                  {
                    required: true
                  },
                  {
                    message: t("name_regsitration.reward_pub_key.required")
                  },
                  {
                    validator: validateIoAddress
                  }
                ]}
              >
                <Input />
              </Form.Item>

              {/*
                // @ts-ignore */}
              <Form.Item
                label={t("name_regsitration.stakedAmount")}
                name={"stakedAmount"}
                rules={[
                  {
                    required: true
                  }
                ]}
              >
                <InputNumber />
              </Form.Item>
              {/*
                // @ts-ignore */}
              <Form.Item
                label={t("name_regsitration.stakedDuration")}
                name={"stakedDuration"}
                rules={[
                  {
                    required: true
                  }
                ]}
              >
                <InputNumber />
              </Form.Item>
              {/*
                // @ts-ignore */}
              <Form.Item
                label={t("name_regsitration.autoStake")}
                name={"autoStake"}
                rules={[
                  {
                    required: true
                  }
                ]}
              >
                <Switch />
              </Form.Item>

              <Form.Item>
                <Button
                  style={{ marginRight: "10px" }}
                  type={"primary"}
                  htmlType="submit"
                  onClick={this.onRegister}
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
