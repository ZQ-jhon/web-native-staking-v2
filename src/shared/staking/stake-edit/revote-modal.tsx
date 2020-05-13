// @flow
import {AutoComplete, Form} from "antd";
import { get } from "dottie";
import {t} from "onefx/lib/iso-i18n";
import React, {Component} from "react";
import {Query} from "react-apollo";
import {connect} from "react-redux";
import {webBpApolloClient} from "../../common/apollo-client";
import {formItemLayout} from "../../common/form-item-layout";
import {validateCanName} from "../field-validators";
import {GET_ALL_CANDIDATE} from "../smart-contract-gql-queries";
import {ModalWrapper} from "./modal-wrapper";

export const RevoteModal = connect()(
  class RevoteForm extends Component<{bucketIndex: number, canName: string, clickable: JSX.Element}> {
    render(): JSX.Element {
      const { clickable, bucketIndex, canName } = this.props;
      return (
        // @ts-ignore
        <ModalWrapper
          clickable={clickable}
          title={
            // @ts-ignore
            t("my_stake.revote.title", { bucketIndex })
          }
        >
          {
            // @ts-ignore
            <Form>
              {
                // @ts-ignore
                <Form.Item
                  {...formItemLayout}
                  label={t("my_stake.canName")}
                  name="canName"
                  rules={[
                    {
                      required: true,
                      message: t("my_stake.canName.required")
                    },
                    {
                      validator: validateCanName,
                      initialValue: canName
                    }
                  ]}
                >
                  {
                    // @ts-ignore
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
                        const allCandidates = data.bpCandidatesOnContract || [];
                        // tslint:disable-next-line:no-any
                        const dataSource = allCandidates.map((item: { name: any; }) => item.name).filter((item: any) => item && Boolean(item));
                        return (
                          // @ts-ignore
                          <AutoComplete
                            size="large"
                            dataSource={dataSource}
                            filterOption={
                              // tslint:disable-next-line:no-any
                              (inputValue:any, option: any) =>
                                String(get(option, "props.children"))
                                  .toLowerCase()
                                  .indexOf(inputValue.toLowerCase()) !== -1
                            }
                          />
                        );
                      }}
                    </Query>
                  }
                </Form.Item>
              }
            </Form>
          }
        </ModalWrapper>
      );
    }
  }
);
