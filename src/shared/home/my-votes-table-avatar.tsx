import React from "react";
import { Query, QueryResult } from "react-apollo";
import { GET_BP_CANDIDATE } from "../staking/smart-contract-gql-queries";
import { webBpApolloClient } from "../common/apollo-client";
import { TBpCandidate } from "../../types";
import notification from "antd/lib/notification";
import Avatar from "antd/lib/avatar";
import { Preloader } from "../common/preloader";
import { SpinPreloader } from "iotex-react-block-producers/lib/spin-preloader";

interface IProps {
  candidateProfileId: string;
}

const MyVotesTableDelegateAvatar = (props: IProps): JSX.Element => {
  const { candidateProfileId } = props;
  const request = { candidateProfileId, eth: "" };
  return (
    <Query
      query={GET_BP_CANDIDATE}
      // ssr={false}
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
          return null;
        }
        return (
          <SpinPreloader spinning={loading}>
            {data && data.bpCandidate ? (
              <Avatar
                alt="AV"
                shape="circle"
                src={data.bpCandidate.logo}
                size={40}
                style={{ margin: "5px 10px 2px 0" }}
              />
            ) : (
              <div />
            )}
          </SpinPreloader>
        );
      }}
    </Query>
  );
};

export { MyVotesTableDelegateAvatar };
