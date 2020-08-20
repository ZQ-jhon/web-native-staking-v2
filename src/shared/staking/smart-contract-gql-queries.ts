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

export const GET_ALL_CANDIDATES_ID_NAME = gql`
  query allCandidates {
    bpCandidates {
      id
      name
      registeredName
      logo
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

export const GET_BUCKETS_BY_CANDIDATE = gql`
  query delegate(
    $startEpoch: Int!
    $epochCount: Int!
    $delegateName: String!
    $pagination: Pagination
  ) {
    delegate(
      startEpoch: $startEpoch
      epochCount: $epochCount
      delegateName: $delegateName
    ) {
      bucketInfo {
        exist
        bucketInfoList(pagination: $pagination) {
          epochNumber
          count
          bucketInfo {
            voterIotexAddress
            votes
            weightedVotes
            remainingDuration
            isNative
          }
        }
      }
    }
  }
`;

export const GET_REWARDS_RATIO_BY_DELEGATE = gql`
  query hermesMeta(
    $startEpoch: Int!
    $epochCount: Int!
    $delegateName: String!
  ) {
    hermes2(startEpoch: $startEpoch, epochCount: $epochCount) {
      byDelegate(delegateName: $delegateName) {
        distributionRatio {
          epochNumber
          blockRewardRatio
          foundationBonusRatio
          epochRewardRatio
        }
      }
    }
  }
`;

export const GET_EPOCH = gql`
  query {
    chain {
      mostRecentEpoch
    }
  }
`;
