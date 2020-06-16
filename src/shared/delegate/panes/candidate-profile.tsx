// @flow
// $FlowFixMe
import notification from "antd/lib/notification";
import { SpinPreloader } from "iotex-react-block-producers/lib/spin-preloader";
import React from "react";
import { Component } from "react";
import { Query, QueryResult } from "react-apollo";
import { connect } from "react-redux";
import { TBpCandidate, TNewBpCandidate } from "../../../types";
import { Preloader } from "../../common/preloader";
import { GET_BP_CANDIDATE } from "../../staking/smart-contract-gql-queries";
import { CandidateForm } from "./candidate-form";

type Props = {
  candidateProfileId?: string;
  eth?: string;
  // tslint:disable-next-line:no-any
  history?: any;
};

const DEFAULT_BP_CANDIDATE: TNewBpCandidate = {
  rank: "-",
  id: "",
  name: "",
  blurb: "",
  website: "",
  logo: "",
  bannerUrl: "",
  socialMedia: [],
  location: "",
  introduction: "",
  team: "",
  techSetup: "",
  communityPlan: "",
  rewardPlan: "",
  shareCardImage: "",
  serverEndpoint: "",
  serverHealthEndpoint: "",
  discordName: "",
  email: ""
};

class CandidateProfile extends Component<Props> {
  props: Props;

  render(): JSX.Element {
    const { candidateProfileId = "", eth = "" } = this.props;

    const request = { candidateProfileId, eth };
    return (
      <div>
        <Query ssr={false} query={GET_BP_CANDIDATE} variables={request}>
          {({
            loading,
            error,
            data
          }: QueryResult<{ bpCandidate: TBpCandidate }>) => {
            if (loading) {
              return <Preloader />;
            }
            if (error && !loading) {
              notification.error({
                message: "Error",
                description: `failed to get BP candidate: ${error.message}`,
                duration: 3
              });
              return null;
            }
            if (data && data.bpCandidate) {
              return (
                <SpinPreloader spinning={loading}>
                  <CandidateForm data={data.bpCandidate} />
                </SpinPreloader>
              );
            }
            return (
              <SpinPreloader spinning={loading}>
                {/*
                            // @ts-ignore */}
                <CandidateForm data={DEFAULT_BP_CANDIDATE} />
              </SpinPreloader>
            );
          }}
        </Query>
      </div>
    );
  }
}

// $FlowFixMe
export const CandidateProfileContainer = connect(
  (state: { base: { eth: string } }) => ({
    eth: state.base.eth
  })
)(CandidateProfile);
