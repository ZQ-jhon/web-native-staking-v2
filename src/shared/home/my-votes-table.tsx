// tslint:disable:no-any
import CheckOutlined from "@ant-design/icons/CheckOutlined";
import {DownOutlined} from "@ant-design/icons/lib";
import MinusOutlined from "@ant-design/icons/MinusOutlined";
import {Avatar, Button, Dropdown, notification} from "antd";
import Table from "antd/lib/table";
import { BigNumber } from "bignumber.js";
import dateformat from "dateformat";
import {fromRau} from "iotex-antenna/lib/account/utils";
import {SpinPreloader} from "iotex-react-block-producers/lib/spin-preloader";
import {t} from "onefx/lib/iso-i18n";
import {styled} from "onefx/lib/styletron-react";
import React, {Component} from "react";
import { Query } from "react-apollo";
import {AddressName} from "../common/address-name";
import {webBpApolloClient} from "../common/apollo-client";
import {Flex} from "../common/flex";
import {getStaking} from "../common/get-staking";
import {IopayRequired} from "../common/iopay-required";
import {colors} from "../common/styles/style-color";
import {media} from "../common/styles/style-media";
import {Bucket, DEFAULT_STAKING_DURATION_SECOND, getPowerEstimation} from "../common/token-utils";
import {GET_BP_CANDIDATES} from "../staking/smart-contract-gql-queries";
import {renderActionMenu} from "../staking/stake-edit/modal-menu";

const CustomExpandIcon = () => null;
const ACCOUNT_AREA_WIDTH = 290;

export type TMyStakeStatus = {
  addr: string,
  buckets: Array<Bucket>,
  totalStaking: number,
  unStakePendingAmount: number,
  withdrawableAmount: number,
  totalVotesAmount: string,
};

type Props = {};
type State = {
  invalidNames: string;
  expandedRowKeys: Array<string>;
  showMore: any;
  stakeStatus?: TMyStakeStatus;
  address?: string;
};

