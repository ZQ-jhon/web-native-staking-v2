// tslint:disable:no-any
import Form from "antd/lib/form";
import { FormInstance } from "antd/lib/form";
import { toRau } from "iotex-antenna/lib/account/utils";
import { t } from "onefx/lib/iso-i18n";
import React, { Component, RefObject } from "react";
import { connect } from "react-redux";
import { getStaking } from "../../../server/gateway/staking";
import { colors } from "../../common/styles/style-color2";
import {
  DEFAULT_EPOCH_SECOND,
  DEFAULT_STAKING_GAS_LIMIT
} from "../../common/token-utils";
import { actionSmartContractCalled } from "../smart-contract-reducer";
import { ModalWrapper } from "./modal-wrapper";

type Props = {
  clickable: any;
  stakingContract: any;
  addr: string;
  actionSmartContractCalled(payload: boolean): void;
  form: any;
  bucketIndex: number;
  stakeStartTime: any;
  stakeDuration: number;
  nonDecay: boolean;
  epochSecondValue?: number;
  isNative: boolean;
  isIoPayMobile?: boolean;
  nativeTokenContractAddr: string;
  nativePatchTokenContractAddr: string;
  isPatchContract?: boolean;
};

// $FlowFixMe
export const UnstakeModal = connect(
  () => ({}),
  dispatch => ({
    actionSmartContractCalled(payload: boolean): void {
      dispatch(actionSmartContractCalled(payload));
    }
  })
)(
  class UnstakeForm extends Component<Props> {
    props: Props;

    formRef: RefObject<FormInstance> = React.createRef<FormInstance>();

    handleOk = async (cb: Function) => {
      if (!this.formRef.current) {
        return;
      }
      const {
        bucketIndex,
        actionSmartContractCalled,
        stakeStartTime,
        stakeDuration,
        nonDecay
      } = this.props;
      const values = await this.formRef.current.validateFields();
      window.console.log("Received values of Unstake form: ", {
        bucketIndex,
        ...values
      });

      window.console.log({
        stakeStartTime,
        stakeDuration,
        isAvailable: this.isAvailable(stakeStartTime, stakeDuration),
        "!nonDecay": !nonDecay
      });

      const isAvailable = this.isAvailable(stakeStartTime, stakeDuration);
      if (!nonDecay && isAvailable) {
        const txHash = await getStaking().unstake({
          bucketIndex,
          payload: "",
          gasLimit: DEFAULT_STAKING_GAS_LIMIT,
          gasPrice: toRau("1", "Qev")
        });

        window.console.log("Unstake txHash", txHash);

        actionSmartContractCalled(true);
      }
      if (cb) {
        cb();
      }
    };

    isAvailable = (stakeStartTime: any, stakeDuration: number) => {
      const { epochSecondValue = DEFAULT_EPOCH_SECOND } = this.props;
      const agoDate = new Date();
      agoDate.setTime(
        agoDate.getTime() - stakeDuration * epochSecondValue * 1000
      );
      return stakeStartTime ? new Date(stakeStartTime) <= agoDate : undefined;
    };

    render(): JSX.Element {
      const {
        clickable,
        bucketIndex,
        stakeStartTime,
        stakeDuration,
        nonDecay
      } = this.props;

      const isAvailable = this.isAvailable(stakeStartTime, stakeDuration);
      return (
        // @ts-ignore
        <ModalWrapper
          clickable={clickable}
          title={t("my_stake.unstake.title", {
            bucketIndex: String(bucketIndex)
          })}
          onOk={this.handleOk}
        >
          {/*
          // @ts-ignore */}
          <Form ref={this.formRef}>
            {isAvailable !== undefined ? (
              isAvailable ? (
                nonDecay ? (
                  <span>{t("my_stake.unstake.nondecay_flag")}</span>
                ) : (
                  <p
                    dangerouslySetInnerHTML={{
                      __html: t("my_stake.unstake.desc", { stakeStartTime })
                    }}
                  />
                )
              ) : (
                <p
                  dangerouslySetInnerHTML={{
                    __html: t("my_stake.unstake.cannot", { stakeStartTime })
                  }}
                />
              )
            ) : (
              <p
                dangerouslySetInnerHTML={{
                  __html: t("my_stake.unstake.err", { color: colors.error })
                }}
              />
            )}
          </Form>
        </ModalWrapper>
      );
    }
  }
);
