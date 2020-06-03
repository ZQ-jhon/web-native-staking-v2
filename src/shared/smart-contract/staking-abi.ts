/* eslint-disable */
//export const STAKING_CONTRACT_ADDR = "0xd546bb3fc2db18618b7c16f155800c9897688f3e";

export const STAKING_ABI = [
  {
    constant: false,
    inputs: [{ name: "addrs", type: "address[]" }],
    name: "addAddressesToWhitelist",
    outputs: [{ name: "success", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [{ name: "addr", type: "address" }],
    name: "addAddressToWhitelist",
    outputs: [{ name: "success", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      { name: "_canName", type: "bytes12" },
      { name: "_amount", type: "uint256" },
      { name: "_stakeDuration", type: "uint256" },
      { name: "_nonDecay", type: "bool" },
      { name: "_data", type: "bytes" }
    ],
    name: "createBucket",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [],
    name: "pause",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [{ name: "addrs", type: "address[]" }],
    name: "removeAddressesFromWhitelist",
    outputs: [{ name: "success", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [{ name: "addr", type: "address" }],
    name: "removeAddressFromWhitelist",
    outputs: [{ name: "success", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      { name: "_bucketIndex", type: "uint256" },
      { name: "_stakeDuration", type: "uint256" },
      { name: "_nonDecay", type: "bool" },
      { name: "_data", type: "bytes" }
    ],
    name: "restake",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      { name: "_bucketIndex", type: "uint256" },
      { name: "_canName", type: "bytes12" },
      { name: "_data", type: "bytes" }
    ],
    name: "revote",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      { name: "_bucketIndex", type: "uint256" },
      { name: "_newOwner", type: "address" },
      { name: "_data", type: "bytes" }
    ],
    name: "setBucketOwner",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [{ name: "_newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [],
    name: "unpause",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      { name: "_bucketIndex", type: "uint256" },
      { name: "_data", type: "bytes" }
    ],
    name: "unstake",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      { name: "_bucketIndex", type: "uint256" },
      { name: "_data", type: "bytes" }
    ],
    name: "withdraw",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "_stakingTokenAddr", type: "address" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "bucketIndex", type: "uint256" },
      { indexed: false, name: "canName", type: "bytes12" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "stakeDuration", type: "uint256" },
      { indexed: false, name: "nonDecay", type: "bool" },
      { indexed: false, name: "data", type: "bytes" }
    ],
    name: "BucketCreated",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "bucketIndex", type: "uint256" },
      { indexed: false, name: "canName", type: "bytes12" },
      { indexed: false, name: "stakeDuration", type: "uint256" },
      { indexed: false, name: "stakeStartTime", type: "uint256" },
      { indexed: false, name: "nonDecay", type: "bool" },
      { indexed: false, name: "bucketOwner", type: "address" },
      { indexed: false, name: "data", type: "bytes" }
    ],
    name: "BucketUpdated",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "bucketIndex", type: "uint256" },
      { indexed: false, name: "canName", type: "bytes12" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "data", type: "bytes" }
    ],
    name: "BucketUnstake",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "bucketIndex", type: "uint256" },
      { indexed: false, name: "canName", type: "bytes12" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "data", type: "bytes" }
    ],
    name: "BucketWithdraw",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, name: "addr", type: "address" }],
    name: "WhitelistedAddressAdded",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, name: "addr", type: "address" }],
    name: "WhitelistedAddressRemoved",
    type: "event"
  },
  { anonymous: false, inputs: [], name: "Pause", type: "event" },
  { anonymous: false, inputs: [], name: "Unpause", type: "event" },
  {
    constant: true,
    inputs: [{ name: "", type: "uint256" }],
    name: "buckets",
    outputs: [
      { name: "canName", type: "bytes12" },
      { name: "stakedAmount", type: "uint256" },
      { name: "stakeDuration", type: "uint256" },
      { name: "stakeStartTime", type: "uint256" },
      { name: "nonDecay", type: "bool" },
      { name: "unstakeStartTime", type: "uint256" },
      { name: "bucketOwner", type: "address" },
      { name: "createTime", type: "uint256" },
      { name: "prev", type: "uint256" },
      { name: "next", type: "uint256" }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      { name: "_prevIndex", type: "uint256" },
      { name: "_limit", type: "uint256" }
    ],
    name: "getActiveBucketCreateTimes",
    outputs: [
      { name: "count", type: "uint256" },
      { name: "indexes", type: "uint256[]" },
      { name: "createTimes", type: "uint256[]" }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      { name: "_prevIndex", type: "uint256" },
      { name: "_limit", type: "uint256" }
    ],
    name: "getActiveBucketIdx",
    outputs: [
      { name: "count", type: "uint256" },
      { name: "indexes", type: "uint256[]" }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      { name: "_prevIndex", type: "uint256" },
      { name: "_limit", type: "uint256" }
    ],
    name: "getActiveBuckets",
    outputs: [
      { name: "count", type: "uint256" },
      { name: "indexes", type: "uint256[]" },
      { name: "stakeStartTimes", type: "uint256[]" },
      { name: "stakeDurations", type: "uint256[]" },
      { name: "decays", type: "bool[]" },
      { name: "stakedAmounts", type: "uint256[]" },
      { name: "canNames", type: "bytes12[]" },
      { name: "owners", type: "address[]" }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "getBucketIndexesByAddress",
    outputs: [{ name: "", type: "uint256[]" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [{ name: "_address", type: "address" }],
    name: "isOwner",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "maxBucketsPerAddr",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "maxStakeDuration",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "minStakeAmount",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "minStakeDuration",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "owner",
    outputs: [{ name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "paused",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "secondsPerEpoch",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [{ name: "", type: "address" }, { name: "", type: "uint256" }],
    name: "stakeholders",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "token",
    outputs: [{ name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "totalStaked",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "unStakeDuration",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [{ name: "", type: "address" }],
    name: "whitelist",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  }
];
