// @flow
import Button from "antd/lib/button";
import notification from "antd/lib/notification";
import Table from "antd/lib/table";
import { get } from "dottie";
import exportFromJSON from "export-from-json";
import gql from "graphql-tag";
import { fromRau } from "iotex-antenna/lib/account/utils";
import { t } from "onefx/lib/iso-i18n";
import React, { Component } from "react";
import { Query, QueryResult } from "react-apollo";
import { analyticsApolloClient } from "../../common/apollo-client";
import { CommonMargin } from "../../common/common-margin";
import { Flex } from "../../common/flex";
import { colors } from "../../common/styles/style-color2";
import {
  BookkeeperParams,
  CalcRewardsForm,
} from "./distribution/clac-rewards-form";

export const GET_BP_REWARDS = gql`
  query delegate(
    $startEpoch: Int!
    $epochCount: Int!
    $delegateName: String!
    $percentage: Int!
    $includeFoundationBonus: Boolean!
    $pagination: Pagination
  ) {
    delegate(
      startEpoch: $startEpoch
      epochCount: $epochCount
      delegateName: $delegateName
    ) {
      bookkeeping(
        percentage: $percentage
        includeFoundationBonus: $includeFoundationBonus
      ) {
        exist
        rewardDistribution(pagination: $pagination) {
          voterEthAddress
          voterIotexAddress
          amount
        }
        count
      }
    }
  }
`;

type State = {
  showTable: boolean;
  variables?: BookkeeperParams;
};
type Props = {
  registeredName: string;
};

class DelegateRewards extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showTable: false,
      variables: undefined,
    };
  }

  // tslint:disable-next-line:max-func-body-length
  render(): JSX.Element {
    const { registeredName } = this.props;
    const { variables } = this.state;

    const onSubmit = (value: BookkeeperParams) => {
      this.setState({
        variables: value,
        showTable: true,
      });
    };
    // tslint:disable-next-line:no-any
    const downloadRewards = (data: any) => () => {
      if (!variables) {
        return;
      }
      const {
        startEpoch,
        epochCount,
        delegateName,
        percentage,
        includeFoundationBonus,
      } = variables;

      exportFromJSON({
        data: data,
        fileName: `${delegateName}-${startEpoch}-${epochCount}-${percentage}-${String(
          Boolean(includeFoundationBonus)
        )}`,
        exportType: "csv",
      });
    };
    const columns = [
      {
        title: t("delegate.votesreceived.voter"),
        dataIndex: "voterAddress",
      },
      {
        title: t("delegate.rewards"),
        dataIndex: "amount",
        render: (text: string) =>
          `${Number(fromRau(text, "iotx")).toFixed(3)} IOTX`,
      },
    ];
    return (
      <div style={{ background: colors.white, padding: "1rem" }}>
        {this.state.showTable ? (
          <Query
            client={analyticsApolloClient}
            query={GET_BP_REWARDS}
            variables={{
              ...variables,
              pagination: { skip: 0, first: 500 },
            }}
          >
            {({ loading, error, data }: QueryResult) => {
              if (error) {
                notification.error({
                  message: `failed to fetch rewards: ${String(error)}`,
                });
                this.setState({ showTable: false });
              }
              let dataSource: Array<{
                voterAddress: string;
                amount: string;
              }> = [];
              const source: Array<{
                voterEthAddress: string;
                amount: string;
              }> = get(data, "delegate.bookkeeping.rewardDistribution");

              if (source) {
                dataSource = source.map(({ voterEthAddress, amount }) => ({
                  voterAddress: voterEthAddress,
                  amount,
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
          // tslint:disable-next-line:use-simple-attributes
          <CalcRewardsForm
            isPublic={true}
            onSubmit={onSubmit}
            delegateName={registeredName}
            startEpoch={variables && variables.startEpoch}
            count={variables && variables && variables.epochCount}
            includeFoundationBonus={
              variables && variables && variables.includeFoundationBonus
            }
            percentage={variables && variables && variables.percentage}
          />
        )}
        <CommonMargin />
      </div>
    );
  }
}

export { DelegateRewards };
