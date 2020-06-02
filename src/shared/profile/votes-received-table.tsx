// @flow
import React, { PureComponent } from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
// $FlowFixMe
import { Table, notification, Button } from "antd";
import { t } from "onefx/lib/iso-i18n";
import exportFromJSON from "export-from-json";
import { apolloClient } from "../common/apollo-client";
import { SpinPreloader } from "../common/spin-preloader";
import { Flex } from "../common/flex";
import { CommonMargin } from "../common/common-margin";

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

type Props = {
  registeredName: string;
  isPublic?: Boolean;
};

type State = {
  offset: number;
  limit: number;
};

class VotesReceivedTable extends PureComponent<Props, State> {
  state: State = {
    offset: 0,
    limit: 30,
  };
  downloadVotes = () => {
    const { registeredName } = this.props;
    apolloClient
      .query({
        query: GET_VOTES_REVEIVED,
        variables: { name: registeredName },
      })
      .then(({ data: { buckets } }) => {
        /* tslint:disable-next-line:no-any */
        const csvSource = buckets.map(({ __typename, ...data }: any) => data); // remove __typename field from dataSource
        exportFromJSON({
          data: csvSource,
          fileName: "transactions",
          exportType: "csv",
        });
      });
  };
  render() {
    const { registeredName, isPublic } = this.props;
    const { offset, limit } = this.state;
    const variables = {
      name: registeredName,
      // name: 'robotbp00000', // use for dev
      offset,
      limit,
    };
    const columns = [
      {
        title: t("delegate.votesreceived.voter"),
        dataIndex: "voter",
        key: "voter",
        render(text: string) {
          return <div>{String(text).slice(0, 8)}</div>;
        },
      },
      {
        title: t("delegate.votesreceived.token_amount"),
        dataIndex: "votes",
        key: "votes",
        render(text: number) {
          return <span>{Math.abs(text).toLocaleString()}</span>;
        },
      },
      {
        title: t("delegate.votesreceived.token_type"),
        dataIndex: "isNative",
        key: "isNative",
        filters: [
          {
            text: t("delegate.votesreceived.native"),
            value: "IOTX",
          },
          {
            text: t("delegate.votesreceived.iotx"),
            value: "IOTX-E",
          },
        ],
        /* tslint:disable-next-line:no-any */
        render(_text: string, record: any) {
          return record.isNative ? "IOTX" : "IOTX-E";
        },
        /* tslint:disable-next-line:no-any */
        onFilter(value: string | number | boolean, record: any) {
          const recordValue = record.isNative ? "IOTX" : "IOTX-E";

          return value === recordValue;
        },
      },
      {
        title: t("delegate.votesreceived.votes"),
        dataIndex: "weightedVotes",
        key: "weightedVotes",
      },
      {
        title: t("delegate.votesreceived.remaining_duration"),
        dataIndex: "remainingDuration",
        key: "remainingDuration",
      },
    ];
    return (
      // @ts-ignore
      <Query ssr={false} query={GET_VOTES_REVEIVED} variables={variables}>
        {/* tslint:disable-next-line:no-any */}
        {({ loading, error, data }: any) => {
          if (error) {
            notification.error({
              message: "Error",
              description: `failed to get votes recieved: ${error.message}`,
              duration: 3,
            });
            return null;
          }
          const { buckets = [] } = data || {};
          return (
            <SpinPreloader spinning={loading}>
              <Flex
                display={isPublic ? "none" : "flex"}
                width="100%"
                column={true}
                alignItems="flex-end"
              >
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
                  onChange: (page) => {
                    const cOffset = page > 0 ? (page - 1) * limit : 0;
                    this.setState({
                      offset: cOffset,
                      limit,
                    });
                  },
                  total:
                    buckets.length < limit
                      ? offset + limit
                      : offset + limit + 1,
                  defaultCurrent: offset / limit,
                }}
                dataSource={buckets}
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

export { VotesReceivedTable };
