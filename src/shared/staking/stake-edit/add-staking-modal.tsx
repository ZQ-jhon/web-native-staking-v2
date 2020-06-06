// @flow
import { Form, Input, InputNumber } from "antd";
import { FormInstance } from "antd/lib/form";
import BigNumber from "bignumber.js";
import { toRau } from "iotex-antenna/lib/account/utils";
import { t } from "onefx/lib/iso-i18n";
import React, { Component, RefObject } from "react";
import { connect } from "react-redux";
import { getStaking } from "../../../server/gateway/staking";
import { CommonMarginBottomStyle } from "../../common/common-margin";
import { Flex } from "../../common/flex";
import { formItemLayout } from "../../common/form-item-layout";
import { getIoPayAddress, getIotxBalance } from "../../common/get-antenna";
import { colors } from "../../common/styles/style-color2";
import { DEFAULT_STAKING_GAS_LIMIT } from "../../common/token-utils";
import { smallerOrEqualTo } from "../field-validators";
import { actionSmartContractCalled } from "../smart-contract-reducer";
import {
  AutoStakeFormItem,
  FormItemText,
  subTextStyle
} from "../staking-form-item";
import { ModalWrapper } from "./modal-wrapper";

const inputNumberStyle = {
  flex: 1,
  background: "#f7f7f7",
  border: "none"
};

type Props = {
  bucketIndex: number;
  // tslint:disable-next-line:no-any
  clickable: any;
  nonDecay: boolean;
  selfStaking: boolean;
  stakedAmount: BigNumber;
  stakeDuration: number;
  actionSmartContractCalled(payload: boolean): void;
};

type State = {
  currentStakeAmount: BigNumber;
  unMountModalWrapper: boolean;
  confirmLoading: boolean;
  iotxBalance: number;
  ioAddress: string;
};

export const AddStakingModal = connect(
  state => ({
    // @ts-ignore
    isIoPay: state.base.isIoPay
  }),
  dispatch => ({
    actionSmartContractCalled(payload: boolean): void {
      dispatch(actionSmartContractCalled(payload));
    }
  })
)(
  class AddStakingForm extends Component<Props, State> {
    state: State = {
      currentStakeAmount: new BigNumber(0),
      unMountModalWrapper: false,
      confirmLoading: false,
      iotxBalance: 0,
      ioAddress: ""
    };

    async componentDidMount(): Promise<void> {
      const ioAddress = await getIoPayAddress();
      const iotxBalance = await getIotxBalance(ioAddress);

      this.setState({
        currentStakeAmount: this.props.stakedAmount,
        iotxBalance,
        ioAddress
      });
    }

    handleOk = async (cb: Function) => {
      if (!this.formRef.current) {
        return;
      }
      const { actionSmartContractCalled } = this.props;

      try {
        const values = await this.formRef.current.validateFields();
        if (!values.addStaking) {
          return;
        }
        this.setState({ confirmLoading: true });

        try {
          const { addStaking } = values;

          await getStaking().addDeposit({
            bucketIndex: this.props.bucketIndex,
            amount: toRau(addStaking, "Iotx"),
            payload: "",
            gasLimit: DEFAULT_STAKING_GAS_LIMIT,
            gasPrice: toRau("1", "Qev")
          });
        } catch (e) {
          // eslint-disable-next-line no-undef
          window.console.error(
            "%c add staking error",
            "color: blue",
            e.message
          );
        } finally {
          this.setState({ confirmLoading: false });
        }

        actionSmartContractCalled(true);
        if (cb) {
          cb();
        }
      } catch (e) {
        window.console.error(`failed to add staking: ${JSON.stringify(e)}`, e);
      }
    };

    handleCancel = () => {
      this.setState({
        unMountModalWrapper: true
      });
    };

    modalUnMountFun = () => {
      this.setState({
        unMountModalWrapper: false
      });
    };

    formRef: RefObject<FormInstance> = React.createRef<FormInstance>();

    // tslint:disable-next-line:max-func-body-length
    render(): JSX.Element {
      const { bucketIndex, clickable, nonDecay } = this.props;
      // const { getFieldDecorator, setFieldsValue, getFieldsError } = form;
      const {
        currentStakeAmount,
        unMountModalWrapper,
        iotxBalance
      } = this.state;
      const okText = this.state.confirmLoading
        ? t("my_stake.on_process_native_confirmation")
        : "ok";
      if (unMountModalWrapper) {
        return <></>;
      }
      return (
        // @ts-ignore
        <ModalWrapper
          clickable={clickable}
          title={
            // @ts-ignore
            t("my_stake.add_staking.title", { bucketIndex })
          }
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          modalUnMountFun={this.modalUnMountFun}
          confirmLoading={this.state.confirmLoading}
          okText={okText}
        >
          <p>{t("my_stake.add_staking.desc")}</p>
          {
            // @ts-ignore
            <Form ref={this.formRef}>
              {
                // @ts-ignore
                <Form.Item
                  {...formItemLayout}
                  labelAlign={"left"}
                  label={
                    <FormItemText
                      text={t("my_stake.addStaking")}
                      sub={t("my_stake.addStakingAmount")}
                    />
                  }
                  style={CommonMarginBottomStyle}
                  name="addStaking"
                  rules={[
                    {
                      required: true,
                      message: t("my_stake.addStakingAmount.required")
                    },
                    {
                      validator: smallerOrEqualTo(iotxBalance, 1)
                    }
                  ]}
                >
                  <Input
                    size="large"
                    addonAfter="IOTX"
                    style={inputNumberStyle}
                    disabled={iotxBalance <= 0}
                    onChange={event => {
                      const value = Number(event.target.value);
                      this.setState({
                        currentStakeAmount: new BigNumber(
                          this.props.stakedAmount
                        ).plus(value)
                      });
                    }}
                    onBlur={event => {
                      const value = Number(event.target.value);
                      const minValue = 1;
                      if (value < minValue) {
                        this.setState({
                          currentStakeAmount: new BigNumber(
                            this.props.stakedAmount
                          ).plus(minValue)
                        });
                      }
                    }}
                  />
                </Form.Item>
              }
              <Flex justifyContent="space-between">
                {
                  <span
                    // @ts-ignore
                    style={{
                      ...subTextStyle,
                      opacity: Number(iotxBalance <= 0),
                      color: colors.warning
                    }}
                  >
                    {t("my_stake.insufficient_balance")}
                  </span>
                }
                {
                  // @ts-ignore
                  <span style={subTextStyle}>
                    {`${t("my_stake.current_balance")} ${iotxBalance} IOTX`}
                  </span>
                }
              </Flex>
              <Form.Item
                labelAlign={"left"}
                {...formItemLayout}
                label={
                  <FormItemText
                    text={t("my_stake.totalStaking")}
                    sub={t("my_stake.totalStakingAmount")}
                  />
                }
                style={CommonMarginBottomStyle}
              >
                <InputNumber
                  size="large"
                  style={{ ...inputNumberStyle, minWidth: "300px" }}
                  disabled={true}
                  value={currentStakeAmount.toNumber()}
                />
              </Form.Item>
              {
                // @ts-ignore
                <AutoStakeFormItem
                  initialValue={nonDecay}
                  stakeAmount={this.state.currentStakeAmount}
                  stakeDuration={this.props.stakeDuration}
                  selfStaking={this.props.selfStaking}
                  formRef={this.formRef}
                  showAutoStack={false}
                  forceDisable={!nonDecay}
                />
              }
            </Form>
          }
        </ModalWrapper>
      );
    }
  }
);
