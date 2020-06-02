/* eslint-disable no-invalid-this */
// @flow
// $FlowFixMe
import { Avatar, Button, Dropdown, Icon, notification, Table } from "antd";
import { t } from "onefx/lib/iso-i18n";
import React, { Component } from "react";
import window from "global/window";
import { connect } from "react-redux";
import { Query } from "react-apollo";
import dateformat from "dateformat";
import {
  Bucket,
  DEFAULT_STAKING_DURATION_SECOND,
  DEFAULT_STAKING_GAS_LIMIT,
  encodeCandidateHexName,
  getPowerEstimation
} from "../common/token-utils";
import { Flex } from "../common/flex";
import { colors } from "../common/styles/style-color2";
import { media } from "../common/styles/style-media";
import { getEthworkAddress } from "../common/eth-help";
import {
  BoldText,
  CellSpan,
  LabelText,
  StatisticSpan,
  StatisticValue,
  TimeSpan
} from "../common/component-style";
import { RevoteModal } from "./stake-edit/revote-modal";
import { renderActionMenu } from "./stake-edit/modal-menu";
import { GET_BP_CANDIDATES } from "../home/voting-gql-queries";
import BigNumber from "bignumber.js";
import { fromString } from "iotex-antenna/lib/crypto/address";
import { NATIVE_TOKEN_ABI } from "./native-token-abi";
import EthContract from "ethjs-contract";
import { STAKING_ABI } from "./staking-abi";
import Eth from "../common/ethjs-query";
import { getIoAddressFromRemote } from "./vote-now-steps/vote-now-container";
import {
  getIoAddressFromIoPay,
  getNativeNetworkEndpoint,
  getXAppTokenContract
} from "../xapps/xapp-request";
import { getMobileNativeAntenna } from "../common/get-antenna";
import { toRau } from "iotex-antenna/lib/account/utils";
import { BroadcastStatus } from "../common/broadcast-status";
import { ABI as ERC20_ABI } from "./erc20/abi";
import { Token } from "./erc20/token";
import { Vita } from "./erc20/vita";
import { Contract } from "iotex-antenna/lib/contract/contract";
import { LoadingOutlined, CheckOutlined, MinusOutlined } from "@ant-design/icons";

const ACCOUNT_AREA_WIDTH = 290;

export type TMyStakeStatus = {
  addr: string,
  buckets: Array<Bucket>,
  totalStaking: number,
  unStakePendingAmount: number,
  withdrawableAmount: number,
  totalVotesAmount: string,
  patchArr?: string,
  patchBuckets?: Array<Bucket>
};

type Props = {
  stakingContract: Contract,
  patchStakingContract?: Contract,
  addr?: string,
  stakingDurationSecond?: any,
  vitaContractAddr?: string,
  onRef: (ref: any) => void,
  isNative: boolean,
  isIoPay?: boolean,
  updateTotal?: (total: number) => void,
  stakingContractAddr?: string
};

type State = {
  stakeStatus: ?TMyStakeStatus,
  loaded: boolean,
  invalidNames: Array<string>,
  bucketsExceeded: boolean,
  expandedRowKeys: any,
  showMore: any,
  net: string,
  ioAddress: string,
  claimAble?: boolean,
  txHash?: string
};

const CustomExpandIcon = () => null;

@connect(state => ({
  stakingDurationSecond: state.base.stakingDurationSecond,
  vitaContractAddr: state.smartContract.vitaContractAddr,
  stakingContractAddr: state.smartContract.stakingContractAddr,
  isIoPay: state.base.isIoPay
}))
class MyVotesTable extends Component<Props, State> {
  state: State;
  props: Props;

  constructor(props: Props) {
    super(props);
    this.state = {
      stakeStatus: undefined,
      loaded: false,
      invalidNames: [],
      bucketsExceeded: false,
      expandedRowKeys: [],
      showMore: {},
      net: "",
      ioAddress: ""
    };
  }

