// @flow
import { Buffer } from "buffer";
// @ts-ignore
import EthContract from "ethjs-contract";
// @ts-ignore
import HttpProvider from "ethjs-provider-http";
import BigNumber from "bignumber.js";
// @ts-ignore
import window from "global/window";
// $FlowFixMe
import Web3Utils from "web3-utils";
// $FlowFixMe
import BN from "bn.js";
import { logger } from "onefx/lib/integrated-gateways/logger";
import { Eth } from "../../shared/common/ethjs-query";
import { STAKING_ABI } from "../../shared/smart-contract/staking-abi";
import { DELEGATE_PROFILE_ABI } from "../../shared/smart-contract/delegate-profile-abi";
import { NAME_REGISTRATION_ABI } from "../../shared/smart-contract/name-registration-abi";
import {
  decodeCandidateHexName,
  WeiToTokenValue
} from "../../shared/common/token-utils";
import { calcStats } from "../../shared/smart-contract/my-votes-table";
import {
  TPoll,
  Poll,
  TResolverCtx,
  IGetBucketsByCandidateRequest
} from "../../types/global";
import { POLL_ABI, EARLY_RELEASE_POLL_ABI } from "../../shared/poll/poll-abi";

export function decodeIoAddress(hexArray: Array<string>): Array<string> {
  const resp = [];
  for (let i = 0; i < hexArray.length / 2; i++) {
    const concat = `${String(hexArray[i * 2]).replace(/^0x/, "")}${String(
      hexArray[i * 2 + 1]
    ).replace(/^0x/, "")}`;
    const raw = concat.substr(0, 82);
    resp[i] = Buffer.from(raw, "hex").toString("ascii");
  }
  return resp;
}

async function connectTimeout(timeout: number): Promise<any> {
  // @ts-ignore
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      reject(new Error("timeout"));
    }, timeout);
  });
}

type Cfg = {
  provider: string,
  contractAddress: string,
  timeout: number
};

export class StakingContract {
  stakingContract: any;
  addr: string;
  timeout: number;

  constructor(cfg: Cfg) {
    try {
      const eth = new Eth(new HttpProvider(cfg.provider));
      this.stakingContract = new EthContract(eth)(STAKING_ABI).at(
        cfg.contractAddress
      );
      this.timeout = cfg.timeout;
    } catch (e) {
      logger.error("failed to construct StakingContract");
    }
  }

  async totalStaked(): Promise<string> {
    try {
      const resp = await Promise.race([
        this.stakingContract.totalStaked(),
        connectTimeout(this.timeout)
      ]);
      return new BigNumber(resp[0]).dividedBy(new BigNumber("1e18")).toFixed(0);
    } catch (e) {
      logger.error(`failed to StakingContract.totalStaked: ${e}`);
      return "0";
    }
  }

  async stakedAmount(addr: string): Promise<number> {
    try {
      let resp = await Promise.race([
        this.stakingContract.getBucketIndexesByAddress(addr, { from: addr }),
        connectTimeout(this.timeout)
      ]);
      const bucketIds = (resp && resp[0].map((id: any) => id.toNumber())) || [];

      resp = await Promise.all(
        bucketIds.map((id: any) => this.stakingContract.buckets(id, { from: addr }))
      );
      const stakeStatus = calcStats(addr, bucketIds, resp);
      if (stakeStatus && stakeStatus.totalStaking) {
        return stakeStatus.totalStaking;
      }
      return 0;
    } catch (e) {
      logger.error(`failed to StakingContract.stakedAmount: ${e}`);
      return 0;
    }
  }

  async isNewStaker(addr: String): Promise<boolean> {
    try {
      const now = new Date();
      const deadline = new Date(now.getTime() - 600000);
      const resp = await Promise.race([
        this.stakingContract.getBucketIndexesByAddress(addr, { from: addr }),
        connectTimeout(this.timeout)
      ]);
      if (!resp || resp[0].length === 0) {
        return true;
      }
      if (resp[0].length > 1) {
        return false;
      }
      const bucket = await Promise.race([
        this.stakingContract.buckets(resp[0][0].toNumber(), { from: addr }),
        connectTimeout(this.timeout)
      ]);
      return new Date(bucket.createTime.toNumber() * 1000) >= deadline;
    } catch (e) {
      logger.error(`failed to StakingContract.firstBucketCreateTime: ${e}`);
      return false;
    }
  }

