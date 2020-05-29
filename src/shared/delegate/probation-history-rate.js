// @flow
import React, { Component } from "react";
import { t } from "onefx/lib/iso-i18n";
// $FlowFixMe
import { Form, notification } from "antd";
import { get } from "dotty";
import { Query } from "react-apollo";
import { analyticsApolloClient } from "../common/apollo-client";
import { SpinPreloader } from "../common/spin-preloader";
import { GET_PROBATION_HISTORICAL_RATE } from "./delegate-params";
import window from "global/window";
import { Buffer } from "buffer";
import { getAntenna } from "../common/get-antenna";
import { connect } from "react-redux";

type State = {
  startEpoch: string
};
type Props = {
  endEpochNumber: number,
  delegateName: string,
  easterHeight?: string
};

const START_EPOCH = "";

@connect(state => ({ easterHeight: state.base.easterHeight }))
class ProbationHistoryRate extends Component<Props, State> {
  constructor() {
    super();
    this.state = {
      startEpoch: START_EPOCH
    };
  }

  async componentDidMount() {
    const { easterHeight } = this.props;
    if (easterHeight && !this.state.startEpoch) {
      const antenna = getAntenna();
      const state = await antenna.iotx.readState({
        protocolID: Buffer.from("rolldpos"),
        methodName: Buffer.from("EpochNumber"),
        arguments: [Buffer.from(easterHeight)]
      });
      if (state && state.data) {
        window.console.log("state.data", state.data);
        // eslint-disable-next-line no-undef
        const startEpoch = new TextDecoder("utf-8").decode(state.data);
        window.console.log("startEpoch", startEpoch);
        this.setState({
          startEpoch
        });
      }
    }
  }

  render() {
    const { endEpochNumber, delegateName } = this.props;
    const { startEpoch } = this.state;
    if (!startEpoch) return "";
    const startEpochNumber = parseInt(startEpoch);
    if (Number.isNaN(startEpochNumber)) return "";
    return (
      <Query
        query={GET_PROBATION_HISTORICAL_RATE}
        variables={{
          startEpoch: startEpochNumber,
          epochCount: endEpochNumber - startEpochNumber + 1,
          delegateName
        }}
        client={analyticsApolloClient}
      >
        {({ data, loading, error }) => {
          if (error) {
            notification.error({
              message: `failed to query probationHistoricalRate`
            });
          }
          const probationHistoricalRate =
            get(data, "delegate.probationHistoricalRate") || 0;
          return (
            <SpinPreloader spinning={loading}>
              <Form>
                <Form.Item label={t("delegate.params.probationHistoricalRate")}>
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

export { ProbationHistoryRate };
