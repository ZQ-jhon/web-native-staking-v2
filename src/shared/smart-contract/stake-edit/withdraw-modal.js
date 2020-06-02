/* eslint-disable no-invalid-this */
// @flow
import { Form } from "antd";
import window from "global/window";
import { Component } from "react";
import { connect } from "react-redux";
import { t } from "onefx/lib/iso-i18n";
import { actionSmartContractCalled } from "../smart-contract-reducer";
import { colors } from "../../common/styles/style-color2";
import { ModalWrapper } from "./modal-wrapper";
import { getIoAddressFromRemote } from "../vote-now-steps/vote-now-container";
import {
  getIoAddressFromIoPay,
  getXAppTokenContract
} from "../../xapps/xapp-request";
import { NATIVE_TOKEN_ABI } from "../native-token-abi";
import { toRau } from "iotex-antenna/lib/account/utils";
import { DEFAULT_STAKING_GAS_LIMIT } from "../../common/token-utils";

type TWithdraw = {
  data: string
};

type Props = {
  clickable: any,
  stakingContract: any,
  addr: string,
  actionSmartContractCalled: (payload: boolean) => void,
  form: any,
  bucketIndex: number,
  waitUntil: ?string,
  epochSecondValue?: number,
  isNative: boolean,
  isIoPay?: boolean,
  nativeTokenContractAddr: string,
  nativePatchTokenContractAddr: string,
  isPatchContract?: boolean
};

// $FlowFixMe
export const WithdrawModal = connect(
  state => ({
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
  Form.create({ name: "withdraw" })(
    class WithdrawForm extends Component<Props> {
      props: Props;

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

        this.props.form.validateFields(async (err, values: TWithdraw) => {
          if (!err) {
            window.console.log("Received values of Withdraw form: ", {
              bucketIndex,
              ...values
            });

            const withdraw = isNative
              ? isIoPay
                ? (await getXAppTokenContract(
                    NATIVE_TOKEN_ABI,
                    isPatchContract
                      ? nativePatchTokenContractAddr
                      : nativeTokenContractAddr
                  )).methods.withdraw
                : stakingContract.methods.withdraw
              : stakingContract.withdraw;
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
            const txHash = await withdraw(bucketIndex, "0x0", data);

            window.console.log("Withdraw txHash", txHash);

            actionSmartContractCalled(true);
            if (cb) {
              cb();
            }
          }
        });
      };

      render() {
        const { clickable, bucketIndex, waitUntil } = this.props;

        const isAvailable = waitUntil && new Date(waitUntil) <= new Date();

        return (
          <ModalWrapper
            clickable={clickable}
            title={t("my_stake.withdraw.title", { bucketIndex })}
            onOk={this.handleOk}
            okButtonProps={{ disabled: !isAvailable }}
          >
            <Form>
              {waitUntil ? (
                isAvailable ? (
                  <p
                    dangerouslySetInnerHTML={{
                      __html: t("my_stake.withdraw.confirm", { waitUntil })
                    }}
                  />
                ) : (
                  <p
                    dangerouslySetInnerHTML={{
                      __html: t("my_stake.withdraw.wait", { waitUntil })
                    }}
                  />
                )
              ) : (
                <p
                  dangerouslySetInnerHTML={{
                    __html: t("my_stake.withdraw.cannot", {
                      color: colors.error
                    })
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