  async health(): Promise<boolean> {
    try {
      const resp = await Promise.race([
        this.stakingContract.totalStaked(),
        connectTimeout(this.timeout)
      ]);
      return Boolean(resp);
    } catch (e) {
      return false;
    }
  }
}

class RegCandidate {
  address: string;
  ioOperatorAddr: string;
  ioRewardAddr: string;
  name: string;
  nameHex: string;
  weight: BigNumber;

  constructor(rawCandidate: any) {
    this.address = rawCandidate.address;
    this.ioOperatorAddr = rawCandidate.ioOperatorAddr;
    this.ioRewardAddr = rawCandidate.ioRewardAddr;
    this.name = decodeCandidateHexName(rawCandidate.name);
    this.nameHex = rawCandidate.name;
    this.weight = rawCandidate.weight;
  }
}

type NameRegistrationCfg = {
  provider: string,
  contractAddress: string,
  cacheTtl: number,
  timeout: number
};

export class NameRegistrationContract {
  nameRegistration: any;
  addr: string;
  timeout: number;

  constructor(cfg: NameRegistrationCfg) {
    try {
      this.cacheTtl = cfg.cacheTtl;
      const eth = new Eth(new HttpProvider(cfg.provider));
      this.nameRegistration = new EthContract(eth)(NAME_REGISTRATION_ABI).at(
        cfg.contractAddress
      );
      this.timeout = cfg.timeout;
    } catch (e) {
      logger.error("failed to construct StakingContract");
    }
  }

  async getName(ethAddr: string): Promise<string> {
    try {
      const regResp = await Promise.race([
        this.nameRegistration.addrToIdx(ethAddr),
        connectTimeout(this.timeout)
      ]);
      const resp = await Promise.race([
        this.nameRegistration.candidates(regResp[0]),
        connectTimeout(this.timeout)
      ]);
      return decodeCandidateHexName(resp[0].name);
    } catch (e) {
      logger.error(`failed to NameRegistrationContract.getName: ${e}`);
      return "";
    }
  }

  // @ts-ignore
  async getAllCandidates(): Promise<?Array<RegCandidate>> {
    // TODO: wrong pagination
    const resp = await Promise.race([
      this.nameRegistration.candidateCount(),
      connectTimeout(this.timeout)
    ]);
    const limit = resp[0];
    try {
      const resp = await Promise.race([
        this.nameRegistration.getAllCandidates(0, limit),
        connectTimeout(this.timeout)
      ]);
      const ioOperatorAddr = decodeIoAddress(resp.ioOperatorAddr);
      const ioRewardAddr = decodeIoAddress(resp.ioRewardAddr);
      const cands = [];
      const weightOne = new BN(1);
      for (let i = 0; i < limit; i++) {
        if (resp.weights[i].eq(weightOne)) {
          cands.push(
            new RegCandidate({
              name: resp.names[i],
              address: resp.addresses[i],
              ioOperatorAddr: ioOperatorAddr[i],
              ioRewardAddr: ioRewardAddr[i],
              weight: resp.weights[i]
            })
          );
        }
      }
      return cands;
    } catch (e) {
      logger.error(`failed to NameRegistrationContract.getAllCandidates: ${e}`);
      return null;
    }
  }
  // @ts-ignore
  allCandidatesCache: ?Array<RegCandidate>;
  cacheTs: number = Date.now();
  cacheTtl: number; // ms

  async getAllCandidatesCache(): Promise<Array<RegCandidate>> {
    if (
      !this.allCandidatesCache ||
      Date.now() - this.cacheTs >= this.cacheTtl
    ) {
      this.allCandidatesCache = await this.getAllCandidates();
      this.cacheTs = Date.now();
    }
    return this.allCandidatesCache || [];
  }
  // @ts-ignore
  async getNameCache(ethAddr: ?string): Promise<string> {
    ethAddr = String(ethAddr).toLowerCase();
    const all = await this.getAllCandidatesCache();
    for (const it of all) {
      if (String(it.address).toLowerCase() === ethAddr) {
        return it.name;
      }
    }
    return "";
  }

  // @ts-ignore
  async getRegCandidateCache(ethAddr: ?string): Promise<RegCandidate> {
    ethAddr = String(ethAddr).toLowerCase();
    const all = await this.getAllCandidatesCache();
    for (const it of all) {
      if (String(it.address).toLowerCase() === ethAddr) {
        return it;
      }
    }
    return new RegCandidate({
      name: "",
      address: "",
      ioOperatorAddr: "",
      ioRewardAddr: "",
      weight: new BigNumber(0)
    });
  }

