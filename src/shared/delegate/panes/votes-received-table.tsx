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
import { ownersToNames, webBpApolloClient } from "../../common/apollo-client";
import { CommonMargin } from "../../common/common-margin";
import { Flex } from "../../common/flex";
import { getIoPayAddress } from "../../common/get-antenna";

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

type Buckets = {
  isNative: String;
  remainingDuration: String;
  voter: String;
  votes: String;
  weightedVotes: String;
  __typename: String;
};

type Props = {
  registeredName?: string,
  isPublic?: Boolean
};

type State = {
  offset: number;
  limit: number;
  registeredName?: string;
};

export class VotesReceivedTable extends PureComponent<Props, State> {
    state: State = {
      offset: 0,
      limit: 30,
    };

    async componentDidMount(): Promise<void> {
      const { isPublic = false } = this.props;
      if(!isPublic){
        const address = await getIoPayAddress();
        const registeredName = ownersToNames["io1x6mar9hlfkxtcyha379fq7ald0kpmt0d3qlyv0"];
        this.setState({ registeredName });
      }
    }

    downloadVotes = () => {
      let { registeredName } = this.props;
      const { isPublic = false } = this.props;
      if(!isPublic){
        registeredName = this.state.registeredName
      }
      if (!registeredName) {
        notification.error({
          message: t("delegate.votesreceived.unregister"),
        });
        return;
      }
      webBpApolloClient
        .query({
          query: GET_VOTES_REVEIVED,
          variables: { name: registeredName, offset: 0, limit: 999999999 },
        })
        .then(({ data: { buckets } }) => {
          // @ts-ignore
          const csvSource = buckets.map(({ __typename, ...data }) => {
            return { ...data, voter: data.voter.replace("0x", "") };
          }); // remove __typename field from dataSource
          exportFromJSON({
            data: csvSource,
            fileName: "transactions",
            exportType: "csv",
          });
        });
    };

    // @ts-ignore
    getUpdatedBucket = (buckets: Array<Buckets>) => {
      // @ts-ignore
      buckets.map((obj) => {
        const val = obj.remainingDuration;
        const indexOfH = val.indexOf("h");
        const indexOfM = val.indexOf("m");
        const hours = val.substring(0, indexOfH);
        const min = val.substring(indexOfH + 1, indexOfM);
        const Days = Math.floor(Number(hours) / 24);
        const newHour = Number(hours) % 24;
        const remainingDuration = `${Days}d ${newHour}h ${min}m`;
        obj.remainingDuration = remainingDuration;
      });
    };
    // tslint:disable-next-line:max-func-body-length
    render(): JSX.Element {
      let { registeredName } = this.props;
      const { isPublic = false } = this.props;
      if(!isPublic){
        registeredName = this.state.registeredName
      }
      if (!registeredName) {
        return <Table />;
      }
      const { offset, limit } = this.state;
      const variables = {
        name: registeredName,
        offset,
        limit,
      };
      const columns = [
        {
          title: t("delegate.votesreceived.voter"),
          dataIndex: "voter",
          key: "voter",
          render(text: string): JSX.Element {
            return <div>{String(text).replace("0x", "").slice(0, 8)}</div>;
          },
        },
        {
          title: t("delegate.votesreceived.token_amount"),
          dataIndex: "votes",
          key: "votes",
          render(text: number): JSX.Element {
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
          render(_: void, record: { isNative: boolean }): string {
            return record.isNative ? "IOTX" : "IOTX-E";
          },
          onFilter(value: string, record: { isNative: boolean }): boolean {
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
        <Query
          ssr={false}
          query={GET_VOTES_REVEIVED}
          variables={variables}
          client={webBpApolloClient}
        >
          {({ loading, error, data }: QueryResult) => {
            if (error) {
              notification.error({
                message: "Error",
                description: `failed to get votes recieved: ${error.message}`,
                duration: 3,
              });
              return null;
            }
            const { buckets = [] } = data || {};
            // @ts-ignore
            if (buckets.length > 0) {
              this.getUpdatedBucket(buckets);
            }
            return (
              <SpinPreloader spinning={loading}>
                {
                  // tslint:disable-next-line:use-simple-attributes
                  <Flex
                    display={isPublic ? "none" : "flex"}
                    width="100%"
                    column={true}
                    alignItems="flex-end">
                    <Button
                      loading={loading}
                      type={"primary"}
                      onClick={this.downloadVotes}
                    >
                      {t("delegate.votesreceived.download")}
                    </Button>
                    <CommonMargin />
                  </Flex>
                }
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

