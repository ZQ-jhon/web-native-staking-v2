// tslint:disable:no-any
import Form from "antd/lib/form";
import { FormInstance } from "antd/lib/form";
import BigNumber from "bignumber.js";
import { toRau } from "iotex-antenna/lib/account/utils";
import { t } from "onefx/lib/iso-i18n";
import React, { Component } from "react";
import { connect } from "react-redux";
import { getStaking } from "../../../server/gateway/staking";
import { colors } from "../../common/styles/style-color2";
import { DEFAULT_STAKING_GAS_LIMIT } from "../../common/token-utils";
import {
  getStakeDurationMaxValue,
  validateStakeDuration
} from "../field-validators";
import { actionSmartContractCalled } from "../smart-contract-reducer";
import { AutoStakeFormItem, DurationFormItem } from "../staking-form-item";
import { ModalWrapper } from "./modal-wrapper";

type State = {
  currentStakeDuration: number;
  currentStakeAmount: BigNumber;
  unMountModalWrapper?: boolean;
  confirmLoading?: boolean;
};

type Props = {
  clickable: any;
  stakingContract: any;
  addr: string;
  actionSmartContractCalled(payload: boolean): void;
  bucketIndex: number;
  selfStaking: boolean;
  stakedAmount: BigNumber;
  stakeDuration: number;
  nonDecay: boolean;
  stakeTime: Date | undefined;
};

export const RestakeModal = connect(
  () => ({}),
  dispatch => ({
    actionSmartContractCalled(payload: boolean): void {
      dispatch(actionSmartContractCalled(payload));
    }
  })
)(
  class RestakeForm extends Component<Props, State> {
    props: Props;

    formRef: React.RefObject<FormInstance> = React.createRef<FormInstance>();

    state: State = {
      currentStakeAmount: new BigNumber(0),
      currentStakeDuration: 0,
      unMountModalWrapper: false,
      confirmLoading: false
    };

    componentDidMount(): void {
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

    handleOk = async (cb: Function) => {
      if (!this.formRef.current) {
        return;
      }
      const { actionSmartContractCalled, bucketIndex } = this.props;
      this.setState({ confirmLoading: true });

      const values = await this.formRef.current.validateFields();

      try {
        window.console.log("Received values of restake form: ", {
          bucketIndex,
          stakedDuration: values.stakeDuration,
          autoStake: values.nonDecay,
          payload: "",
          gasLimit: DEFAULT_STAKING_GAS_LIMIT,
          gasPrice: toRau("1", "Qev")
        });
        const txHash = await getStaking().restake({
          bucketIndex,
          stakedDuration: values.stakeDuration,
          autoStake: values.nonDecay,
          payload: "",
          gasLimit: DEFAULT_STAKING_GAS_LIMIT,
          gasPrice: toRau("1", "Qev")
        });
        window.console.log("restake txHash", txHash);
      } catch (e) {
        window.console.error("%c restake error", "color: blue", e.message);
      } finally {
        this.setState({ confirmLoading: false });
      }

      actionSmartContractCalled(true);
      if (cb) {
        cb();
      }
    };

    render(): JSX.Element | undefined | boolean {
      const {
        clickable,
        stakeDuration,
        nonDecay,
        bucketIndex,
        stakeTime
      } = this.props;

      const isAvailable = stakeTime && stakeTime <= new Date();
      const { unMountModalWrapper } = this.state;
      const okText = this.state.confirmLoading
        ? t("my_stake.on_process_native_confirmation")
        : "ok";
      const forceDisable =
        !nonDecay && stakeDuration <= getStakeDurationMaxValue();

      return (
        !unMountModalWrapper && (
          // @ts-ignore
          <ModalWrapper
            clickable={clickable}
            title={t("my_stake.restake.title", {
              bucketIndex: String(bucketIndex)
            })}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
            style={{ top: "40px" }}
            modalUnMountFun={this.modalUnMountFun}
            confirmLoading={this.state.confirmLoading}
            okText={okText}
          >
            {stakeTime ? (
              isAvailable ? (
                <p
                  dangerouslySetInnerHTML={{
                    __html: t("my_stake.restake.desc", {
                      stakeTime: String(stakeTime)
                    })
                  }}
                />
              ) : (
                <p
                  dangerouslySetInnerHTML={{
                    __html: t("my_stake.restake.cannot", {
                      stakeTime: String(stakeTime)
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

            {/*
            // @ts-ignore */}
            <Form ref={this.formRef}>
              {isAvailable && (
                // @ts-ignore
                <DurationFormItem
                  initialValue={stakeDuration}
                  validatorFactory={validateStakeDuration}
                  formRef={this.formRef}
                  onChange={n => this.setState({ currentStakeDuration: n })}
                />
              )}

              {isAvailable && (
                // @ts-ignore
                <AutoStakeFormItem
                  initialValue={nonDecay}
                  selfStaking={this.props.selfStaking}
                  stakeAmount={this.state.currentStakeAmount}
                  stakeDuration={this.state.currentStakeDuration}
                  formRef={this.formRef}
                  forceDisable={forceDisable}
                />
              )}
            </Form>
          </ModalWrapper>
        )
      );
    }
  }
);