  async getCandidateByIoOperatorAddress(
    // @ts-ignore
    ioOperatorAddress: ?string
  ): Promise<any> {
    ioOperatorAddress = String(ioOperatorAddress).toLowerCase();
    const all = await this.getAllCandidatesCache();
    for (const it of all) {
      if (String(it.ioOperatorAddr).toLowerCase() === ioOperatorAddress) {
        return it;
      }
    }
    return null;
  }
}

export type ProfileField = {
  key: string,
  value: any
};

function getContent(data: string, index: number): string {
  return data.substr(
    index + 64,
    Web3Utils.hexToNumber("0x" + data.substr(index, 64)) * 2
  );
}

export function getPermyriadValue(
  profileFields: Array<ProfileField>,
  key: string
  // @ts-ignore
): ?number {
  const found = profileFields.find(k => k.key === key);
  // @ts-ignore
  return found && Number(found.value);
}

export class DelegateProfileContract {
  contract: any;
  timeout: number;
  types: { [key: string]: string };

  constructor({
    provider,
    contractAddress,
    timeout
  }: {
    provider: string,
    contractAddress: string,
    timeout: number
  }) {
    try {
      this.contract = new EthContract(new Eth(new HttpProvider(provider)))(
        DELEGATE_PROFILE_ABI
      ).at(contractAddress);
      this.timeout = timeout;
      this.types = {
        blockRewardPortion: "permyriad",
        epochRewardPortion: "permyriad",
        foundationRewardPortion: "permyriad"
      };
    } catch (e) {
      logger.error("failed to construct delegate profile contract");
    }
  }

  async getProfileByField(
    profileKey: string,
    delegateAddress: string
  ): Promise<ProfileField> {
    const bytesResult = await this.contract.getProfileByField(
      delegateAddress,
      profileKey
    );
    switch (this.types[profileKey]) {
      case "permyriad":
        return {
          key: profileKey,
          value: Web3Utils.hexToNumber(bytesResult) / 100
        };
      default:
        return {
          key: profileKey,
          value: Web3Utils.hexToUtf8(bytesResult)
        };
    }
  }

  async getProfiles(delegateAddress: string): Promise<Array<ProfileField>> {
    const retval = Array();
    let data = await this.contract.getEncodedProfile(delegateAddress);
    let encodedData = data.code_;
    encodedData = encodedData.replace("0x", "");
    for (let index = 0; index < encodedData.length; ) {
      const field = getContent(encodedData, index);
      index += 64 + field.length;
      let value = getContent(encodedData, index);
      index += 64 + value.length;
      let key = Web3Utils.hexToUtf8("0x" + field);
      switch (this.types[key]) {
        case "permyriad":
        // @ts-ignore
          value = Web3Utils.hexToNumber("0x" + value) / 100;
          break;
        default:
          value = Web3Utils.hexToUtf8("0x" + value);
      }
      retval.push(({ key, value } as ProfileField));
    }
    return retval;
  }
}

export class PollManager {
  earlyReleasePollAddress: string;
  provider: string;
  timeout: number;

  constructor({
    provider,
    contractAddress,
    timeout
  }: {
    provider: string,
    contractAddress: string,
    timeout: number
  }) {
    this.earlyReleasePollAddress = contractAddress;
    this.provider = provider;
    this.timeout = timeout;
  }

  convertToPoll(tpoll: TPoll): Poll {
    return {
      id: tpoll.id,
      contractAddress: tpoll.contractAddress,
      category: tpoll.category,
      title: tpoll.title,
      description: tpoll.description,
      proposer: tpoll.proposer,
      result: tpoll.result,
      start: tpoll.start,
      end: tpoll.end,
      maxNumOfChoices: "1",
      options: [],
      votes: [],
      status: ""
    };
  }

  async getPolls(
    context: TResolverCtx,
    offset: number,
    limit: number
  ): Promise<Array<Poll>> {
    const tpolls = await context.model.poll.pagination(offset, limit);
    if (!tpolls) {
      return [];
    }
    return await this.populatePolls({ context, tpolls });
  }

  async getEligibleVoters(context: TResolverCtx) {
    const rankingMeta = await context.gateways.ranking.getMeta(
      context.gateways.iotexCore
    );
    const req: IGetBucketsByCandidateRequest = {
      name: "",
      startEpoch: Number(rankingMeta.epoch.num)
    };
    const { buckets } = await context.gateways.ranking.getBucketsByCandidate(
      req
    );
    const voters = {};
    
    buckets.forEach(({ voter, weightedVotes }: any) => {
      voter = `0x${voter}`;
      // @ts-ignore
      if (!voters[voter]) {
        // @ts-ignore
        voters[voter] = 0;
      }
      // @ts-ignore
      voters[voter] += WeiToTokenValue(weightedVotes);
    });
    return voters;
  }

