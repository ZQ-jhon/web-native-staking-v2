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

export const GET_BP_CANDIDATE_REWARD_DISTRIBUTION = gql`
  query bpCandidateRewardDistribution {
    bpCandidateRewardDistribution {
      blockRewardPortion
      epochRewardPortion
      foundationRewardPortion
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
