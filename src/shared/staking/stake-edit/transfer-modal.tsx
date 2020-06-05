// @flow
/* tslint:disable:no-any */
import { Form, Input } from "antd";
import { FormInstance } from "antd/lib/form";
import { toRau } from "iotex-antenna/lib/account/utils";
import { t } from "onefx/lib/iso-i18n";
import React, { Component } from "react";
import { connect } from "react-redux";
import { getStaking } from "../../../server/gateway/staking";
import { formItemLayout } from "../../common/form-item-layout";
import { DEFAULT_STAKING_GAS_LIMIT } from "../../common/token-utils";
import { validateIoAddress } from "../field-validators";
import { actionSmartContractCalled } from "../smart-contract-reducer";
import { ModalWrapper } from "./modal-wrapper";

type State = {
  address: string;
};

export const TransferModal = connect(
  () => ({}),
  dispatch => ({
    actionSmartContractCalled(payload: boolean): void {
      dispatch(actionSmartContractCalled(payload));
    }
  })
)(
  class TransferForm extends Component<
    {
      bucketIndex: number;
      canName: string;
      clickable: JSX.Element;
      stakedDuration: number;
      autoStake: boolean;
      actionSmartContractCalled: Function;
    },
    State
  > {
    formRef: React.RefObject<FormInstance> = React.createRef<FormInstance>();
    public state: State = {
      address: ""
    };

    onOk = async (cb: Function) => {
      const { bucketIndex, actionSmartContractCalled } = this.props;
      if (!this.formRef.current) {
        return;
      }
      this.formRef.current.validateFields().then(async () => {
        const { address } = this.state;

        const txHash = await getStaking().transferOwnership({
          bucketIndex: bucketIndex,
          voterAddress: address,
          payload: "",
          gasLimit: DEFAULT_STAKING_GAS_LIMIT,
          gasPrice: toRau("1", "Qev")
        });

        window.console.log("Revote txHash", txHash);

        if (actionSmartContractCalled) {
          actionSmartContractCalled(true);
        }
        if (cb) {
          cb();
        }
      });
    };

    render(): JSX.Element {
      const { clickable, bucketIndex } = this.props;
      return (
        // @ts-ignore
        <ModalWrapper
          clickable={clickable}
          onOk={this.onOk}
          title={
            // @ts-ignore
            t("my_stake.transfer.title", { bucketIndex })
          }
        >
          {
            // @ts-ignore
            <Form ref={this.formRef}>
              {
                /*
                      // @ts-ignore*/
                <Form.Item
                  {...formItemLayout}
                  label={t("my_stake.tranferOwnership")}
                  name="address"
                  rules={[
                    {
                      required: true,
                      message: t("my_stake.tranferOwnership.required")
                    },
                    {
                      validator: validateIoAddress
                    }
                  ]}
                >
                  <Input
                    size="large"
                    onChange={(event: any) => {
                      this.setState({
                        address: event.target.value
                      });
                    }}
                  />
                </Form.Item>
              }
            </Form>
          }
        </ModalWrapper>
      );
    }
  }
);
