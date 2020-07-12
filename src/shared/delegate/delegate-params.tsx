import Form from "antd/lib/form";
import notification from "antd/lib/notification";
import { get } from "dottie";
import gql from "graphql-tag";
import { t } from "onefx/lib/iso-i18n";
import React from "react";
import { Query, QueryResult } from "react-apollo";
import { TBpCandidate } from "../../types";
import {
  explorerApolloClient,
  webBpApolloClient,
} from "../common/apollo-client";
import { CommonMargin } from "../common/common-margin";
import { ProbationHistoryRate } from "./probation-history-rate";

export const GET_BP_CANDIDATES = gql`
  query bpCandidatesOnContract($address: String) {
    bpCandidatesOnContract(address: $address) {
      ioRewardAddr
      ioOperatorAddr
    }
  }
`;

export const GET_CHAIN_META = gql`
  query {
    chainMeta {
      height
      epoch {
        num
        height
      }
    }
  }
`;

export const DelegateParams = ({ data }: { data: TBpCandidate }) => {
  const registeredName = data && data.registeredName;
  const probationHistoryRate = registeredName ? (
    <Query query={GET_CHAIN_META} client={explorerApolloClient}>
      {({ loading, error, data }: QueryResult) => {
        if (error) {
          notification.error({
            message: `failed to query chain meta in Params page`,
          });
          window.console.log(
            `DelegateParams failed to query chain meta`,
            error
          );
          return <></>;
        }
        if (!data || loading) {
          return <></>;
        }
        const endEpochNumber = parseInt(get(data, "chainMeta.epoch.num"), 10);
        return (
          <ProbationHistoryRate
            endEpochNumber={endEpochNumber}
            delegateName={registeredName}
          />
        );
      }}
    </Query>
  ) : (
    // @ts-ignore
    <Form layout={"vertical"}>
      <Form.Item label={t("delegate.params.probationHistoricalRate")}>
        {t("delegate.params.no_registered_name")}
      </Form.Item>
    </Form>
  );
  return (
    <CommonMargin>
      <Query
        client={webBpApolloClient}
        query={GET_BP_CANDIDATES}
        variables={{ address: data.tempEthAddress }}
      >
        {({ data }: QueryResult) => {
          const bpCandidates = (data && data.bpCandidatesOnContract) || [];
          const bpCandidate = bpCandidates[0];
          const ioRewardAddr = bpCandidate && bpCandidate.ioRewardAddr;
          const ioOperatorAddr = bpCandidate && bpCandidate.ioOperatorAddr;
          // @ts-ignore
          // tslint:disable-next-line:no-unnecessary-local-variable
          const el = <Form layout={"vertical"}>
            <Form.Item label={t("delegate.params.reward")}>
              {ioRewardAddr}
            </Form.Item>
            <Form.Item label={t("delegate.params.operator")}>
              {ioOperatorAddr}
            </Form.Item>
          </Form>
          return el;
        }}
      </Query>
      {probationHistoryRate}
    </CommonMargin>
  );
};
