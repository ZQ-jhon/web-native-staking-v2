import Button from "antd/lib/button";
import notification from "antd/lib/notification";
import Table, {ColumnType} from "antd/lib/table";
import exportFromJSON from "export-from-json";
import {fromRau} from "iotex-antenna/lib/account/utils";
import {SpinPreloader} from "iotex-react-block-producers/lib/spin-preloader";
import {t} from "onefx/lib/iso-i18n";
import {styled} from "onefx/lib/styletron-react";
import parse from "parse-duration";
import React, {PureComponent} from "react";
import {Query, QueryResult} from "react-apollo";
import {getStaking} from "../../../server/gateway/staking";
import {analyticsApolloClient, ownersToNames} from "../../common/apollo-client";
import {CommonMargin} from "../../common/common-margin";
import {Flex} from "../../common/flex";
import {getIoPayAddress} from "../../common/get-antenna";
import {numberWithCommas, secondsToDuration} from "../../common/number-util";
import {GET_BUCKETS_BY_CANDIDATE} from "../../staking/smart-contract-gql-queries";

type Buckets = {
  isNative: boolean;
  remainingDuration: string;
  voterIotexAddress: string;
  votes: string;
  weightedVotes: string;
  __typename: string
};

type Props = {
  registeredName?: string;
  isPublic?: Boolean;
};

type State = {
  offset: number;
  limit: number;
  startEpoch: number;
  registeredName?: string;
};

export class VotesReceivedTable extends PureComponent<Props, State> {
  state: State = {
    offset: 0,
    limit: 30,
    startEpoch: 0,
  };

  async componentDidMount(): Promise<void> {
    const { isPublic = false } = this.props;
    if (!isPublic) {
      const address = await getIoPayAddress();
      const registeredName = ownersToNames[address];
      this.setState({ registeredName });
    }
    const epochData = await getStaking().getEpochData();
    this.setState({ startEpoch: epochData.num });
  }

  downloadVotes = (startEpoch:number) => {
    let { registeredName } = this.props;
    const { isPublic = false} = this.props;
    if (!isPublic) {
      registeredName = this.state.registeredName;
    }
    if (!registeredName) {
      notification.error({
        message: t("delegate.votesreceived.unregister"),
      });
      return;
    }

    if (startEpoch>0){
      analyticsApolloClient
        .query({
          query: GET_BUCKETS_BY_CANDIDATE,
          variables: {
            startEpoch: startEpoch-1,
            epochCount: 1,
            delegateName: registeredName,
            pagination: { skip: 0, first: 500 }
          },
        })
        .then(({ data: { delegate: {bucketInfo:{bucketInfoList}} } }) => {
          if(bucketInfoList && bucketInfoList.length > 0){
            const csvSource = bucketInfoList[0].bucketInfo;
            csvSource.forEach((bucket: Buckets) => {
              delete bucket.__typename;
            });
            exportFromJSON({
              data: csvSource,
              fileName: `votes_received_${registeredName}`,
              exportType: "csv",
            });
          }
        });
    }
  };

  columns:Array<ColumnType<Buckets>> = [
    {
      title: t("delegate.votesreceived.voter"),
      dataIndex: "voterIotexAddress",
      key: "voterIotexAddress",
      width: "10vw",
      ellipsis: true,
      render(text: string): JSX.Element {
        return <span className="ellipsis-text" style={{ minWidth: 95 }}>{text}</span>;
      },
    },
    {
      title: t("delegate.votesreceived.token_amount"),
      dataIndex: "votes",
      key: "votes",
      width: "12vw",
      ellipsis: true,
      render(votes: string): JSX.Element {
        return <span>{`${numberWithCommas(fromRau(votes, "iotx"))}`}</span>;
      },
    },
    {
      title: t("delegate.votesreceived.token_type"),
      dataIndex: "isNative",
      width: "6vw",
      key: "isNative",
      ellipsis: true,
      render(_: void, record: { isNative: boolean }): string {
        return record.isNative ? "IOTX" : "IOTX-E";
      },
    },
    {
      title: t("delegate.votesreceived.votes"),
      dataIndex: "weightedVotes",
      key: "weightedVotes",
      width: "18vw",
      ellipsis: true,
      render(weightedVotes: string): JSX.Element {
        return <span>{`${numberWithCommas(fromRau(weightedVotes, "iotx"))}`}</span>;
      },
    },
    {
      title: t("delegate.votesreceived.remaining_duration"),
      dataIndex: "remainingDuration",
      key: "remainingDuration",
      width: "16vw",
      ellipsis: true,
      render: (text: string) => {
        const duration = parse(text);
        return <span style={{ minWidth: 100 }}>{duration?secondsToDuration(duration/1000):text}</span>;
      },
    },
  ];

  render(): JSX.Element {
    let { registeredName } = this.props;
    const { startEpoch } = this.state;
    const { isPublic = false } = this.props;
    if (!isPublic) {
      registeredName = this.state.registeredName;
    }
    if (!registeredName) {
      return <Table />;
    }

    if (startEpoch<=1){
      return <Table />;
    }

    const { offset, limit } = this.state;
    const variables = {
      startEpoch: startEpoch-1,
      epochCount: 1,
      delegateName: registeredName,
      pagination: { skip: offset, first: limit }
    };

    return (
      <VotesReceivedTableWrapper className="table_wrapper__votes_received">
        <Query
          ssr={false}
          query={GET_BUCKETS_BY_CANDIDATE}
          variables={variables}
          client={analyticsApolloClient}
        >
          {({ loading, error, data }: QueryResult<{
            delegate: {
              bucketInfo: {
                bucketInfoList: Array<{
                  count: number,
                  bucketInfo: Array<Buckets>
                }>
              }
            }
          }>) => {
            if (error) {
              notification.error({
                message: "Error",
                description: `failed to get votes recieved: ${error.message}`,
                duration: 3,
              });
              return <></>;
            }

            const buckets = data&&data.delegate.bucketInfo.bucketInfoList.length>0?data.delegate.bucketInfo.bucketInfoList[0].bucketInfo:[];
            const total = data&&data.delegate.bucketInfo.bucketInfoList.length>0?data.delegate.bucketInfo.bucketInfoList[0].count:0;

            return (
              <SpinPreloader spinning={loading}>
                {
                  // tslint:disable-next-line:use-simple-attributes
                  <Flex
                    display={isPublic ? "none" : "flex"}
                    width="100%"
                    column={true}
                    alignItems="flex-end"
                  >
                    <Button
                      loading={loading}
                      type={"primary"}
                      onClick={() => this.downloadVotes(startEpoch)}
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
                    total,
                  }}
                  dataSource={buckets}
                  columns={this.columns}
                  rowKey={"id"}
                />
              </SpinPreloader>
            );
          }}
        </Query>
      </VotesReceivedTableWrapper>
    );
  }
}

const VotesReceivedTableWrapper = styled("div", () => ({
  width: "100%",
  padding: "0 1em",
  "& .ant-table-content": {
    overflowX: "auto",
  },
}));
