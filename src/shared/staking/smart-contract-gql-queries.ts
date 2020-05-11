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