  async componentDidMount(): Promise<void> {
    this.props.onRef(this);
    const net =
      window.web3 && window.web3.currentProvider.networkVersion === "42"
        ? "kovan"
        : "main";
    const {
      isNative,
      stakingContractAddr,
      isIoPay,
      vitaContractAddr
    } = this.props;

    let { stakingDurationSecond } = this.props;

    stakingDurationSecond =
      (stakingDurationSecond && stakingDurationSecond[net]) ||
      DEFAULT_STAKING_DURATION_SECOND;

    let ioAddress,
      claimAble = false;
    if (isNative) {
      ioAddress = isIoPay
        ? await getIoAddressFromIoPay()
        : await getIoAddressFromRemote();

      if (isIoPay && vitaContractAddr) {
        try {
          const token = Token.getToken(vitaContractAddr);
          if (token.api instanceof Vita) {
            const claimableAmount = await token.api.claimableAmount(
              ioAddress,
              ioAddress
            );
            claimAble = claimableAmount.isGreaterThan(0);
            window.console.log("claimAble", claimAble);
          }
        } catch (e) {
          window.console.error("claimableAmount error", e);
        }
      }
    }

    const stakeStatus = isNative
      ? await this.getAllNativeStateStatus(
          stakingDurationSecond,
          Boolean(isIoPay)
        )
      : // $FlowFixMe
        await getStakeStatus(stakingContractAddr, stakingDurationSecond);

    if (this.isBucketsExceeded(stakeStatus)) {
      this.setState({ bucketsExceeded: true });
      notification.info({
        message: t("my_stake.buckets_exceeded"),
        duration: 5
      });
    }
    this.setState({
      stakeStatus,
      net,
      loaded: true,
      ioAddress,
      claimAble
    });
    if (this.props.updateTotal) {
      const { buckets, patchBuckets = [] } = stakeStatus;

      this.props.updateTotal(buckets.length + patchBuckets.length);
    }
  }

  isBucketsExceeded(stakeStatus: TMyStakeStatus): boolean {
    const max = 500;

    if (!stakeStatus.patchBuckets) {
      return (
        stakeStatus &&
        stakeStatus.buckets &&
        Boolean(stakeStatus.buckets.length) &&
        stakeStatus.buckets.length >= max
      );
    } else {
      const origin = (stakeStatus && stakeStatus.buckets) || [];
      const patch = (stakeStatus && stakeStatus.patchBuckets) || [];
      const all = origin.concat(patch);

      return Boolean(all.length) && all.length >= max;
    }
  }

  async getAllNativeStateStatus(
    stakingDurationSecond: number,
    isIoPay: boolean
  ): Promise<TMyStakeStatus> {
    const { stakingContract, patchStakingContract } = this.props;
    const {
      addr,
      buckets,
      totalStaking,
      totalVotesAmount,
      unStakePendingAmount,
      withdrawableAmount
    } = await getNativeStakeStatus(
      stakingContract,
      stakingDurationSecond,
      isIoPay
    );

    if (patchStakingContract) {
      const {
        addr: patchAddr,
        buckets: patchBuckets,
        totalStaking: patchTotalStaking,
        totalVotesAmount: patchTotalVotesAmount,
        unStakePendingAmount: patchUnStakePendingAmount,
        withdrawableAmount: patchWithdrawableAmount
      } = await getNativeStakeStatus(
        patchStakingContract,
        stakingDurationSecond,
        isIoPay
      );
      const calcTotal = (origin: string, patch: string) => {
        const originTotal = new BigNumber(origin || 0);
        const patchTotal = new BigNumber(patch || 0);

        return originTotal.plus(patchTotal).toFixed(0);
      };

      return {
        addr,
        patchAddr,
        buckets,
        patchBuckets,
        totalStaking: totalStaking + patchTotalStaking,
        totalVotesAmount: calcTotal(totalVotesAmount, patchTotalVotesAmount),
        unStakePendingAmount: unStakePendingAmount + patchUnStakePendingAmount,
        withdrawableAmount: withdrawableAmount + patchWithdrawableAmount
      };
    } else {
      return {
        addr,
        buckets,
        totalStaking,
        totalVotesAmount,
        unStakePendingAmount,
        withdrawableAmount
      };
    }
  }

