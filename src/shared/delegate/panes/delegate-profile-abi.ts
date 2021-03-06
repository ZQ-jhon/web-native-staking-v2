export const DELEGATE_PROFILE_ABI = [
  {
    constant: false,
    inputs: [
      {
        name: "_delegate",
        type: "address"
      },
      {
        name: "_name",
        type: "string"
      },
      {
        name: "_value",
        type: "bytes"
      }
    ],
    name: "updateProfileForDelegate",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "register",
    outputs: [
      {
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "_delegate",
        type: "address"
      }
    ],
    name: "getEncodedProfile",
    outputs: [
      {
        name: "code_",
        type: "bytes"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "_address",
        type: "address"
      }
    ],
    name: "isOwner",
    outputs: [
      {
        name: "",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "_name",
        type: "string"
      }
    ],
    name: "getFieldByName",
    outputs: [
      {
        name: "verifier_",
        type: "address"
      },
      {
        name: "deprecated_",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_byteCode",
        type: "bytes"
      }
    ],
    name: "updateProfileWithByteCode",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [],
    name: "withdraw",
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
    constant: true,
    inputs: [],
    name: "paused",
    outputs: [
      {
        name: "",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_name",
        type: "string"
      },
      {
        name: "_verifierAddr",
        type: "address"
      }
    ],
    name: "newField",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_name",
        type: "string"
      },
      {
        name: "_value",
        type: "bytes"
      }
    ],
    name: "updateProfile",
    outputs: [],
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
    constant: true,
    inputs: [
      {
        name: "_idx",
        type: "uint256"
      }
    ],
    name: "getFieldByIndex",
    outputs: [
      {
        name: "name_",
        type: "string"
      },
      {
        name: "verifier_",
        type: "address"
      },
      {
        name: "deprecated_",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "owner",
    outputs: [
      {
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_delegate",
        type: "address"
      },
      {
        name: "_byteCode",
        type: "bytes"
      }
    ],
    name: "updateProfileWithByteCodeForDelegate",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    name: "fieldNames",
    outputs: [
      {
        name: "",
        type: "string"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "_delegate",
        type: "address"
      },
      {
        name: "_field",
        type: "string"
      }
    ],
    name: "getProfileByField",
    outputs: [
      {
        name: "",
        type: "bytes"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_name",
        type: "string"
      }
    ],
    name: "deprecateField",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "numOfFields",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_newOwner",
        type: "address"
      }
    ],
    name: "transferOwnership",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "registerAddr",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: "fee",
        type: "uint256"
      }
    ],
    name: "FeeUpdated",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: "delegate",
        type: "address"
      },
      {
        indexed: false,
        name: "name",
        type: "string"
      },
      {
        indexed: false,
        name: "value",
        type: "bytes"
      }
    ],
    name: "ProfileUpdated",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: "name",
        type: "string"
      }
    ],
    name: "FieldDeprecated",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: "name",
        type: "string"
      }
    ],
    name: "NewField",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [],
    name: "Pause",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [],
    name: "Unpause",
    type: "event"
  }
];
