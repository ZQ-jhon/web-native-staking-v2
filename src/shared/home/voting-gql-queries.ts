import gql from "graphql-tag";

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

export const GET_STATS = gql`
  query stats {
    stats {
      height
      totalCandidates
      totalCandidatesHistory {
        ts
        count
      }
      totalVotedStakes
      totalVotedStakesHistory {
        ts
        count
      }
      totalVotes
      totalVotesHistory {
        ts
        count
      }
      nextEpoch
      currentEpochNumber
      currentEpochHeight
    }
  }
`;

export const GET_BP_INFO = gql`
  query bpInfo($epochNumber: Int) {
    bpCandidateProductivities(epochNumber: $epochNumber) {
      address
      votes
      active
      production
    }
  }
`;
export const GET_BP_CANDIDATE = gql`
  query bpCandidate($eth: String!) {
    bpCandidate(eth: $eth) {
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

export const GET_BP_REWARDS = gql`
  query delegate(
    $startEpoch: Int!
    $epochCount: Int!
    $delegateName: String!
    $percentage: Int!
    $includeFoundationBonus: Boolean!
    $pagination: Pagination
  ) {
    delegate(
      startEpoch: $startEpoch
      epochCount: $epochCount
      delegateName: $delegateName
    ) {
      bookkeeping(
        percentage: $percentage
        includeFoundationBonus: $includeFoundationBonus
      ) {
        exist
        rewardDistribution(pagination: $pagination) {
          voterEthAddress
          voterIotexAddress
          amount
        }
        count
      }
    }
  }
`;
