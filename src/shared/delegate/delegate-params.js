// $FlowFixMe
// @flow
// $FlowFixMe
import { Form, notification } from "antd";
import { t } from "onefx/lib/iso-i18n";
import { CommonMargin } from "../common/common-margin";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { get } from "dotty";
import { explorerApolloClient } from "../common/apollo-client";
import React from "react";
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

export const GET_PROBATION_HISTORICAL_RATE = gql`
  query probationHistoricalRate(
    $startEpoch: Int!
    $epochCount: Int!
    $delegateName: String!
  ) {
    delegate(
      startEpoch: $startEpoch
      epochCount: $epochCount
      delegateName: $delegateName
    ) {
      probationHistoricalRate
    }
  }
`;
export const DelegateParams = ({ data }: any) => {
  const registeredName = data && data.registeredName;
  const probationHistoryRate = registeredName ? (
    <Query query={GET_CHAIN_META} client={explorerApolloClient}>
      {({ data, loading, error }) => {
        if (error) {
          notification.error({
            message: `failed to query chain meta in Params page`
          });
        }
        if (!data || loading) {
          return null;
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
    <Form>
      <Form.Item label={t("delegate.params.probationHistoricalRate")}>
        {t("delegate.params.no_registered_name")}
      </Form.Item>
    </Form>
  );
  return (
    <CommonMargin>
      <Query
        query={GET_BP_CANDIDATES}
        variables={{ address: data.tempEthAddress }}
      >
        {({ data }) => {
          const bpCandidates = (data && data.bpCandidatesOnContract) || [];
          const bpCandidate = bpCandidates[0];
          const ioRewardAddr = bpCandidate && bpCandidate.ioRewardAddr;
          const ioOperatorAddr = bpCandidate && bpCandidate.ioOperatorAddr;
          return (
            <Form>
              <Form.Item label={t("delegate.params.reward")}>
                {ioRewardAddr}
              </Form.Item>
              <Form.Item label={t("delegate.params.operator")}>
                {ioOperatorAddr}
              </Form.Item>
            </Form>
          );
        }}
      </Query>
      {probationHistoryRate}
    </CommonMargin>
  );
};
