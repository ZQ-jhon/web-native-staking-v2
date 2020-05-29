// @flow
import { Component } from "react";
import { Query } from "react-apollo";
import { connect } from "react-redux";
// $FlowFixMe
import { notification } from "antd";
import { CandidateForm } from "../profile/candidate-form";
import type { TNewBpCandidate } from "../../types";
import { SpinPreloader } from "../common/spin-preloader";
import { GET_BP_CANDIDATE } from "../home/voting-gql-queries";

type Props = {
  candidateProfileId?: string,
  eth?: string,
  history?: any
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
  constructor() {
    super();
  }

  render() {
    const { candidateProfileId = "", eth = "" } = this.props;

    const request = { candidateProfileId, eth };
    return (
      <div>
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
              return (
                <SpinPreloader spinning={loading}>
                  <CandidateForm data={data.bpCandidate} />
                </SpinPreloader>
              );
            }
            return (
              <SpinPreloader spinning={loading}>
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
export const CandidateProfileContainer = connect(state => ({
  eth: state.base.eth
}))(CandidateProfile);
