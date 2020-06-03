/* eslint-disable no-invalid-this */
// @flow
import { Form } from "@ant-design/compatible";
// @ts-ignore
import window from "global/window";
import React, { Component } from "react";
import { connect } from "react-redux";
import { t } from "onefx/lib/iso-i18n";
import { actionSmartContractCalled } from "../smart-contract-reducer";
import { colors } from "../../common/styles/style-color2";
import { AutoStakeFormItem, DurationFormItem } from "../staking-form-item";
import { ModalWrapper } from "./modal-wrapper";
import {
  getStakeDurationMaxValue,
  validateRestakeDuration
} from "../field-validators";
import { getIoAddressFromRemote } from "../vote-now-steps/vote-now-container";
import {
  getIoAddressFromIoPay,
  getXAppTokenContract
} from "../../xapps/xapp-request";
import { NATIVE_TOKEN_ABI } from "../native-token-abi";
import { toRau } from "iotex-antenna/lib/account/utils";
import { hasError } from "../field-validators";
import { DEFAULT_STAKING_GAS_LIMIT } from "../../common/token-utils";

type TRestake = {
  stakeDuration: number;
  nonDecay: boolean;
  data: string;
};

type State = {
  currentStakeDuration: number;
  currentStakeAmount: number;
  unMountModalWrapper: boolean;
  confirmLoading: boolean;
};

type Props = {
  clickable: any;
  stakingContract: any;
  addr: string;
  actionSmartContractCalled: (payload: boolean) => void;
  form: any;
  bucketIndex: number;
  stakedAmount: number;
  stakeDuration: number;
  nonDecay: boolean;
  stakeTime: number;
  isNative: boolean;
  isIoPay?: boolean;
  nativeTokenContractAddr: string;
  nativePatchTokenContractAddr: string;
  isPatchContract?: boolean;
};

// $FlowFixMe
export const RestakeModal = connect(
  (state: {
    base: { isIoPay: boolean };
    smartContract: {
      nativeTokenContractAddr: string;
      nativePatchTokenContractAddr: string;
    };
  }) => ({
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
  Form.create({ name: "restake" })(
    class RestakeForm extends Component<Props, State> {
      props: Props;

      state: State = {
        currentStakeAmount: 0,
        currentStakeDuration: 0,
        unMountModalWrapper: false,
        confirmLoading: false
      };

      componentDidMount() {
        this.setState({
          currentStakeAmount: this.props.stakedAmount,
          currentStakeDuration: this.props.stakeDuration
        });
      }

      handleCancel = () => {
        this.setState({
          unMountModalWrapper: true
        });
      };

      modalUnMountFun = () => {
        this.setState({
          unMountModalWrapper: false,
          confirmLoading: false
        });
      };

      handleOk = (cb: Function) => {
        const {
          stakingContract,
          bucketIndex,
          addr,
          actionSmartContractCalled,
          isNative,
          isIoPay,
          nativeTokenContractAddr,
          nativePatchTokenContractAddr,
          isPatchContract
        } = this.props;
        this.setState({ confirmLoading: true });

        this.props.form.validateFields(async (err: any, values: TRestake) => {
          if (!err) {
            window.console.log("Received values of restake form: ", values);
            const restake = isNative
              ? isIoPay
                ? (
                    await getXAppTokenContract(
                      NATIVE_TOKEN_ABI,
                      isPatchContract
                        ? nativePatchTokenContractAddr
                        : nativeTokenContractAddr
                    )
                  ).methods.restake
                : stakingContract.methods.restake
              : stakingContract.restake;
            const from = isNative
              ? isIoPay
                ? await getIoAddressFromIoPay()
                : await getIoAddressFromRemote()
              : addr;
            const data = isNative
              ? {
                  gasLimit: DEFAULT_STAKING_GAS_LIMIT,
                  gasPrice: toRau("1", "Qev")
                }
              : { from, gas: 200000 };

            try {
              const txHash = await restake(
                bucketIndex,
                values.stakeDuration,
                isNative ? Number(values.nonDecay) : Boolean(values.nonDecay),
                "0x0",
                data
              );
              window.console.log("restake txHash", txHash);
            } catch (e) {
              window.console.error(
                "%c restake error",
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

      render() {
        const {
          clickable,
          stakeDuration,
          nonDecay,
          bucketIndex,
          stakeTime,
          form,
          isNative
        } = this.props;
        const { getFieldsError } = form;

        const isAvailable = stakeTime && new Date(stakeTime) <= new Date();
        const { unMountModalWrapper } = this.state;
        const okText = this.state.confirmLoading
          ? t(
              isNative
                ? "my_stake.on_process_native_confirmation"
                : "my_stake.on_process_confirmation"
            )
          : "ok";
        const validatorFactory = (max: any) =>
          validateRestakeDuration(stakeDuration, stakeTime, nonDecay, max);

        return (
          !unMountModalWrapper && (
            // @ts-ignore
            <ModalWrapper
              clickable={clickable}
              title={t("my_stake.restake.title", {
                bucketIndex: bucketIndex.toString()
              })}
              onOk={this.handleOk}
              onCancel={this.handleCancel}
              style={{ top: "40px" }}
              modalUnMountFun={this.modalUnMountFun}
              confirmLoading={this.state.confirmLoading}
              okText={okText}
              okButtonProps={{ disabled: hasError(getFieldsError()) }}
            >
              {stakeTime ? (
                isAvailable ? (
                  <p
                    dangerouslySetInnerHTML={{
                      __html: t("my_stake.restake.desc", {
                        stakeTime: stakeTime.toLocaleString()
                      })
                    }}
                  />
                ) : (
                  <p
                    dangerouslySetInnerHTML={{
                      __html: t("my_stake.restake.cannot", {
                        stakeTime: stakeTime.toLocaleString()
                      })
                    }}
                  />
                )
              ) : (
                <p
                  dangerouslySetInnerHTML={{
                    __html: t("my_stake.restake.err", { color: colors.error })
                  }}
                />
              )}

              <Form layout={"vertical"}>
                {isAvailable && (
                  <DurationFormItem
                    initialValue={stakeDuration}
                    validatorFactory={validatorFactory}
                    form={form}
                    // @ts-ignore
                    onChange={(number: number) =>
                      this.setState({ currentStakeDuration: number })
                    }
                  />
                )}

                {isAvailable && (
                  <AutoStakeFormItem
                    initialValue={nonDecay}
                    stakeAmount={this.state.currentStakeAmount}
                    stakeDuration={this.state.currentStakeDuration}
                    form={form}
                    forceDisable={
                      !nonDecay && stakeDuration <= getStakeDurationMaxValue()
                    }
                  />
                )}
              </Form>
            </ModalWrapper>
          )
        );
      }
    }
  )
);
