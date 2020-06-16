import Button from "antd/lib/button";
import notification from "antd/lib/notification";
import Table from "antd/lib/table";
import exportFromJSON from "export-from-json";
import gql from "graphql-tag";
import { SpinPreloader } from "iotex-react-block-producers/lib/spin-preloader";
import { t } from "onefx/lib/iso-i18n";
import React from "react";
import { PureComponent } from "react";
import { Query, QueryResult } from "react-apollo";
import { apolloClient, ownersToNames } from "../../common/apollo-client";
import { CommonMargin } from "../../common/common-margin";
import { Flex } from "../../common/flex";
import { getAntenna } from "../../common/get-antenna";
import { IopayRequired } from "../../common/iopay-required";

const GET_VOTES_REVEIVED = gql`
  query buckets($name: String!, $offset: Int, $limit: Int) {
    buckets(name: $name, offset: $offset, limit: $limit) {
      voter
      votes
      weightedVotes
      remainingDuration
      isNative
    }
  }
`;

type Props = {};

type State = {
  offset: number;
  limit: number;
};

const VotesReceivedTable = IopayRequired(
  class VotesReceivedTableInner extends PureComponent<Props, State> {
    state: State = {
      offset: 0,
      limit: 30
    };
    downloadVotes = () => {
      const registeredName =
        ownersToNames[getAntenna().iotx.accounts[0].address];
      apolloClient
        .query({
          query: GET_VOTES_REVEIVED,
          variables: { name: registeredName, offset: 0, limit: 999999999 }
        })
        .then(({ data: { buckets } }) => {
          // @ts-ignore
          const csvSource = buckets.map(({ __typename, ...data }) => {
            return { ...data, voter: data.voter.replace("0x", "") };
          }); // remove __typename field from dataSource
          exportFromJSON({
            data: csvSource,
            fileName: "transactions",
            exportType: "csv"
          });
        });
    };
    // tslint:disable-next-line:max-func-body-length
    render(): JSX.Element {
      const registeredName =
        ownersToNames[getAntenna().iotx.accounts[0].address];
      if (!registeredName) {
        return <Table />;
      }
      const { offset, limit } = this.state;
      const variables = {
        name: registeredName,
        offset,
        limit
      };
      const columns = [
        {
          title: t("delegate.votesreceived.voter"),
          dataIndex: "voter",
          key: "voter",
          render(text: string): JSX.Element {
            return (
              <div>
                {String(text)
                  .replace("0x", "")
                  .slice(0, 8)}
              </div>
            );
          }
        },
        {
          title: t("delegate.votesreceived.token_amount"),
          dataIndex: "votes",
          key: "votes",
          render(text: number): JSX.Element {
            return <span>{Math.abs(text).toLocaleString()}</span>;
          }
        },
        {
          title: t("delegate.votesreceived.token_type"),
          dataIndex: "isNative",
          key: "isNative",
          filters: [
            {
              text: t("delegate.votesreceived.native"),
              value: "IOTX"
            },
            {
              text: t("delegate.votesreceived.iotx"),
              value: "IOTX-E"
            }
          ],
          render(_: void, record: { isNative: boolean }): string {
            return record.isNative ? "IOTX" : "IOTX-E";
          },
          onFilter(value: string, record: { isNative: boolean }): boolean {
            const recordValue = record.isNative ? "IOTX" : "IOTX-E";

            return value === recordValue;
          }
        },
        {
          title: t("delegate.votesreceived.votes"),
          dataIndex: "weightedVotes",
          key: "weightedVotes"
        },
        {
          title: t("delegate.votesreceived.remaining_duration"),
          dataIndex: "remainingDuration",
          key: "remainingDuration"
        }
      ];
      return (
        <Query ssr={false} query={GET_VOTES_REVEIVED} variables={variables}>
          {({ loading, error, data }: QueryResult) => {
            if (error) {
              notification.error({
                message: "Error",
                description: `failed to get votes recieved: ${error.message}`,
                duration: 3
              });
              return null;
            }
            const { buckets = [] } = data || {};
            return (
              <SpinPreloader spinning={loading}>
                <Flex width="100%" column={true} alignItems="flex-end">
                  <Button
                    loading={loading}
                    type={"primary"}
                    onClick={this.downloadVotes}
                  >
                    {t("delegate.votesreceived.download")}
                  </Button>
                  <CommonMargin />
                </Flex>
                <Table
                  pagination={{
                    pageSize: limit,
                    onChange: page => {
                      const cOffset = page > 0 ? (page - 1) * limit : 0;
                      this.setState({
                        offset: cOffset,
                        limit
                      });
                    },
                    total:
                      buckets.length < limit
                        ? offset + limit
                        : offset + limit + 1,
                    defaultCurrent: offset / limit
                  }}
                  dataSource={buckets}
                  // @ts-ignore
                  columns={columns}
                  rowKey={"id"}
                />
              </SpinPreloader>
            );
          }}
        </Query>
      );
    }
  }
);

export { VotesReceivedTable };
