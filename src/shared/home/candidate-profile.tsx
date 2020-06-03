// @flow
import React, { Component } from "react";
import { Query } from "react-apollo";
import { connect } from "react-redux";
// $FlowFixMe
import { notification } from "antd";
import { CandidateForm } from "../profile/candidate-form";
import { TNewBpCandidate } from "../../types/global";
import { SpinPreloader } from "../common/spin-preloader";
import { GET_BP_CANDIDATE } from "./voting-gql-queries";

type Props = {
  candidateProfileId?: string;
  eth?: string;
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
  constructor(props: any) {
    super(props);
  }

  render() {
    const { candidateProfileId = "", eth = "" } = this.props;

    const request = { candidateProfileId, eth };
    return (
      <div>
        // @ts-ignore
        <Query ssr={false} query={GET_BP_CANDIDATE} variables={request}>
          {/* tslint:disable-next-line:no-any */}
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
              return (
                <SpinPreloader spinning={loading}>
                  // @ts-ignore
                  <CandidateForm data={data.bpCandidate} />
                </SpinPreloader>
              );
            }
            return (
              <SpinPreloader spinning={loading}>
                // @ts-ignore
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
