import Form from "antd/lib/form";
import notification from "antd/lib/notification";
import { Buffer } from "buffer";
import { get } from "dottie";
// @ts-ignore
import window from "global/window";
import gql from "graphql-tag";
import { SpinPreloader } from "iotex-react-block-producers/lib/spin-preloader";
import { t } from "onefx/lib/iso-i18n";
import React, { Component } from "react";
import { Query, QueryResult } from "react-apollo";
import { connect } from "react-redux";
import { analyticsApolloClient } from "../common/apollo-client";
import { getAntenna } from "../common/get-antenna";

const GET_PROBATION_HISTORICAL_RATE = gql`
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

type State = {
  startEpoch: string;
};
type Props = {
  endEpochNumber: number;
  delegateName: string;
  easterHeight?: string;
};

const START_EPOCH = "";

export const ProbationHistoryRate = connect(
  (state: { base: { easterHeight: string } }) => ({
    easterHeight: state.base.easterHeight,
  })
)(
  class ProbationHistoryRateInner extends Component<Props, State> {
    constructor(props: Props) {
      super(props);
      this.state = {
        startEpoch: START_EPOCH,
      };
    }

    async componentDidMount(): Promise<void> {
      const { easterHeight } = this.props;
      if (easterHeight && !this.state.startEpoch) {
        const antenna = getAntenna();
        const args = {
          protocolID: Buffer.from("rolldpos"),
          methodName: Buffer.from("EpochNumber"),
          arguments: [Buffer.from(easterHeight)],
        };
        // @ts-ignore
        const state = await antenna.iotx.readState(args);
        if (state && state.data) {
          window.console.log("state.data", state.data);
          // eslint-disable-next-line no-undef
          const startEpoch = new TextDecoder("utf-8").decode(state.data);
          window.console.log("startEpoch", startEpoch);
          this.setState({
            startEpoch,
          });
        }
      }
    }

    render(): JSX.Element {
      const { endEpochNumber, delegateName } = this.props;
      const { startEpoch } = this.state;
      if (!startEpoch) {
        return <></>;
      }
      // tslint:disable-next-line:radix
      const startEpochNumber = parseInt(startEpoch);
      if (Number.isNaN(startEpochNumber)) {
        return <></>;
      }
      return (
        <Query
          query={GET_PROBATION_HISTORICAL_RATE}
          variables={{
            startEpoch: startEpochNumber,
            epochCount: endEpochNumber - startEpochNumber + 1,
            delegateName,
          }}
          client={analyticsApolloClient}
        >
          {({ loading, error, data }: QueryResult) => {
            if (error) {
              notification.error({
                message: `failed to query probationHistoricalRate`,
              });
              window.console.log(
                `ProbationHistoryRateInner failed to query probationHistoricalRate`,
                error
              );
              return <></>;
            }
            const probationHistoricalRate: number =
              get(data, "delegate.probationHistoricalRate") || 0;
            return (
              <SpinPreloader spinning={loading}>
                {/*
             // @ts-ignore */}
                <Form layout={"vertical"}>
                  <Form.Item
                    label={t("delegate.params.probationHistoricalRate")}
                  >
                    {`${probationHistoricalRate * 100}%`}
                  </Form.Item>
                </Form>
              </SpinPreloader>
            );
          }}
        </Query>
      );
    }
  }
);
