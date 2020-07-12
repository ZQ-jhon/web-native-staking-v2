import notification from "antd/lib/notification";
import {SpinPreloader} from "iotex-react-block-producers/lib/spin-preloader";
import React, { Component } from "react";
import {Query, QueryResult} from "react-apollo";
import { withRouter } from "react-router";
import {TBpCandidate} from "../../types";
import {webBpApolloClient} from "../common/apollo-client";
import { CommonMargin } from "../common/common-margin";
import { Flex } from "../common/flex";
import { colors } from "../common/styles/style-color2";
import {GET_BP_CANDIDATE} from "../staking/smart-contract-gql-queries";
import {Props} from "./delegate-content";
import {VotesReceivedTable} from "./panes/votes-received-table";

class VotesReceived extends Component<Props> {

  render(): JSX.Element {
    const { match } = this.props;
    if (!match || !match.params || !match.params.id) {
      return <></>;
    }
    const request = { candidateProfileId: match.params.id, eth: "" };
    return (
      <Query
        ssr={false}
        query={GET_BP_CANDIDATE}
        variables={request}
        client={webBpApolloClient}
      >
        {({
            loading,
            error,
            data,
          }: QueryResult<{ bpCandidate: TBpCandidate }>) => {
          if (error && !loading) {
            notification.error({
              message: "Error",
              description: `failed to get BP candidate: ${error.message}`,
              duration: 3,
            });
            return <></>;
          }
          return (
            <SpinPreloader spinning={loading}>
              {data && data.bpCandidate ? (
                <Flex
                  width={"100%"}
                  overflowX={"scroll"}
                  column={true}
                  backgroundColor={colors.white}
                >
                  <VotesReceivedTable
                    registeredName={data.bpCandidate.registeredName}
                    isPublic={true} />
                  <CommonMargin />
                </Flex>
              ) : (
                <div />
              )}
            </SpinPreloader>
          )
        }}
      </Query>
    );
  }
}

export const DelegateVotesReceived = withRouter(
  VotesReceived
);