  async getPoll(context: TResolverCtx, address: string): Promise<Poll> {
    const tpoll = await context.model.poll.findOneByContractAddress(address);
    if (!tpoll) {
      throw new Error(`poll ${address} does not exist`);
    }
    const eth = new Eth(new HttpProvider(this.provider));
    return await this.populatePoll({ context, tpoll, eth, fetchOptions: true });
  }

  async populateEarlyRelease({
    context,
    tpoll,
    eth,
    fetchOptions = false,
    contractAddress
  }: {
    context: TResolverCtx,
    tpoll: TPoll,
    eth: Eth,
    fetchOptions?: boolean,
    contractAddress: string
  }) {
    const contract = new EthContract(eth)(EARLY_RELEASE_POLL_ABI).at(
      contractAddress
    );
    const poll = this.convertToPoll(tpoll);
    if (fetchOptions) {
      poll.options = [
        { id: "0", description: "No" },
        { id: "1", description: "Yes" }
      ];
      const voterToVotes = await this.getEligibleVoters(context);
      const voters = Object.keys(voterToVotes);
      const { "0": choices } = await contract.getChoicesByAddrs(voters, {
        from: contractAddress
      });
      voters.forEach((voter, i) => {
        // @ts-ignore
        const weight = voterToVotes[voter];
        switch (choices[i].toString()) {
          case "0":
          // fallthrough
          case "1":
            poll.votes.push({ optionId: choices[i].toString(), voter, weight });
            break;
          default:
          // do nothing
        }
      });
    }
    return poll;
  }

  async populatePoll({
    context,
    tpoll,
    eth,
    fetchOptions = false
  }: {
    context: TResolverCtx,
    tpoll: TPoll,
    eth: Eth,
    fetchOptions?: boolean
  }) {
    if (
      !tpoll.contractAddress ||
      tpoll.contractAddress == this.earlyReleasePollAddress
    ) {
      return await this.populateEarlyRelease({
        context,
        tpoll,
        eth,
        fetchOptions,
        contractAddress: tpoll.contractAddress || this.earlyReleasePollAddress
      });
    }

    const poll = this.convertToPoll(tpoll);
    const contract = new EthContract(eth)(POLL_ABI).at(tpoll.contractAddress);
    const [
      { "0": title },
      { "0": status },
      { "0": proposer },
      { "0": description },
      { "0": maxNumOfChoices },
      { options_: availableOptions }
    ] = await Promise.all([
      contract.title(),
      contract.status(),
      contract.proposer(),
      contract.description(),
      contract.maxNumOfChoices(),
      contract.availableOptions()
    ]);

    poll.title = title;
    poll.status = status;
    if (!poll.proposer) {
      poll.proposer = proposer;
    }
    if (!poll.category) {
      poll.category = "General";
    }
    if (!poll.description || poll.description.length === 0) {
      poll.description = description;
    }
    poll.maxNumOfChoices = maxNumOfChoices;
    if (fetchOptions) {
      const voterToVotes = await this.getEligibleVoters(context);
      const voters = Object.keys(voterToVotes);
      poll.options = await Promise.all(
        // @ts-ignore
        availableOptions.map(async id => {
          id = id.toNumber();
          logger.info(`populatePoll id ${id} voters ${JSON.stringify(voters)}`);
          const [{ "0": description }] = await Promise.all([
            contract.optionDescription(id, { from: tpoll.contractAddress })
          ]);
          if (voters.length > 0) {
            const [{ voted_: voted }] = await Promise.all([
              contract.voted(id, voters, { from: tpoll.contractAddress })
            ]);
            voters.forEach((voter, i) => {
              if (i < voted.length && voted[i].toNumber() > 0) {
                poll.votes.push({
                  optionId: id,
                  voter,
                  weight: voted[i].toNumber()
                });
              }
            });
          }
          return { id, description };
        })
      );
    }
    return poll;
  }

  async populatePolls({
    context,
    tpolls
  }: {
    context: TResolverCtx,
    tpolls: Array<TPoll>
  }) {
    const eth = new Eth(new HttpProvider(this.provider));

    return await Promise.all(
      tpolls
        .map(async tpoll => {
          return await this.populatePoll({ context, tpoll, eth });
        })
        .reverse()
    );
  }
}