  scrollTableToCenter = (invalidNames: Array<string>) => {
    if (this.state.stakeStatus && this.state.stakeStatus.buckets.length > 0) {
      const firstInvalidIndex = this.state.stakeStatus.buckets.findIndex(
        bucket => invalidNames.includes(bucket.canName)
      );
      const tableRow = window.document.querySelector(
        `.MyStakeInfo table tbody tr:nth-child(${firstInvalidIndex + 1})`
      );
      const clientHeight = window.document.body.clientHeight;
      const offsetTop = getOffset(tableRow).top;
      window.document.documentElement.scrollTop = offsetTop - clientHeight / 2;

      this.setState({ invalidNames });
    }
  };

  setRowClassName = (record: any) => {
    return this.state.invalidNames.includes(record.canName)
      ? "BorderRowWarning"
      : "";
  };

  showMore = (id: any) => {
    const { showMore } = this.state;
    showMore[id] = true;
    this.setState({
      showMore: { ...showMore }
    });
  };

  renderReward = (bpCandidates: any, record: any) => {
    const { id } = record;
    const bpCandidate =
      bpCandidates.find(v => v.registeredName === record.canName) || {};
    const {
      blockRewardPortion,
      epochRewardPortion,
      foundationRewardPortion,
      rewardPlan
    } = bpCandidate;
    if (!rewardPlan) {
      return null;
    }
    const { showMore } = this.state;
    return (
      <p style={{ padding: "0 40px" }}>
        <span>
          {`${t("profile.block_reward_portion")}: ${blockRewardPortion} %, `}
        </span>
        <span>
          {`${t("profile.epoch_reward_portion")}: ${epochRewardPortion} %, `}
        </span>
        <span>
          {`${t(
            "profile.foundation_reward_portion"
          )}: ${foundationRewardPortion} %.`}
        </span>
        <br />
        {rewardPlan.length > 300 && !showMore[id] ? (
          <span>
            {`${rewardPlan.substr(0, 250)}...`}{" "}
            <a
              onClick={() => this.showMore(id)}
              style={{
                paddingLeft: "5px",
                color: colors.PRODUCING
              }}
            >
              {t("voting.delegate_show_more")}
            </a>
          </span>
        ) : (
          <span>{rewardPlan}</span>
        )}
      </p>
    );
  };

  renderAction = (text: any, record: any) => {
    if (record.canName) {
      return (
        <Flex column={true} alignItems={"baseline"} color={colors.black}>
          <a
            href={"#"}
            style={{
              padding: "3px 0",
              color: colors.PRODUCING,
              fontWeight: "bold",
              lineHeight: 1.36
            }}
          >
            {text}
          </a>
          <TimeSpan>{record.roleName || ""}</TimeSpan>
          {this.state.invalidNames.includes(record.canName) ? (
            <TimeSpan style={{ color: colors.voteWarning }}>
              Invalid voting name.
            </TimeSpan>
          ) : null}
        </Flex>
      );
    }

    const { stakingContract, addr } = this.props;
    return (
      <Flex center={true} column={true} alignItems={"baseline"}>
        <RevoteModal
          bucketIndex={record.id}
          canName={record.canName}
          stakingContract={stakingContract}
          addr={addr}
          clickable={
            <Button type="primary" style={{ marginBottom: "7px" }}>
              {t("candidates.vote_now")}
            </Button>
          }
        />
      </Flex>
    );
  };

  async claimVita(): Promise<string> {
    const { ioAddress } = this.state;
    const { vitaContractAddr } = this.props;
    if (ioAddress && vitaContractAddr) {
      try {
        const vitaContract = await getXAppTokenContract(
          ERC20_ABI,
          vitaContractAddr
        );
        const txHash = await vitaContract.methods.claim({
          gasLimit: DEFAULT_STAKING_GAS_LIMIT,
          gasPrice: toRau("1", "Qev"),
          account: ioAddress
        });
        window.console.log("claimVita txHash", txHash);
        return txHash;
      } catch (e) {
        window.console.error("claimVita error", "color: blue", e.message);
      }
    }
    return "";
  }

