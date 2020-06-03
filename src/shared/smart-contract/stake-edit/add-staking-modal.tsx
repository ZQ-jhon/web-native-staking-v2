/* eslint-disable no-invalid-this */
// @flow
import { Form, InputNumber, Input } from "antd";
import { Component } from "react";
import { connect } from "react-redux";
import { t } from "onefx/lib/iso-i18n";
import { actionSmartContractCalled } from "../smart-contract-reducer";
import { ModalWrapper } from "./modal-wrapper";
import { CommonMarginBottomStyle } from "../../common/common-margin";
import { smallerOrEqualTo } from "../field-validators";
import { AutoStakeFormItem, FormItemText } from "../staking-form-item";
import { Flex } from "../../common/flex";
import { subTextStyle } from "../staking-form-item";
import {
  getIotxBalance,
  getIoAddressFromRemote
} from "../vote-now-steps/vote-now-container";
import { colors } from "../../common/styles/style-color2";
import { toRau } from "iotex-antenna/lib/account/utils";
import {
  getIoAddressFromIoPay,
  getXAppTokenContract
} from "../../xapps/xapp-request";
import { NATIVE_TOKEN_ABI } from "../native-token-abi";
import { hasError } from "../field-validators";
import { DEFAULT_STAKING_GAS_LIMIT } from "../../common/token-utils";

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 }
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 }
  },
  colon: false
};

const inputNumberStyle = {
  flex: 1,
  background: "#f7f7f7",
  border: "none"
};

type TAddStaking = {
  addStaking: number;
  nonDecay: boolean;
};

type Props = {
  bucketIndex: number;
  stakingContract: any;
  addr: string;
  clickable: any;
  nonDecay: boolean;
  stakedAmount: number;
  stakeDuration: number;
  form: any;
  isIoPay?: boolean;
  nativeTokenContractAddr: string;
  nativePatchTokenContractAddr: string;
  actionSmartContractCalled: (payload: boolean) => void;
  isPatchContract?: boolean;
};

type State = {
  currentStakeAmount: number;
  unMountModalWrapper: boolean;
  confirmLoading: boolean;
  iotxBalance: number;
  ioAddress: string;
};

// $FlowFixMe
export const AddStakingModal = connect(
  state => ({
    isIoPay: state.base.isIoPay,
    nativeTokenContractAddr: state.smartContract.nativeTokenContractAddr,
    nativePatchTokenContractAddr:
      state.smartContract.nativePatchTokenContractAddr
  }),
  dispatch => ({
    actionSmartContractCalled(payload: boolean) {
      dispatch(actionSmartContractCalled(payload));
    }
  })
)(
  // $FlowFixMe
  Form.create({ name: "addStaking" })(
    class AddStakingForm extends Component<Props, State> {
      state: State = {
        currentStakeAmount: 0,
        unMountModalWrapper: false,
        confirmLoading: false,
        iotxBalance: 0,
        ioAddress: ""
      };

      async componentDidMount() {
        const { isIoPay } = this.props;
        const ioAddress = isIoPay
          ? await getIoAddressFromIoPay()
          : await getIoAddressFromRemote();
        const iotxBalance = await getIotxBalance(ioAddress);

        this.setState({
          currentStakeAmount: this.props.stakedAmount,
          iotxBalance,
          ioAddress
        });
      }

      handleOk = (cb: Function) => {
        const {
          stakingContract,
          bucketIndex,
          actionSmartContractCalled,
          isIoPay,
          nativeTokenContractAddr,
          nativePatchTokenContractAddr,
          isPatchContract
        } = this.props;

        this.props.form.validateFields(async (err, values: TAddStaking) => {
          if (!values.addStaking) {
            return;
          }
          if (!err) {
            this.setState({ confirmLoading: true });

            try {
              const { addStaking } = values;
              let txHash;
              const data = {
                gasLimit: DEFAULT_STAKING_GAS_LIMIT,
                gasPrice: toRau("1", "Qev"),
                amount: toRau(addStaking, "Iotx")
              };

              if (isIoPay) {
                const sContract = await getXAppTokenContract(
                  NATIVE_TOKEN_ABI,
                  isPatchContract
                    ? nativePatchTokenContractAddr
                    : nativeTokenContractAddr
                );
                txHash = await sContract.methods.storeToPygg(
                  bucketIndex,
                  "0x0",
                  data
                );
              } else {
                txHash = await stakingContract.methods.storeToPygg(
                  bucketIndex,
                  "0x0",
                  data
                );
              }
              // eslint-disable-next-line no-undef
              window.console.log("add staking txHash", txHash);
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
          }
        });
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

      render() {
        const { bucketIndex, clickable, nonDecay, form } = this.props;
        const { getFieldDecorator, setFieldsValue, getFieldsError } = form;
        const {
          currentStakeAmount,
          unMountModalWrapper,
          iotxBalance
        } = this.state;
        const okText = this.state.confirmLoading
          ? t("my_stake.on_process_native_confirmation")
          : "ok";

        return (
          !unMountModalWrapper && (
            <ModalWrapper
              clickable={clickable}
              title={t("my_stake.add_staking.title", { bucketIndex })}
              onOk={this.handleOk}
              onCancel={this.handleCancel}
              modalUnMountFun={this.modalUnMountFun}
              confirmLoading={this.state.confirmLoading}
              okText={okText}
              okButtonProps={{ disabled: hasError(getFieldsError()) }}
            >
              <p>{t("my_stake.add_staking.desc")}</p>
              <Form layout={"vertical"}>
                <Form.Item
                  {...formItemLayout}
                  label={
                    <FormItemText
                      text={t("my_stake.addStaking")}
                      sub={t("my_stake.addStakingAmount")}
                    />
                  }
                  style={CommonMarginBottomStyle}
                >
                  {getFieldDecorator("addStaking", {
                    rules: [
                      {
                        required: true,
                        message: t("my_stake.addStakingAmount.required")
                      },
                      {
                        validator: smallerOrEqualTo(iotxBalance, 100)
                      }
                    ]
                  })(
                    <Input
                      size="large"
                      addonAfter="IOTX"
                      style={inputNumberStyle}
                      disabled={iotxBalance < 100}
                      onChange={event => {
                        // $FlowFixMe
                        const value = Number(event.target.value);
                        this.setState({
                          currentStakeAmount: this.props.stakedAmount + value
                        });
                      }}
                      onBlur={event => {
                        // $FlowFixMe
                        const value = Number(event.target.value);
                        const minValue = 100;
                        if (value < minValue) {
                          setFieldsValue({ addStaking: minValue });
                          this.setState({
                            currentStakeAmount:
                              this.props.stakedAmount + minValue
                          });
                        }
                      }}
                    />
                  )}
                  <Flex justifyContent="space-between">
                    <span
                      style={{
                        ...subTextStyle,
                        opacity: Number(iotxBalance < 100),
                        color: colors.warning
                      }}
                    >
                      {t("my_stake.insufficient_balance")}
                    </span>
                    <span style={subTextStyle}>
                      {`${t("my_stake.current_balance")} ${iotxBalance} IOTX`}
                    </span>
                  </Flex>
                </Form.Item>

                <Form.Item
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
                    style={inputNumberStyle}
                    disabled={true}
                    value={currentStakeAmount}
                  />
                </Form.Item>

                <AutoStakeFormItem
                  initialValue={nonDecay}
                  stakeAmount={this.state.currentStakeAmount}
                  stakeDuration={this.props.stakeDuration}
                  form={form}
                  showAutoStack={false}
                  forceDisable={!nonDecay}
                />
              </Form>
            </ModalWrapper>
          )
        );
      }
    }
  )
);
