// @flow
import AutoComplete from "antd/lib/auto-complete";
import Form from "antd/lib/form";
import { FormInstance } from "antd/lib/form";
import { toRau } from "iotex-antenna/lib/account/utils";
import { t } from "onefx/lib/iso-i18n";
import React, { Component } from "react";
import { Query } from "react-apollo";
import { connect } from "react-redux";
import { getStaking } from "../../../server/gateway/staking";
import { webBpApolloClient } from "../../common/apollo-client";
import { formItemLayout } from "../../common/form-item-layout";
import { DEFAULT_STAKING_GAS_LIMIT } from "../../common/token-utils";
import { validateCanName } from "../field-validators";
import { GET_ALL_CANDIDATE } from "../smart-contract-gql-queries";
import { actionSmartContractCalled } from "../smart-contract-reducer";
import { extractCandidates } from "../staking-form-item";
import { ModalWrapper } from "./modal-wrapper";

export const RevoteModal = connect(
  () => ({}),
  (dispatch) => ({
    actionSmartContractCalled(payload: boolean): void {
      dispatch(actionSmartContractCalled(payload));
    },
  })
)(
  class RevoteForm extends Component<{
    bucketIndex: number;
    canName: string;
    clickable: JSX.Element;
    stakedDuration: number;
    autoStake: boolean;
    actionSmartContractCalled: Function;
  }> {
    formRef: React.RefObject<FormInstance> = React.createRef<FormInstance>();

    onOk = async (cb: Function) => {
      const { bucketIndex, actionSmartContractCalled } = this.props;
      if (!this.formRef.current) {
        return;
      }
      const canName = this.formRef.current.getFieldValue("canName");

      const txHash = await getStaking().changeCandidate({
        bucketIndex: bucketIndex,
        candidateName: canName,
        payload: "",
        gasLimit: DEFAULT_STAKING_GAS_LIMIT,
        gasPrice: toRau("1", "Qev"),
      });

      window.console.log("Revote txHash", txHash);

      if (actionSmartContractCalled) {
        actionSmartContractCalled(true);
      }
      if (cb) {
        cb();
      }
    };

    render(): JSX.Element {
      const { clickable, bucketIndex, canName } = this.props;
      return (
        // @ts-ignore
        <ModalWrapper
          clickable={clickable}
          onOk={this.onOk}
          title={
            // @ts-ignore
            t("my_stake.revote.title", { bucketIndex })
          }
        >
          {
            // @ts-ignore
            <Form ref={this.formRef}>
              {/*
              // @ts-ignore */}
              <Query
                ssr={false}
                query={GET_ALL_CANDIDATE}
                client={webBpApolloClient}
              >
                {/* tslint:disable-next-line:no-any */}
                {({ loading, error, data }: any) => {
                  if (!loading && error) {
                    return null;
                  }
                  const dataSource = extractCandidates(data);
                  return (
                    // @ts-ignore
                    <Form.Item
                      {...formItemLayout}
                      label={t("my_stake.canName")}
                      name="canName"
                      rules={[
                        {
                          required: true,
                          message: t("my_stake.canName.required"),
                        },
                        {
                          validator: validateCanName,
                        },
                      ]}
                    >
                      {/*
                      // @ts-ignore*/}
                      <AutoComplete
                        size="large"
                        options={dataSource}
                        defaultValue={canName}
                        // @ts-ignore
                        filterOption={(inputValue, option) =>
                          option.value
                            .toUpperCase()
                            .indexOf(inputValue.toUpperCase()) !== -1
                        }
                      />
                    </Form.Item>
                  );
                }}
              </Query>
            </Form>
          }
        </ModalWrapper>
      );
    }
  }
);
