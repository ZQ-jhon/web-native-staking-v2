// @flow
import React, { Component } from "react";
import { t } from "onefx/lib/iso-i18n";
// $FlowFixMe
import { Table, Button, notification } from "antd";
import { fromRau } from "iotex-antenna/lib/account/utils";
import { get } from "dotty";
import exportFromJSON from "export-from-json";
import { Query } from "react-apollo";
import { CommonMargin } from "../common/common-margin";
import { CalcRewardsForm } from "../profile/distribution/clac-rewards-form";
import type { BookkeeperParams } from "../profile/distribution/clac-rewards-form";
import { colors } from "../common/styles/style-color2";
import { analyticsApolloClient } from "../common/apollo-client";
import { Flex } from "../common/flex";
import { GET_BP_REWARDS } from "../home/voting-gql-queries";

type State = {
  showTable: boolean,
  variables: BookkeeperParams
};
type Props = {
  registeredName: string
};

class DelegateRewards extends Component<Props, State> {
  constructor() {
    super();
    this.state = {
      showTable: false,
      variables: {}
    };
  }

  render() {
    const { registeredName } = this.props;
    const {
      startEpoch,
      epochCount,
      delegateName,
      percentage,
      includeFoundationBonus
    } = this.state.variables;
    const onSubmit = value => {
      this.setState({
        variables: value,
        showTable: true
      });
    };
    const downloadRewards = (data: any) => () => {
      exportFromJSON({
        data: data,
        fileName: `${delegateName}-${startEpoch}-${epochCount}-${percentage}-${String(
          Boolean(includeFoundationBonus)
        )}`,
        exportType: "csv"
      });
    };
    const columns = [
      {
        title: t("delegate.votesreceived.voter"),
        dataIndex: "voterAddress"
      },
      {
        title: t("delegate.rewards"),
        dataIndex: "amount",
        render: (text: any) => `${Number(fromRau(text)).toFixed(3)} IOTX`
      }
    ];
    return (
      <div style={{ background: colors.white, padding: "1rem" }}>
        {this.state.showTable ? (
          <Query
            client={analyticsApolloClient}
            query={GET_BP_REWARDS}
            variables={{
              ...this.state.variables,
              pagination: { skip: 0, first: 500 }
            }}
          >
            {({ data, loading, error }) => {
              if (error) {
                notification.error({
                  message: `failed to fetch rewards: ${String(error)}`
                });
                this.setState({ showTable: false });
              }
              let dataSource = [];
              const source = get(
                data,
                "delegate.bookkeeping.rewardDistribution"
              );

              if (source) {
                dataSource = source.map(({ voterEthAddress, amount }) => ({
                  voterAddress: voterEthAddress,
                  amount
                }));
              }

              return (
                <div>
                  <Flex width="100%" column={true} alignItems="flex-end">
                    <CommonMargin />
                    <Button
                      loading={loading}
                      type={"primary"}
                      onClick={downloadRewards(dataSource)}
                    >
                      {t("delegate.rewards_download")}
                    </Button>
                    <CommonMargin />
                  </Flex>
                  <Table
                    columns={columns}
                    loading={loading}
                    dataSource={dataSource}
                  />
                </div>
              );
            }}
          </Query>
        ) : (
          <CalcRewardsForm
            isPublic
            onSubmit={onSubmit}
            delegateName={registeredName}
            startEpoch={this.state.variables.startEpoch}
            count={this.state.variables.epochCount}
            includeFoundationBonus={this.state.variables.includeFoundationBonus}
            percentage={this.state.variables.percentage}
          />
        )}
        <CommonMargin />
      </div>
    );
  }
}

export { DelegateRewards };
