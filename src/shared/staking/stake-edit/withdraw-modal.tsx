// tslint:disable:no-any
import { Form } from "antd";
import { FormInstance } from "antd/lib/form";
import { toRau } from "iotex-antenna/lib/account/utils";
import { t } from "onefx/lib/iso-i18n";
import React, { Component, RefObject } from "react";
import { connect } from "react-redux";
import { getStaking } from "../../../server/gateway/staking";
import { colors } from "../../common/styles/style-color2";
import { DEFAULT_STAKING_GAS_LIMIT } from "../../common/token-utils";
import { actionSmartContractCalled } from "../smart-contract-reducer";
import { ModalWrapper } from "./modal-wrapper";

type Props = {
  clickable: any;
  stakingContract: any;
  addr: string;
  actionSmartContractCalled(payload: boolean): void;
  form: any;
  bucketIndex: number;
  waitUntil?: Date;
  epochSecondValue?: number;
  isNative: boolean;
  isIoPayMobile?: boolean;
  nativeTokenContractAddr: string;
  nativePatchTokenContractAddr: string;
  isPatchContract?: boolean;
};

export const WithdrawModal = connect(
  () => ({}),
  dispatch => ({
    actionSmartContractCalled(payload: boolean): void {
      dispatch(actionSmartContractCalled(payload));
    }
  })
)(
  class WithdrawForm extends Component<Props> {
    props: Props;

    formRef: RefObject<FormInstance> = React.createRef<FormInstance>();

    handleOk = async (cb: Function) => {
      if (!this.formRef.current) {
        return;
      }
      const { bucketIndex, actionSmartContractCalled } = this.props;

      const values = await this.formRef.current.validateFields();

      window.console.log("Received values of Withdraw form: ", {
        bucketIndex,
        ...values
      });

      const txHash = await getStaking().withdraw({
        bucketIndex,
        payload: "",
        gasLimit: DEFAULT_STAKING_GAS_LIMIT,
        gasPrice: toRau("1", "Qev")
      });

      window.console.log("Withdraw txHash", txHash);

      actionSmartContractCalled(true);
      if (cb) {
        cb();
      }
    };

    render(): JSX.Element {
      const { clickable, bucketIndex, waitUntil } = this.props;

      const isAvailable = waitUntil && new Date(waitUntil) <= new Date();

      return (
        // @ts-ignore
        <ModalWrapper
          clickable={clickable}
          title={t("my_stake.withdraw.title", {
            bucketIndex: String(bucketIndex)
          })}
          onOk={this.handleOk}
          okButtonProps={{ disabled: !isAvailable }}
        >
          {/*
            // @ts-ignore */}
          <Form ref={this.formRef}>
            {waitUntil ? (
              isAvailable ? (
                <p
                  dangerouslySetInnerHTML={{
                    __html: t("my_stake.withdraw.confirm", {
                      waitUntil: String(waitUntil)
                    })
                  }}
                />
              ) : (
                <p
                  dangerouslySetInnerHTML={{
                    __html: t("my_stake.withdraw.wait", {
                      waitUnti: String(waitUntil)
                    })
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
);
