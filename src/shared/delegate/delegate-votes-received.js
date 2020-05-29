import React, { Component } from "react";
// $FlowFixMe
import { notification } from "antd";
import { Query } from "react-apollo";
import { withRouter } from "react-router";
import { connect } from "react-redux";
import { VotesReceivedTable } from "../profile/votes-received-table";
import { GET_BP_CANDIDATE } from "../home/voting-gql-queries";
import { CommonMargin } from "../common/common-margin";
import { colors } from "../common/styles/style-color2";
import { Flex } from "../common/flex";

class VotesReceived extends Component<Props, State> {
  render() {
    const { eth, match } = this.props;
    if (!match || !match.params || !match.params.id) {
      return null;
    }
    const request = { candidateProfileId: match.params.id, eth };
    return (
      <Query ssr={false} query={GET_BP_CANDIDATE} variables={request}>
        {({ loading, error, data }) => {
          if (error && !loading) {
            notification.error({
              message: "Error",
              description: `failed to get BP candidate: ${error.message}`,
              duration: 3
            });
            return null;
          }
          if (data && data.bpCandidate) {
            const { registeredName } = data.bpCandidate;
            return (
              <Flex
                width={"100%"}
                overflowX={"scroll"}
                column={true}
                backgroundColor={colors.white}
              >
                <VotesReceivedTable registeredName={registeredName} isPublic />
                <CommonMargin />
              </Flex>
            );
          }
          return null;
        }}
      </Query>
    );
  }
}

// $FlowFixMe
export const DelegateVotesReceived = withRouter(
  connect(state => ({
    eth: state.base.eth
  }))(VotesReceived)
);
