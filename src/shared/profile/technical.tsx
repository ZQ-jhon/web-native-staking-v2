// @flow
import React, { Component } from "react";
// @ts-ignore
import window from "global/window";
import gql from "graphql-tag";
import { Query, Mutation } from "react-apollo";
import { connect } from "react-redux";
import { t } from "onefx/lib/iso-i18n";
// $FlowFixMe
import { Button, Input, notification } from "antd";
import { Form } from "@ant-design/compatible";
import axios from "axios";

const GET_BP_CANDIDATE_TECH_DETAIL = gql`
  query bpCandidateTechDetail {
    bpCandidateTechDetail {
      serverEndpoint
      discordName
      email
      serverHealthEndpoint
    }
  }
`;

const UPSERT_BP_CANDIDATE_TECH_DETAIL = gql`
  mutation upsertBpCandidateTechDetail(
    $bpCandidateTechDetailInput: BpCandidateTechDetailInput!
  ) {
    upsertBpCandidateTechDetail(
      bpCandidateTechDetailInput: $bpCandidateTechDetailInput
    ) {
      serverEndpoint
      discordName
      email
      serverHealthEndpoint
    }
  }
`;

const VALIDATE_ENDPOINT = `
query validateIotexEndpoint($endpoint: String!) {
  validateIotexEndpoint(endpoint: $endpoint) {
    ok
    message
  }
}
`;

type Props = {
  candidateProfileId?: string;
  eth?: string;
  /* tslint:disable-next-line:no-any */
  form: any;
};

type State = {
  loading: boolean;
};
/* tslint:disable-next-line:no-any */
const validateServerEndpoint = (_rule: any, value: any, callback: any) => {
  if (!value) {
    return callback();
  }
  const axiosInstance = axios.create({ timeout: 5000 });
  axiosInstance
    .post("/api-gateway/", {
      operationName: "validateIotexEndpoint",
      variables: { endpoint: String(value) },
      query: VALIDATE_ENDPOINT,
    })
    .then((resp) => {
      if (resp.data.data.validateIotexEndpoint.ok) {
        callback();
      } else {
        callback(resp.data.data.validateIotexEndpoint.message);
      }
    })
    .catch((err) => {
      callback(`cannot connect to server ${err}`);
    });
};
/* tslint:disable-next-line:no-any */
const validateServerHealthEndpoint = (
  _rule: any,
  value: any,
  callback: Function
) => {
  const str = String(value);
  if (/(http|https):\/\/([\w.]+\/?)\S*/.test(str)) {
    callback();
  } else {
    callback(t("profile.invalid_endpoint"));
  }
};

/* tslint:disable-next-line:no-any */
const validateEmail = (_rule: any, value: any, callback: Function) => {
  const str = String(value);
  /* eslint-disable no-useless-escape */
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(str)) {
    callback();
  } else {
    callback(t("profile.invalid_email"));
  }
};

// $FlowFixMe
export const Technical = connect()(
  // $FlowFixMe
  Form.create({ name: "technical-form" })(
    class Technical extends Component<Props, State> {
      props: Props;
      state: State;

      constructor(props: Props) {
        super(props);
        this.state = {
          loading: false,
        };
      }
      /* tslint:disable-next-line:no-any */
      onSubmit = (upsertBpCandidate: Function) => (e: any) => {
        e.preventDefault();
        /* eslint-disable no-invalid-this */
        /* tslint:disable-next-line:no-any */
        this.props.form.validateFields(async (err: any, values: any) => {
          if (!err) {
            window.console.log("Received values of Candidate form: ", values);

            this.setState({ loading: true });
            upsertBpCandidate({
              variables: {
                bpCandidateTechDetailInput: {
                  ...values,
                },
              },
            })
              .then(() => {
                this.setState({ loading: false });
                notification.success({
                  message: t("profile.change_saved"),
                });
              })
              .catch((err: string) => {
                // server error
                this.setState({ loading: false });
                notification.error({
                  message: `${t("profile.change_not_saved")}: ${err}`,
                });
              });
          }
        });
      };

      render() {
        const { getFieldDecorator } = this.props.form;

        // const { candidateProfileId = "", eth = "" } = this.props;
        // const request = { candidateProfileId, eth };
        return (
          // // @ts-ignore
          // <Query
          //   ssr={false}
          //   query={GET_BP_CANDIDATE_TECH_DETAIL}
          //   variables={request}
          // >
          //   {/* tslint:disable-next-line:no-any */}
          //   {({ loading, error, data }: any) => {
          //     if (error && !loading) {
          //       notification.error({
          //         message: "Error",
          //         description: error.message,
          //         duration: 3,
          //       });
          //       return "error when load data";
          //     }
          //     const bpCandidateTechDetail =
          //       (data && data.bpCandidateTechDetail) || {};
          //     return (
               // @ts-ignore
                <Mutation mutation={UPSERT_BP_CANDIDATE_TECH_DETAIL}>
                  {/* tslint:disable-next-line:no-any */}
                  {(upsertBpCandidateTechDetail: any, resp: any) => {
                    const newData =
                      (resp &&
                        resp.data &&
                        resp.data.upsertBpCandidateTechDetail);
                    return (
                      <Form
                        onSubmit={this.onSubmit(upsertBpCandidateTechDetail)}
                      >
                        <h1>{t("profile.technical")}</h1>
                      <Form.Item label={t("profile.serverEndpoint")}>
                          {getFieldDecorator("serverEndpoint", {
                            initialValue: newData && newData.serverEndpoint,
                            rules: [
                              { message: t("profile.serverEndpoint.required") },
                              { validator: validateServerEndpoint },
                            ],
                          })(<Input />)}
                        </Form.Item>
                        <Form.Item label={t("profile.serverHealthEndpoint")}>
                          {getFieldDecorator("serverHealthEndpoint", {
                            initialValue: newData && newData.serverHealthEndpoint,
                            rules: [
                              {
                                required: true,
                                message: t("profile.serverHealthEndpoint.required"),
                              },
                              { validator: validateServerHealthEndpoint },
                            ],
                          })(<Input />)}
                        </Form.Item>
                        <Form.Item label={t("profile.discordName")}>
                          {getFieldDecorator("discordName", {
                            initialValue: newData && newData.discordName,
                            rules: [
                              {
                                required: true,
                                message: t("profile.discordName.required"),
                              },
                            ],
                          })(<Input />)}
                        </Form.Item>
                        <Form.Item label={t("profile.email")}>
                          {getFieldDecorator("email", {
                            initialValue: newData && newData.email,
                            rules: [
                              {
                                required: true,
                                message: t("profile.email.required"),
                              },
                              { validator: validateEmail },
                            ],
                          })(<Input />)}
                        </Form.Item>

                        <Form.Item>
                          <Button
                            type="primary"
                            htmlType="submit"
                            style={{ marginRight: "10px" }}
                            loading={this.state.loading}
                            onClick={this.onSubmit(upsertBpCandidateTechDetail)}
                          >
                            {t("profile.update")}
                          </Button>
                        </Form.Item>
                      </Form>
                    );
                  }}
                </Mutation>
              );
      //       }}
      //     </Query>
      //   );
       }
    }
  )
);
