import Button from "antd/lib/button";
import notification from "antd/lib/notification";
import Table from "antd/lib/table";
import exportFromJSON from "export-from-json";
import gql from "graphql-tag";
import { SpinPreloader } from "iotex-react-block-producers/lib/spin-preloader";
import { t } from "onefx/lib/iso-i18n";
import { styled } from "onefx/lib/styletron-react";
import parse from "parse-duration";
import { PureComponent } from "react";
import React from "react";
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
  isNative: string;
  remainingDuration: string;
  voter: string;
  votes: string;
  weightedVotes: string;
  __typename: string;
};

type Props = {
  registeredName?: string;
  isPublic?: Boolean;
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
    if (!isPublic) {
      const address = await getIoPayAddress();
      const registeredName = ownersToNames[address];
      this.setState({ registeredName });
    }
  }

  downloadVotes = () => {
    let { registeredName } = this.props;
    const { isPublic = false } = this.props;
    if (!isPublic) {
      registeredName = this.state.registeredName;
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

  getUpdatedBucket = (buckets: Array<Buckets>) => {
    buckets.map((obj) => {
      const updatedDay = String(parse(obj.remainingDuration, "d")).split(".");
      const updatedHour = String(
        parse(`.${updatedDay[1] ? updatedDay[1] : 0} day`, "hr")
      ).split(".");
      const updatedMin = String(
        parse(`.${updatedHour[1] ? updatedHour[1] : 0} h`, "min")
      ).split(".");
      const updatedStr = [
        { value: updatedDay[0], unit: "d" },
        { value: updatedHour[0], unit: "h" },
        { value: updatedMin[0], unit: "m" },
      ]
        .filter((e) => e.value !== "0")
        .map((e) => `${e.value}${e.unit}`)
        .join(" ");
      obj.remainingDuration = updatedStr ? updatedStr : "0";
    });
  };

  // tslint:disable-next-line:max-func-body-length
  render(): JSX.Element {
    let { registeredName } = this.props;
    const { isPublic = false } = this.props;
    if (!isPublic) {
      registeredName = this.state.registeredName;
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
          return <div>{String(text).replace("0x", "")}</div>;
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
        render(_: void, record: { isNative: boolean }): string {
          return record.isNative ? "IOTX" : "IOTX-E";
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
      <VotesReceivedTableWrapper className="table_wrapper__votes_received">
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
