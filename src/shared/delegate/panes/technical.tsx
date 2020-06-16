// @flow
// $FlowFixMe
import { Button, Form, Input, notification } from "antd";
import { FormInstance } from "antd/lib/form";
import axios from "axios";
// @ts-ignore
import window from "global/window";
import gql from "graphql-tag";
import { t } from "onefx/lib/iso-i18n";
import React, { Component, FormEvent, RefObject } from "react";
import { Mutation, MutationResult, Query, QueryResult } from "react-apollo";
import { connect } from "react-redux";
import { Preloader } from "../../common/preloader";

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

type TechDetail = {
  serverEndpoint: string;
  discordName: string;
  email: string;
  serverHealthEndpoint: string;
};

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
};

type State = {
  loading: boolean;
};

const validateServerEndpoint = (
  _: void,
  value: string,
  callback: Function
): void => {
  if (!value) {
    return callback();
  }
  const axiosInstance = axios.create({ timeout: 5000 });
  axiosInstance
    .post("/api-gateway/", {
      operationName: "validateIotexEndpoint",
      variables: { endpoint: String(value) },
      query: VALIDATE_ENDPOINT
    })
    .then(resp => {
      if (resp.data.data.validateIotexEndpoint.ok) {
        callback();
      } else {
        callback(resp.data.data.validateIotexEndpoint.message);
      }
    })
    .catch(err => {
      callback(`cannot connect to server ${err}`);
    });
};

const validateServerHealthEndpoint = (
  _: void,
  value: string,
  callback: Function
): void => {
  const str = String(value);
  if (/(http|https):\/\/([\w.]+\/?)\S*/.test(str)) {
    callback();
  } else {
    callback(t("profile.invalid_endpoint"));
  }
};

const validateEmail = (_: void, value: string, callback: Function): void => {
  const str = String(value);
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(str)) {
    callback();
  } else {
    callback(t("profile.invalid_email"));
  }
};

// $FlowFixMe
export const Technical = connect()(
  // $FlowFixMe
  class Technical extends Component<Props, State> {
    props: Props;
    state: State;

    formRef: RefObject<FormInstance> = React.createRef<FormInstance>();

    constructor(props: Props) {
      super(props);
      this.state = {
        loading: false
      };
    }

    onSubmit = (upsertBpCandidate: Function) => async (e: FormEvent) => {
      e.preventDefault();
      const form = this.formRef.current;
      if (!form) {
        return;
      }
      try {
        const values = await form.validateFields();
        window.console.log("Received values of Candidate form: ", values);

        this.setState({ loading: true });
        await upsertBpCandidate({
          variables: {
            bpCandidateTechDetailInput: {
              ...values
            }
          }
        });
        this.setState({ loading: false });
        notification.success({
          message: t("profile.change_saved")
        });
      } catch (err) {
        this.setState({ loading: false });
        notification.error({
          message: `${t("profile.change_not_saved")}: ${err}`
        });
      }
    };

    // tslint:disable-next-line:max-func-body-length
    render(): JSX.Element {
      const { candidateProfileId = "", eth = "" } = this.props;
      const request = { candidateProfileId, eth };
      return (
        // @ts-ignore
        <Query
          ssr={false}
          query={GET_BP_CANDIDATE_TECH_DETAIL}
          variables={request}
        >
          {/* tslint:disable-next-line:max-func-body-length */}
          {({
            loading,
            error,
            data
          }: QueryResult<{ bpCandidateTechDetail: TechDetail }>) => {
            if (loading) {
              return <Preloader />;
            }
            if (error && !loading) {
              notification.error({
                message: "Error",
                description: error.message,
                duration: 3
              });
              return "error when load data";
            }
            const bpCandidateTechDetail = (data &&
              data.bpCandidateTechDetail) || {
              serverEndpoint: "",
              discordName: "",
              email: "",
              serverHealthEndpoint: ""
            };
            return (
              <Mutation mutation={UPSERT_BP_CANDIDATE_TECH_DETAIL}>
                {(
                  upsertBpCandidateTechDetail: Function,
                  resp: MutationResult<{
                    upsertBpCandidateTechDetail: TechDetail;
                  }>
                ) => {
                  const newData =
                    (resp &&
                      resp.data &&
                      resp.data.upsertBpCandidateTechDetail) ||
                    bpCandidateTechDetail;
                  return (
                    // @ts-ignore
                    <Form
                      ref={this.formRef}
                      onSubmit={this.onSubmit(upsertBpCandidateTechDetail)}
                      layout={"vertical"}
                    >
                      <h1>{t("profile.technical")}</h1>
                      {/*
                // @ts-ignore */}
                      <Form.Item
                        label={t("profile.serverEndpoint")}
                        name={"serverEndpoint"}
                        initialValue={newData.serverEndpoint}
                        rules={[
                          { message: t("profile.serverEndpoint.required") },
                          { validator: validateServerEndpoint }
                        ]}
                      >
                        <Input />
                      </Form.Item>
                      {/*
                // @ts-ignore */}
                      <Form.Item
                        label={t("profile.serverHealthEndpoint")}
                        name={"serverHealthEndpoint"}
                        initialValue={newData.serverHealthEndpoint}
                        rules={[
                          {
                            required: true,
                            message: t("profile.serverEndpoint.required")
                          },
                          { validator: validateServerHealthEndpoint }
                        ]}
                      >
                        <Input />
                      </Form.Item>
                      {/*
                // @ts-ignore */}
                      <Form.Item
                        label={t("profile.discordName")}
                        name={"discordName"}
                        initialValue={newData.discordName}
                        rules={[
                          {
                            required: true,
                            message: t("profile.discordName.required")
                          }
                        ]}
                      >
                        <Input />
                      </Form.Item>
                      {/*
                // @ts-ignore */}
                      <Form.Item
                        label={t("profile.email")}
                        name={"email"}
                        initialValue={newData.email}
                        rules={[
                          {
                            required: true,
                            message: t("profile.email.required")
                          },
                          { validator: validateEmail }
                        ]}
                      >
                        <Input />
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
          }}
        </Query>
      );
    }
  }
);