// @ts-ignore
@IopayRequired
class MyVotesTable extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      invalidNames: "",
      expandedRowKeys: [],
      showMore: {},
      address: "",
    };
  }

  setRowClassName = (record: any) => {
    return this.state.invalidNames.includes(record.canName)
      ? "BorderRowWarning"
      : "";
  };
  showMore = (id: String) => {
    const { showMore } = this.state;
    // @ts-ignore
    showMore[id] = true;
    this.setState({
      showMore: { ...showMore }
    });
  };
  renderReward = (bpCandidates: any, record: any) => {
    const { id } = record;
    const bpCandidate =
      bpCandidates.find((v: any) => v.registeredName === record.canName) || {};
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
              // tslint:disable-next-line:react-a11y-anchors
              role="button"
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
          <span
            className="ellipsis-text"
            style={{ maxWidth: "9vw", minWidth: 70 }}
          >
          <AddressName address={text} className={"StakingLink"} />
        </span>
          <TimeSpan>{record.roleName || ""}</TimeSpan>
          {this.state.invalidNames.includes(record.canName) ? (
            <TimeSpan style={{ color: colors.voteWarning }}>
              Invalid voting name.
            </TimeSpan>
          ) : null}
        </Flex>
      );
    }

    return null;
  };

  async componentDidMount(): Promise<void> {
    const staking = getStaking();
    const [height, address] = await Promise.all([
      staking.getHeight(),
      staking.getIoPayAddress()
    ]);
    const bucketsByVoter = await staking.getBucketsByVoter(
      address,
      0,
      1000,
      height
    );

    const buckets = bucketsByVoter.map(it => {
      const bk = Bucket.fromFormInput(it.candidate,
        it.autoStake,
        it.stakedDuration,
        Number(fromRau(it.stakedAmount, "IOTX")),
        it.index);
      bk.bucketOwner = it.owner;
      bk.stakeStartTime = it.stakeStartTime?it.stakeStartTime.toDateString():"";
      bk.unstakeStartTime = it.unstakeStartTime?it.unstakeStartTime.toDateString():"";
      return bk;
    });
    const {
      totalStaking,
      totalVotesAmount,
      unStakePendingAmount,
      withdrawableAmount
    } = await getNativeStakeStatus(
      address,
      buckets
    );
    // @ts-ignore
    this.setState({
      stakeStatus: {
        buckets,
        addr: address,
        totalStaking,
        unStakePendingAmount,
        withdrawableAmount,
        totalVotesAmount
      },
      address
    });
  }

  // tslint:disable-next-line:max-func-body-length
  render(): JSX.Element {
    const { expandedRowKeys, stakeStatus, address } = this.state;
    const networkStakeDuringSeconds = DEFAULT_STAKING_DURATION_SECOND;
    // @ts-ignore
    const DisplayMyStakeCols = (bpCandidates: any): Array<any> =>
      // tslint:disable-next-line:max-func-body-length
      [
        {
          title: (
            <b style={{ marginLeft: "19px" }}>{t("my_stake.staking_bucket")}</b>
          ),
          dataIndex: "id",
          className: "BorderTop BorderLeft BorderBottom",
          // @ts-ignore

          render(text: any, record: Bucket): JSX.Element {
            // Can not use index here because of antd table will reset the index as soon as pagination changed
            const no = record.id;

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
                  {/*
                // @ts-ignore */}
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
                    <BoldText>{
                      // @ts-ignore
                      t("my_stake.order_no", { no })}
                    </BoldText>
                    <BoldText style={{ whiteSpace: "nowrap" }}>
                      {t("my_stake.native_staked_amount_format",
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
              </Flex>
            );
          }
        },
        {
          title: (
            <span style={{ whiteSpace: "nowrap" }}>
              {t("my_stake.vote_for")}
            </span>
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

          render(text: any, record: any): JSX.Element {
            const timeformat = "yyyy/mm/dd";
            return (
              <Flex column={true} alignItems={"baseline"}>
                <CellSpan>
                  {t("my_stake.duration_epochs",{ stakeDuration: text })}
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
            <span style={{ whiteSpace: "nowrap" }}>
              {t("my_stake.nonDecay")}
            </span>
          ),
          dataIndex: "nonDecay",
          className: "BorderTop BorderBottom",
          render(t: Boolean): JSX.Element {
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
          // @ts-ignore
          render(text: any, record: Bucket): JSX.Element {
            let time;
            let status;
            const bucketStatus = record.getStatus();
            if (bucketStatus === "withdrawable") {
              status = "my_stake.status.withdrawable";
              time = record.withdrawWaitUntil? (new Date(record.withdrawWaitUntil).toLocaleDateString()): "";
            } else if (bucketStatus === "unstaking") {
              status = "my_stake.status.unstaking";
              time = record.unstakeStartTime? (new Date(record.unstakeStartTime).toLocaleDateString()): "";
            } else if (bucketStatus === "staking") {
              status = "my_stake.status.ongoing";
              const date = new Date(record.stakeStartTime);
              date.setTime(date.getTime() + record.stakeDuration * 1000);
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
                  {bucketStatus !== "staking" && time
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
          // @ts-ignore
          render(text: any, record: Bucket): JSX.Element {
            const menu = renderActionMenu(
              record,
              address || "",
              networkStakeDuringSeconds,
            );
            return (
              <Dropdown overlay={menu} trigger={["click"]}>
                <Button>
                  {t("my_stake.edit.row")} <DownOutlined />
                </Button>
              </Dropdown>
            );
          }
        }
      ];
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
          width="100%"
          alignItems={"flex-start"}
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
          <Query ssr={false}
                 client={webBpApolloClient}
                 query={GET_BP_CANDIDATES}>
            {
              // @ts-ignore
              ({ data, loading, error}) => {
                if (!loading && error) {
                  notification.error({ message: error.message });
                  return <></>;
                }
              const bpCandidates = (data && data.bpCandidates) || [];
              const dataSource = (stakeStatus && stakeStatus.buckets) || [];

              return (
                <SpinPreloader spinning={loading}>
                  {
                    // @ts-ignore
                    <Table
                      className={"MyStakeInfo"}
                      rowClassName={this.setRowClassName}
                      style={{ width: "100%" }}
                      pagination={{ pageSize: 6 }}
                      columns={DisplayMyStakeCols(bpCandidates)}
                      dataSource={dataSource}
                      expandIcon={CustomExpandIcon}
                      expandedRowRender={
                        // @ts-ignore
                        record => this.renderReward(bpCandidates, record)
                      }
                      expandIconAsCell={false}
                      expandedRowKeys={expandedRowKeys}
                      rowKey="id"
                    />
                  }
                </SpinPreloader>
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
          <LabelText>{this.state.address}</LabelText>
          <b>{t("my_stake.staking_amount")}</b>
          <LabelText>
            {
            `${this.state.stakeStatus && this.state.stakeStatus.totalStaking.toLocaleString()} IOTX`
            }
          </LabelText>
          <b>{t("my_stake.unstake_pendding_amount")}</b>
          <LabelText>
            {
              `${this.state.stakeStatus && this.state.stakeStatus.unStakePendingAmount.toLocaleString()} IOTX`
            }
          </LabelText>
          <b>{t("my_stake.withdrawable_amount")}</b>
          <LabelText>
            {
              `${this.state.stakeStatus && this.state.stakeStatus.withdrawableAmount.toLocaleString()} IOTX`
            }
          </LabelText>
          <b>{t("my_stake.votes_amount")}</b>
          <LabelText>
            {
              `${this.state.stakeStatus && this.state.stakeStatus.totalVotesAmount} IOTX`
            }
          </LabelText>
        </Flex>
      </Flex>
    );
  }
}

export { MyVotesTable };

export async function getNativeStakeStatus(
  addr: string,
  buckets: Array<Bucket>
): Promise<TMyStakeStatus> {
  let bigTotalVotesAmount = new BigNumber(0);
  const stakeStatus: TMyStakeStatus = {
    addr,
    buckets: buckets,
    totalStaking: 0,
    unStakePendingAmount: 0,
    withdrawableAmount: 0,
    totalVotesAmount: "0"
  };

  buckets.forEach(bucket => {
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
  });
  stakeStatus.totalVotesAmount = bigTotalVotesAmount.toFixed(0);
  return stakeStatus;
}

const BoldText = styled("b", {
  fontSize: "12px"
});
const StatisticSpan = styled("span", {
  fontSize: "10px",
  color: colors.black80
});
const StatisticValue = styled("span", {
  fontSize: "10px",
  color: colors.black95
});
const TimeSpan = styled("span", {
  fontSize: "10px",
  color: colors.black80
});
const CellSpan = styled("span", {
  fontSize: "12px",
  color: colors.black,
  padding: "3px 0"
});
const LabelText = styled("span", props => ({
  fontSize: "14px",
  marginBottom: "24px",
  wordBreak: "break-word",
  ...props
}));
