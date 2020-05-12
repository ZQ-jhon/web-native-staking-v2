// @flow
import {Form, Input, InputNumber} from "antd";
import {t} from "onefx/lib/iso-i18n";
import React, {Component} from "react";
import {connect} from "react-redux";
import {CommonMarginBottomStyle} from "../../common/common-margin";
import {Flex} from "../../common/flex";
import {getStaking} from "../../common/get-staking";
import {colors} from "../../common/styles/style-color2";
import {smallerOrEqualTo} from "../field-validators";
import {actionSmartContractCalled} from "../smart-contract-reducer";
import {AutoStakeFormItem, FormItemText, subTextStyle} from "../staking-form-item";
import {ModalWrapper} from "./modal-wrapper";

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
  addStaking: number,
  nonDecay: boolean
};

type Props = {
  bucketIndex: number,
  addr: string,
  // tslint:disable-next-line:no-any
  clickable: any,
  nonDecay: boolean,
  stakedAmount: number,
  stakeDuration: number,
  // tslint:disable-next-line:no-any
  form: any,
  actionSmartContractCalled(payload: boolean): void,
};

type State = {
  currentStakeAmount: number,
  unMountModalWrapper: boolean,
  confirmLoading: boolean,
  iotxBalance: number,
  ioAddress: string
};

export const AddStakingModal = connect(
  state => ({
  // @ts-ignore
    isIoPay: state.base.isIoPay,
  }),
  dispatch => ({
    actionSmartContractCalled(payload: boolean):void {
      dispatch(actionSmartContractCalled(payload));
    }
  })
)(
    class AddStakingForm extends Component<Props, State> {
      state: State = {
        currentStakeAmount: 0,
        unMountModalWrapper: false,
        confirmLoading: false,
        iotxBalance: 0,
        ioAddress: ""
      };

      async componentDidMount(): Promise<void>{
        const staking = getStaking();
        const ioAddress = await staking.getIoPayAddress();
        const iotxBalance = await staking.getIotxBalance(ioAddress);

        this.setState({
          currentStakeAmount: this.props.stakedAmount,
          iotxBalance,
          ioAddress
        });
      }

      handleOk = (cb: Function) => {
        const {
          actionSmartContractCalled,
        } = this.props;

        // tslint:disable-next-line:no-any
        this.props.form.validateFields(async (err: any, values: TAddStaking) => {
          if (!values.addStaking) {
            return;
          }
          if (!err) {
            this.setState({ confirmLoading: true });

            try {
              const { addStaking } = values;
              // eslint-disable-next-line no-undef
              window.console.log("addStaking", addStaking);
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

      // tslint:disable-next-line:max-func-body-length
      render(): JSX.Element {
        const { bucketIndex, clickable, nonDecay, form } = this.props;
        // const { getFieldDecorator, setFieldsValue, getFieldsError } = form;
        const {
          currentStakeAmount,
          unMountModalWrapper,
          iotxBalance
        } = this.state;
        const okText = this.state.confirmLoading
          ? t("my_stake.on_process_native_confirmation")
          : "ok";
        if(unMountModalWrapper){
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
            // okButtonProps={{ disabled: hasError(getFieldsError()) }}
          >
            <p>{t("my_stake.add_staking.desc")}</p>
            {
              // @ts-ignore
              <Form layout={"vertical"}>
                {
                  // @ts-ignore
                  <Form.Item
                    {...formItemLayout}
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
                        validator: smallerOrEqualTo(iotxBalance, 100)
                      }
                    ]}
                  >
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
                          // setFieldsValue({ addStaking: minValue });
                          this.setState({
                            currentStakeAmount:
                              this.props.stakedAmount + minValue
                          });
                        }
                      }}
                    />
                    <Flex justifyContent="space-between">
                      {
                        // @ts-ignore
                        <span style={{
                          ...subTextStyle,
                          opacity: Number(iotxBalance < 100),
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
                  </Form.Item>
                }
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
                {
                  // @ts-ignore
                  <AutoStakeFormItem
                    initialValue={nonDecay}
                    stakeAmount={this.state.currentStakeAmount}
                    stakeDuration={this.props.stakeDuration}
                    form={form}
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
