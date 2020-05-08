// tslint:disable:no-any
import CheckOutlined from "@ant-design/icons/CheckOutlined";
import MinusOutlined from "@ant-design/icons/MinusOutlined";
import Avatar from "antd/lib/alert";
import Table from "antd/lib/table";
import dateformat from "dateformat";
import {t} from "onefx/lib/iso-i18n";
import {styled} from "onefx/lib/styletron-react";
import React, {Component} from "react";
import {Flex} from "../common/flex";
import {colors} from "../common/styles/style-color";
import {media} from "../common/styles/style-media";

const CustomExpandIcon = () => null;
const ACCOUNT_AREA_WIDTH = 290;

type Props = {};
type State = {
  invalidNames: String;
  expandedRowKeys: Array<String>;
  showMore: any;
  net: String;
};

class MyVotesTable extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      invalidNames: "",
      expandedRowKeys: [],
      showMore: {},
      net: "kovan"
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
          <a
            // tslint:disable-next-line:react-a11y-anchors
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

    return null;
  };
  // tslint:disable-next-line:max-func-body-length
  render(): JSX.Element {
    const bpCandidates: any = [];
    const dataSource: any = [];
    const { expandedRowKeys } = this.state;

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

          render(text: any, record: any): JSX.Element {
            // Can not use index here because of antd table will reset the index as soon as pagination changed
            const no =
              record.patchDummyId !== undefined
                ? record.patchDummyId
                : record.id;

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
                    // @ts-ignore
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
                      total: "0"
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
            const { net } = this.state;
            const timeformat =
              net === "kovan" ? "yyyy/mm/dd HH:MM" : "yyyy/mm/dd";
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

          render(text: any, record: any): JSX.Element {
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
          className: "BorderTop BorderBottom BorderRight"
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
          {/*
        // @ts-ignore */}
          <Table
            className={"MyStakeInfo"}
            rowClassName={this.setRowClassName}
            style={{ width: "100%" }}
            pagination={{ pageSize: 6 }}
            columns={DisplayMyStakeCols(bpCandidates)}
            dataSource={dataSource}
            expandIcon={CustomExpandIcon}
            expandedRowRender={(record: any) =>
              this.renderReward(bpCandidates, record)
            }
            // @ts-ignore
            expandIconAsCell={false}
            // @ts-ignore
            expandedRowKeys={expandedRowKeys}
            rowKey="id"
          />
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
          <LabelText>unknow</LabelText>
          <b>{t("my_stake.staking_amount")}</b>
          <LabelText>unknow</LabelText>
          <b>{t("my_stake.unstake_pendding_amount")}</b>
          <LabelText>unknow</LabelText>
          <b>{t("my_stake.withdrawable_amount")}</b>
          <LabelText>unknow</LabelText>
          <b>{t("my_stake.votes_amount")}</b>
          <LabelText>unknow</LabelText>
        </Flex>
      </Flex>
    );
  }
}

export { MyVotesTable };
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