  render() {
    const {
      loaded,
      stakeStatus,
      net,
      ioAddress,
      claimAble,
      txHash
    } = this.state;
    const { expandedRowKeys } = this.state;
    const timeformat = net === "kovan" ? "yyyy/mm/dd HH:MM" : "yyyy/mm/dd";
    const {
      stakingContract,
      patchStakingContract,
      addr,
      stakingDurationSecond,
      isNative,
      isIoPay
    } = this.props;
    const tokenType = isNative ? "IOTX" : "IOTX-E";

    const networkStakeDuringSeconds =
      (stakingDurationSecond && stakingDurationSecond[net]) ||
      DEFAULT_STAKING_DURATION_SECOND;

    if (!loaded && isNative && !isIoPay) {
      notification.warn({
        message: t("my_votes.nativeStaking.open_ioPay_alert"),
        duration: 5
      });

      return (
        <Flex justifyContent="flex-start">
          <LoadingOutlined />
          <div style={{ marginLeft: "10px", color: colors.black80 }}>
            {t("my_votes.nativeStaking.open_ioPay_tip")}
          </div>
        </Flex>
      );
    }

    const onExpand = (record: any, bpCandidates: any) => (e: any) => {
      const { id, canName } = record;
      e.preventDefault();
      const index = expandedRowKeys.findIndex(v => v === id);
      if (index === -1) {
        expandedRowKeys.push(id);
      } else {
        expandedRowKeys.splice(index, 1);
      }
      if (!bpCandidates.find(bp => bp.registeredName === canName)) {
        return notification.error({
          message: t("voting.delegate_reward_view_error"),
          duration: 5
        });
      }
      this.setState({ expandedRowKeys });
    };

    const DisplayMyStakeCols = (bpCandidates: any) => [
      {
        title: (
          <b style={{ marginLeft: "19px" }}>{t("my_stake.staking_bucket")}</b>
        ),
        dataIndex: "id",
        className: "BorderTop BorderLeft BorderBottom",
        render(text, record) {
          // Can not use index here because of antd table will reset the index as soon as pagination changed
          const no =
            record.patchDummyId !== undefined ? record.patchDummyId : record.id;

          return (
            <Flex
              column={true}
              alignItems={"baseline"}
              paddingLeft={"40px"}
              paddingBottom={"14px"}
              media={{
                [media.media700]: {
                  paddingLeft: "8px"
                }
              }}
            >
              <Flex
                minWidth={"186px"}
                alignContent={"flex-start"}
                justifyContent={"left"}
              >
                <Avatar
                  shape="square"
                  src={"/my-staking/box.png"}
                  size={40}
                  style={{ margin: "14px 10px 8px 0" }}
                />
                <Flex
                  column={true}
                  alignItems={"baseline"}
                  color={colors.black}
                  width={"100px"}
                  padding={"7px 0"}
                  media={{
                    [media.media700]: {
                      width: "100%"
                    }
                  }}
                >
                  <BoldText>{t("my_stake.order_no", { no })}</BoldText>
                  <BoldText style={{ whiteSpace: "nowrap" }}>
                    {t(
                      isNative
                        ? "my_stake.native_staked_amount_format"
                        : "my_stake.staked_amount_format",
                      {
                        amountText: record.stakedAmount.toLocaleString()
                      }
                    )}
                  </BoldText>
                </Flex>
              </Flex>
              <Flex width={"100%"} padding={"1px 0 1px 0"}>
                <StatisticSpan style={{ width: "50%" }}>
                  {t("my_stake.staking_power")}
                </StatisticSpan>
                <StatisticValue style={{ width: "50%" }}>
                  {t("my_stake.staking_power.estimate", {
                    total: getPowerEstimation(
                      record.stakedAmount,
                      record.stakeDuration,
                      0
                    ).total.toFormat(0)
                  })}
                </StatisticValue>
              </Flex>
              {!isNative && (
                <a
                  onClick={onExpand(record, bpCandidates)}
                  style={{
                    padding: "3px 0",
                    color: colors.PRODUCING,
                    fontWeight: "bold",
                    lineHeight: 1.36
                  }}
                >
                  {expandedRowKeys.includes(record.id)
                    ? t("voting.delegate_reward_hide")
                    : t("voting.delegate_reward_view")}
                </a>
              )}
            </Flex>
          );
        }
      },
      {
        title: (
          <span style={{ whiteSpace: "nowrap" }}>{t("my_stake.vote_for")}</span>
        ),
        dataIndex: "canName",
        className: "BorderTop BorderBottom",
        render: this.renderAction
      },
      {
        title: (
          <span style={{ whiteSpace: "nowrap" }}>
            {t("my_stake.stake_duration")}
          </span>
        ),
        dataIndex: "stakeDuration",
        className: "BorderTop BorderBottom",
        render(text, record) {
          return (
            <Flex column={true} alignItems={"baseline"}>
              <CellSpan>
                {t(
                  net === "kovan"
                    ? "my_stake.duration_epochs.kovan"
                    : "my_stake.duration_epochs",
                  { stakeDuration: text }
                )}
              </CellSpan>
              <TimeSpan>
                {t("my_stake.from_time", {
                  startTime: dateformat(
                    new Date(record.stakeStartTime),
                    timeformat
                  )
                })}
              </TimeSpan>
            </Flex>
          );
        }
      },
      {
        title: (
          <span style={{ whiteSpace: "nowrap" }}>{t("my_stake.nonDecay")}</span>
        ),
        dataIndex: "nonDecay",
        className: "BorderTop BorderBottom",
        render(t: any) {
          return t ? (
            <CheckOutlined
              style={{ color: colors.VERIFYING, fontSize: "20px" }}
            />
          ) : (
            <MinusOutlined
              style={{ color: colors.MISSED, fontSize: "24px" }}
            />
          );
        }
      },
      {
        title: (
          <span style={{ whiteSpace: "nowrap" }}>
            {t("my_stake.bucket_status")}
          </span>
        ),
        dataIndex: "stakeStartTime",
        className: "BorderTop BorderBottom",
        render(_text: any, record: any) {
          let time;
          let status;
          const bucketStatus = record.getStatus();
          if (bucketStatus === "withdrawable") {
            status = "my_stake.status.withdrawable";
            time = new Date(record.withdrawWaitUntil).toLocaleDateString();
          } else if (bucketStatus === "unstaking") {
            status = "my_stake.status.unstaking";
            time = new Date(record.withdrawWaitUntil).toLocaleDateString();
          } else if (bucketStatus === "staking") {
            status = "my_stake.status.ongoing";
            const date = new Date(record.stakeStartTime);
            date.setTime(
              date.getTime() +
                record.stakeDuration * networkStakeDuringSeconds * 1000
            );
            const today = new Date();
            if (
              date.getFullYear() === today.getFullYear() &&
              date.getMonth() === today.getMonth() &&
              date.getDate() === today.getDate()
            ) {
              time = date.toLocaleTimeString();
            } else {
              time = date.toLocaleDateString();
            }
          } else {
            status = "my_stake.status.no_stake_starttime";
            time = "---";
          }

          return (
            <Flex column={true} alignItems={"baseline"}>
              <CellSpan>{t(status)}</CellSpan>
              <TimeSpan>
                {bucketStatus !== "staking"
                  ? t(`${status}.prefix`, { time })
                  : ""}
              </TimeSpan>
            </Flex>
          );
        }
      },
      {
        title: "",
        className: "BorderTop BorderBottom BorderRight",
        render(_, record: Bucket) {
          // @ts-ignore
          const contract = record.isPatch
            ? patchStakingContract
            : stakingContract;
          const menu = renderActionMenu(
            record,
            contract,
            addr || "",
            networkStakeDuringSeconds,
            isNative
          );
          return (
            <Dropdown overlay={menu} trigger={["click"]}>
              <Button>
                {t("my_stake.edit.row")} <Icon type="down" />
              </Button>
            </Dropdown>
          );
        }
      }
    ];

    let claimElement = (
      <a
        target={"_blank"}
        href={
          "https://medium.com/iotex/claiming-vita-step-by-step-instructions-d3e47da997db"
        }
      >
        <Button type="primary" style={{ marginBottom: "7px" }}>
          {t("my_stake.claim_vita")}
        </Button>
      </a>
    );

    if (isIoPay) {
      claimElement = (
        <div>
          <Button
            type="primary"
            disabled={!claimAble}
            style={{ marginBottom: "7px" }}
            onClick={() => {
              // eslint-disable-next-line no-unused-vars
              this.claimVita().then(txHash => {
                if (txHash) {
                  this.setState({ txHash, claimAble: false });
                } else {
                  notification.error({
                    message: t("member.join_error_title")
                  });
                }
              });
            }}
          >
            {t("my_stake.claim_vita")}
          </Button>
          {txHash && <BroadcastStatus txHash={txHash} isNative={isNative} />}
        </div>
      );
    }

    return (
      <Flex
        alignItems={"flex-start"}
        media={{
          [media.media1024]: {
            flexDirection: "column !important"
          }
        }}
      >
        <Flex
          width={"100%"}
          overflowX={"scroll"}
          marginRight={"23px"}
          maxWidth={`calc(100% - ${ACCOUNT_AREA_WIDTH + 23}px)`}
          media={{
            [media.media1024]: {
              maxWidth: "100% !important",
              marginRight: "0 !important"
            }
          }}
        >
          <Query ssr={false} query={GET_BP_CANDIDATES}>
            {({ data }) => {
              const bpCandidates = (data && data.bpCandidates) || [];
              const originBuckets = (stakeStatus && stakeStatus.buckets) || [];
              const patchBuckets =
                (stakeStatus && stakeStatus.patchBuckets) || [];

              // use to distinct bucket
              patchBuckets.forEach(bucket => {
                bucket.isPatch = true;
              });

              const dataSource = originBuckets.concat(patchBuckets);
              if (patchBuckets && patchBuckets.length) {
                for (let i = 0; i < dataSource.length; i++) {
                  // $FlowFixMe patch id for native patch contract
                  dataSource[i].patchDummyId = i;
                }
              }

              return (
                <Table
                  className={"MyStakeInfo"}
                  rowClassName={this.setRowClassName}
                  style={{ width: "100%" }}
                  pagination={{ pageSize: 6 }}
                  columns={DisplayMyStakeCols(bpCandidates)}
                  dataSource={dataSource}
                  expandIcon={CustomExpandIcon}
                  expandedRowRender={record =>
                    this.renderReward(bpCandidates, record)
                  }
                  expandIconAsCell={false}
                  expandedRowKeys={expandedRowKeys}
                  rowKey="id"
                />
              );
            }}
          </Query>
        </Flex>
        <Flex
          column={true}
          alignItems={"baseline"}
          maxWidth={`${ACCOUNT_AREA_WIDTH}px`}
          backgroundColor={colors.black10}
          padding={"24px"}
          fontSize={"12px"}
          marginBottom={"24px"}
        >
          <b>{t("my_stake.address")}</b>
          <LabelText>
            {isNative ? ioAddress : window.web3.eth.accounts[0]}
          </LabelText>
          <b>{t("my_stake.staking_amount")}</b>
          <LabelText>
            {this.state.stakeStatus &&
              this.state.stakeStatus.totalStaking.toLocaleString()}{" "}
            {tokenType}
          </LabelText>
          <b>{t("my_stake.unstake_pendding_amount")}</b>
          <LabelText>
            {this.state.stakeStatus &&
              this.state.stakeStatus.unStakePendingAmount.toLocaleString()}{" "}
            {tokenType}
          </LabelText>
          <b>{t("my_stake.withdrawable_amount")}</b>
          <LabelText>
            {this.state.stakeStatus &&
              this.state.stakeStatus.withdrawableAmount.toLocaleString()}{" "}
            {tokenType}
          </LabelText>
          <b>{t("my_stake.votes_amount")}</b>
          <LabelText>
            {this.state.stakeStatus && this.state.stakeStatus.totalVotesAmount}{" "}
            {tokenType}
          </LabelText>
          {claimElement}
          <a
            target={"_blank"}
            style={{
              color: colors.PRODUCING,
              fontSize: "12px",
              fontWeight: "bold"
            }}
            href={
              isIoPay
                ? `https://${getNativeNetworkEndpoint(
                    getMobileNativeAntenna().currentProvider()
                  )}/address/${ioAddress}`
                : `https://${getEthworkAddress(
                    window.web3.currentProvider
                  )}/address/${window.web3.eth.accounts[0]}`
            }
          >
            {t("my_stake.to_transaction_history")}
          </a>
        </Flex>
      </Flex>
    );
  }
}

