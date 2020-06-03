/* eslint-disable no-invalid-this */
// @flow
import { AutoComplete } from "antd";
import { Form } from "@ant-design/compatible";
// @ts-ignore
import window from "global/window";
import { t } from "onefx/lib/iso-i18n";
import React, { Component } from "react";
import { connect } from "react-redux";
// @ts-ignore
import { get } from "dotty";
import { Query } from "react-apollo";
import { formItemLayout } from "../../common/form-item-layout";
import {
  DEFAULT_STAKING_GAS_LIMIT,
  encodeCandidateHexName
} from "../../common/token-utils";
import { validateCanName } from "../field-validators";
import { actionSmartContractCalled } from "../smart-contract-reducer";
import { GET_ALL_CANDIDATE } from "../smart-contract-gql-queries";
import { ModalWrapper } from "./modal-wrapper";
import { getIoAddressFromRemote } from "../vote-now-steps/vote-now-container";
import {
  getIoAddressFromIoPay,
  getXAppTokenContract
} from "../../xapps/xapp-request";
import { NATIVE_TOKEN_ABI } from "../native-token-abi";
import { toRau } from "iotex-antenna/lib/account/utils";
import { hasError } from "../field-validators";

type TRevote = {
  canName: string;
  data: string;
};

type Props = {
  clickable: any;
  stakingContract: any;
  addr?: string;
  actionSmartContractCalled?: (payload: boolean) => void;
  form: any;
  bucketIndex: number;
  canName: string;
  isNative?: boolean;
  isIoPay?: boolean;
  nativeTokenContractAddr?: string;
  nativePatchTokenContractAddr?: string;
  isPatchContract?: boolean;
};

// $FlowFixMe
export const RevoteModal = connect(
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
  Form.create({ name: "revote" })(
    class RevoteForm extends Component<Props> {
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

        this.props.form.validateFields(async (err: any, values: TRevote) => {
          if (!err) {
            window.console.log("Received values of Revote form: ", values);

            const revote = isNative
              ? isIoPay
                ? (
                    await getXAppTokenContract(
                      NATIVE_TOKEN_ABI,
                      isPatchContract
                        ? nativePatchTokenContractAddr
                        : nativeTokenContractAddr
                    )
                  ).methods.revote
                : stakingContract.methods.revote
              : stakingContract.revote;
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
              : { from, gas: 100000 };
            const txHash = await revote(
              bucketIndex,
              encodeCandidateHexName(values.canName || ""),
              "0x0",
              data
            );

            window.console.log("Revote txHash", txHash);

            if (typeof actionSmartContractCalled === "function") {
              actionSmartContractCalled(true);
            }
            if (cb) {
              cb();
            }
          }
        });
      };

      render() {
        const { clickable, canName, bucketIndex } = this.props;
        const { getFieldDecorator, getFieldsError } = this.props.form;

        return (
          <ModalWrapper
            clickable={clickable}
            title={t("my_stake.revote.title", {
              bucketIndex: bucketIndex.toString()
            })}
            onOk={this.handleOk}
            okButtonProps={{ disabled: hasError(getFieldsError()) }}
          >
            <Form>
              <Form.Item {...formItemLayout} label={t("my_stake.canName")}>
                <Query ssr={false} query={GET_ALL_CANDIDATE}>
                  {({ loading, error, data }: any) => {
                    if (!loading && error) {
                      return null;
                    }
                    const allCandidates = data.bpCandidatesOnContract || [];
                    const dataSource = allCandidates
                      .map((item: any) => item.name)
                      .filter((item: any) => Boolean(item));
                    return (
                      <div>
                        {getFieldDecorator("canName", {
                          rules: [
                            {
                              required: true,
                              message: t("my_stake.canName.required")
                            },
                            {
                              validator: validateCanName,
                              initialValue: canName
                            }
                          ]
                        })(
                          // @ts-ignore
                          <AutoComplete
                            dataSource={dataSource}
                            filterOption={(inputValue: any, option: any) =>
                              String(get(option, "props.children"))
                                .toLowerCase()
                                .indexOf(inputValue.toLowerCase()) !== -1
                            }
                          />
                        )}
                      </div>
                    );
                  }}
                </Query>
              </Form.Item>
            </Form>
          </ModalWrapper>
        );
      }
    }
  )
);
