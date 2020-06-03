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
import {
  DEFAULT_EPOCH_SECOND,
  DEFAULT_STAKING_GAS_LIMIT
} from "../../common/token-utils";
import { ModalWrapper } from "./modal-wrapper";
import { getIoAddressFromRemote } from "../vote-now-steps/vote-now-container";
import {
  getIoAddressFromIoPay,
  getXAppTokenContract
} from "../../xapps/xapp-request";
import { NATIVE_TOKEN_ABI } from "../native-token-abi";
import { toRau } from "iotex-antenna/lib/account/utils";

type TUnstake = {
  data: string;
};

type Props = {
  clickable: any;
  stakingContract: any;
  addr: string;
  actionSmartContractCalled: (payload: boolean) => void;
  form: any;
  bucketIndex: number;
  stakeStartTime: any;
  stakeDuration: number;
  nonDecay: boolean;
  epochSecondValue?: number;
  isNative: boolean;
  isIoPay?: boolean;
  nativeTokenContractAddr: string;
  nativePatchTokenContractAddr: string;
  isPatchContract?: boolean;
};

// $FlowFixMe
export const UnstakeModal = connect(
  (state: {
    base: { isIoPay: boolean; epochSecondValue: number };
    smartContract: {
      nativeTokenContractAddr: string;
      nativePatchTokenContractAddr: string;
    };
  }) => ({
    epochSecondValue: state.base.epochSecondValue,
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
  Form.create({ name: "unstake" })(
    class UnstakeForm extends Component<Props> {
      props: Props;

      handleOk = (cb: Function) => {
        const {
          stakingContract,
          bucketIndex,
          addr,
          actionSmartContractCalled,
          stakeStartTime,
          stakeDuration,
          nonDecay,
          isNative,
          isIoPay,
          nativeTokenContractAddr,
          nativePatchTokenContractAddr,
          isPatchContract
        } = this.props;
        this.props.form.validateFields(async (err: any, values: TUnstake) => {
          if (!err) {
            window.console.log("Received values of Unstake form: ", {
              bucketIndex,
              ...values
            });

            const isAvailable = this.isAvailable(stakeStartTime, stakeDuration);
            if (!nonDecay && isAvailable) {
              const unstake = isNative
                ? isIoPay
                  ? (
                      await getXAppTokenContract(
                        NATIVE_TOKEN_ABI,
                        isPatchContract
                          ? nativePatchTokenContractAddr
                          : nativeTokenContractAddr
                      )
                    ).methods.unstake
                  : stakingContract.methods.unstake
                : stakingContract.unstake;
              const from = isNative
                ? isIoPay
                  ? await getIoAddressFromIoPay()
                  : await getIoAddressFromRemote()
                : addr;
              const data = isNative
                ? {
                    gasLimit: DEFAULT_STAKING_GAS_LIMIT,
                    gasPrice: toRau("1", "Qev"),
                    from
                  }
                : { from };
              const txHash = await unstake(bucketIndex, "0x0", data);

              window.console.log("Unstake txHash", txHash);

              actionSmartContractCalled(true);
            }
            if (cb) {
              cb();
            }
          }
        });
      };

      isAvailable = (stakeStartTime: any, stakeDuration: number) => {
        const { epochSecondValue = DEFAULT_EPOCH_SECOND } = this.props;
        const agoDate = new Date();
        agoDate.setTime(
          agoDate.getTime() - stakeDuration * epochSecondValue * 1000
        );
        const isAvailable = stakeStartTime
          ? new Date(stakeStartTime) <= agoDate
          : undefined;
        return isAvailable;
      };

      render() {
        const {
          clickable,
          bucketIndex,
          stakeStartTime,
          stakeDuration,
          nonDecay
        } = this.props;

        const isAvailable = this.isAvailable(stakeStartTime, stakeDuration);
        return (
          <ModalWrapper
            clickable={clickable}
            title={t("my_stake.unstake.title", {
              bucketIndex: bucketIndex.toString()
            })}
            onOk={this.handleOk}
          >
            <Form>
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
  )
);