export function calcStats(
  addr: string,
  bucketIds: any,
  resp: any,
  stakingDurationSecond: number = DEFAULT_STAKING_DURATION_SECOND
): TMyStakeStatus {
  const stakeStatus: TMyStakeStatus = {
    addr,
    buckets: [],
    totalStaking: 0,
    unStakePendingAmount: 0,
    withdrawableAmount: 0,
    totalVotesAmount: "0"
  };
  let bigTotalVotesAmount = new BigNumber(0);
  for (let i = 0; i < resp.length; i++) {
    const bucket = Bucket.fromContractRes(
      bucketIds[i],
      resp[i],
      stakingDurationSecond
    );
    stakeStatus.buckets.push(bucket);
    const totalVotes = getPowerEstimation(
      bucket.stakedAmount,
      bucket.stakeDuration,
      0
    ).total;
    bigTotalVotesAmount = bigTotalVotesAmount.plus(totalVotes);
    if (bucket.getStatus() === "staking") {
      stakeStatus.totalStaking += bucket.stakedAmount;
    } else if (bucket.getStatus() === "unstaking") {
      stakeStatus.unStakePendingAmount += bucket.stakedAmount;
    } else if (bucket.getStatus() === "withdrawable") {
      stakeStatus.withdrawableAmount += bucket.stakedAmount;
    }
  }
  stakeStatus.totalVotesAmount = bigTotalVotesAmount.toFixed(0);
  return stakeStatus;
}

