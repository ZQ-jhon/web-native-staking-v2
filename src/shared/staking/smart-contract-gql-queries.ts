import gql from "graphql-tag";

export const GET_ALL_CANDIDATE = gql`
  query allCandidates {
    bpCandidates {
      id
      name
      registeredName
      status
    }
    bpCandidatesOnContract {
      address
      ioOperatorAddr
      ioRewardAddr
      name
      weight
    }
  }
`;

export const GET_BP_CANDIDATE = gql`
  query bpCandidate($candidateProfileId: ID, $eth: ID) {
    bpCandidate(candidateProfileId: $candidateProfileId, eth: $eth) {
      rank
      id
      name
      blurb
      website
      logo
      bannerUrl
      socialMedia
      nodeVersion
      location
      introduction
      team
      techSetup
      communityPlan
      blockRewardPortion
      epochRewardPortion
      foundationRewardPortion
      rewardPlan
      registeredName
      shareCardImage
      tempEthAddress
      annualReward
    }
  }
`;

export const GET_BP_CANDIDATES = gql`
  query bpCandidates {
    bpCandidates {
      id
      rank
      logo
      name
      status
      serverStatus
      liveVotes
      liveVotesDelta
      nodeVersion
      percent
      registeredName
      socialMedia
      productivity
      blockRewardPortion
      epochRewardPortion
      foundationRewardPortion
      rewardPlan
    }
  }
`;

export const RECORD_STAKING_REFERRAL = gql`
  mutation recordStakingReferral($stakingReferralInput: StakingReferralInput!) {
    recordStakingReferral(stakingReferralInput: $stakingReferralInput) {
      createAt
    }
  }
`;