function getOffset(el) {
  let top = el.offsetTop;
  let left = el.offsetLeft;
  el = el.offsetParent;
  while (el) {
    top += el.offsetTop;
    left += el.offsetLeft;
    el = el.offsetParent;
  }
  return { top, left };
}

export async function getStakeStatus(
  stakingContractAddr: string,
  stakingDurationSecond: number
): Promise<TMyStakeStatus> {
  const web3 = window.web3;
  const eth = new Eth(web3 && web3.currentProvider);
  const contract = new EthContract(eth)(STAKING_ABI).at(stakingContractAddr);

  const addr =
    (web3 && web3.eth && web3.eth.accounts && web3.eth.accounts[0]) || "";
  let resp = await contract.getBucketIndexesByAddress(addr, { from: addr });
  const bucketIds = (resp && resp[0].map(id => id.toNumber())) || [];
  resp = await Promise.all(
    bucketIds.map(id => contract.buckets(id, { from: addr }))
  );
  return calcStats(addr, bucketIds, resp, stakingDurationSecond);
}

export async function getNativeStakeStatus(
  contract: Contract,
  stakingDurationSecond: number,
  isIoPay?: boolean
): Promise<TMyStakeStatus> {
  const addr = isIoPay
    ? await getIoAddressFromIoPay()
    : await getIoAddressFromRemote();

  let resp = await contract.methods.getPyggIndexesByAddress(addr, {
    from: addr,
    gas: 600000
  });
  const bucketIds = resp.map(id => id.toNumber()) || [];
  resp = await Promise.all(
    bucketIds.map(id =>
      contract.methods.pyggs(id, {
        from: addr,
        gas: 600000
      })
    )
  ); // FIXME: confirm params?
  resp = nativeResponseMap(resp);
  return calcStats(addr, bucketIds, resp, stakingDurationSecond);
}

function nativeResponseMap(response: Array<Array<any>>) {
  const fields = NATIVE_TOKEN_ABI.find(item => item.name === "pyggs").outputs;
  return response.map(ary =>
    ary.reduce((acc, cur, index) => {
      const key = fields[index].name;
      let value = cur;

      if (key === "canName") {
        // eslint-disable-next-line no-undef
        const str = new TextDecoder("utf-8").decode(cur);
        value = encodeCandidateHexName(str);
      }

      if (key === "pyggOwner") {
        value = fromString(cur).stringEth();
        acc["bucketOwner"] = value;
      } else {
        acc[key] = value;
      }

      acc[index] = value;
      return acc;
    }, {})
  );
}

export { MyVotesTable };
