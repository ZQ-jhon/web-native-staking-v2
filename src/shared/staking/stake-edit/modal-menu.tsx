// @flow
// $FlowFixMe
import { Menu } from "antd";
import { t } from "onefx/lib/iso-i18n";
import React from "react";
import { getStatus, IBucket } from "../../../server/gateway/staking";
import { colors } from "../../common/styles/style-color2";
import { DEFAULT_STAKING_DURATION_SECOND } from "../../common/token-utils";
import { AddStakingModal } from "./add-staking-modal";
import { RestakeModal } from "./restake-modal";
import { RevoteModal } from "./revote-modal";
import { UnstakeModal } from "./unstake-modal";
import { WithdrawModal } from "./withdraw-modal";

const MSEC_PER_DAY = 24 * 60 * 60 * 1000;
const ACTION_ROW_STYLE = {
  style: {
    color: colors.black,
    fontSize: "12px",
    height: "30px",
    display: "flex",
    justifyContent: "space-between",
  },
};
const ACTION_ROW_DISABLED = {
  style: {
    ...ACTION_ROW_STYLE.style,
    color: colors.black65,
    cursor: "not-allowed",
  },
  // tslint:disable-next-line:no-any
  onClick: (e: any) => e.stopPropagation(),
};
const menuInfoStyle = {
  color: colors.black80,
  width: "100px",
  marginLeft: "20px",
  display: "inline-block",
  textAlign: "left",
};
const menuInfoStyleDisabled = {
  ...menuInfoStyle,
  color: colors.black65,
};

function renderRevote(record: IBucket): JSX.Element {
  const status = getStatus(
    record.withdrawWaitUntil,
    record.unstakeStartTime,
    record.stakeStartTime
  );

  switch (status) {
    case "staking":
      return (
        <div {...ACTION_ROW_STYLE}>
          <span>{t("my_stake.edit.revote")}</span>
          {
            // @ts-ignore
            <span style={menuInfoStyle}>
              {t("my_stake.status.suffix.anytime")}
            </span>
          }
        </div>
      );
    case "unstaking":
      return (
        <div {...ACTION_ROW_DISABLED}>
          <span>{t("my_stake.edit.revote")}</span>
          {
            // @ts-ignore
            <span style={menuInfoStyleDisabled}>
              {t("my_stake.status.suffix.not_applicable")}
            </span>
          }
        </div>
      );
    case "withdrawable":
      return (
        <div {...ACTION_ROW_DISABLED}>
          <span>{t("my_stake.edit.revote")}</span>
          {
            // @ts-ignore
            <span style={menuInfoStyleDisabled}>
              {t("my_stake.status.suffix.anytime")}
            </span>
          }
        </div>
      );
    default:
      return <></>;
  }
}

function renderRestake(record: IBucket): JSX.Element {
  const status = getStatus(
    record.withdrawWaitUntil,
    record.unstakeStartTime,
    record.stakeStartTime
  );

  return ["staking", "unstaking", "withdrawable"].includes(status) ? (
    <div {...ACTION_ROW_STYLE}>
      <span>{t("my_stake.edit.restake")}</span>
      {
        // @ts-ignore
        <span style={menuInfoStyle}>{t("my_stake.status.suffix.anytime")}</span>
      }
    </div>
  ) : (
    <></>
  );
}

function renderUnstake(record: IBucket): JSX.Element {
  if (record.stakedDuration === 0) {
    return (
      <div {...ACTION_ROW_STYLE}>
        <span>{t("my_stake.edit.unstake")}</span>
        {
          // @ts-ignore
          <span style={menuInfoStyle}>
            {t("my_stake.status.suffix.anytime")}
          </span>
        }
      </div>
    );
  }
  if (!record.stakeStartTime) {
    return <div>no stakeStartTime</div>;
  }

  const status = getStatus(
    record.withdrawWaitUntil,
    record.unstakeStartTime,
    record.stakeStartTime
  );
  const today = new Date();
  const startTime = record.stakeStartTime;
  const stakingDurationSecond = DEFAULT_STAKING_DURATION_SECOND;
  const endTime = new Date(
    startTime.getTime() + record.stakedDuration * stakingDurationSecond * 1000
  );
  let disabled = today <= endTime;
  const time =
    // @ts-ignore
    Math.abs(today - endTime) < MSEC_PER_DAY
      ? endTime.toLocaleTimeString()
      : endTime.toLocaleDateString();
  let menuInfo = t("my_stake.status.suffix.from", { time });
  if (record.autoStake) {
    disabled = true;
    menuInfo = t("my_stake.status.suffix.not_applicable");
  }

  switch (status) {
    case "staking":
      return (
        <div {...(disabled ? ACTION_ROW_DISABLED : ACTION_ROW_STYLE)}>
          <span>{t("my_stake.edit.unstake")}</span>
          {
            // @ts-ignore
            // tslint:disable-next-line:use-simple-attributes
            <span style={disabled ? menuInfoStyleDisabled : menuInfoStyle}>
              {menuInfo}
            </span>
          }
        </div>
      );
    case "unstaking":
      return (
        <div {...ACTION_ROW_DISABLED}>
          <span>{t("my_stake.edit.unstake")}</span>
          {
            // @ts-ignore
            <span style={menuInfoStyleDisabled}>
              {t("my_stake.status.suffix.not_applicable")}
            </span>
          }
        </div>
      );
    case "withdrawable":
      return (
        <div {...ACTION_ROW_DISABLED}>
          <span>{t("my_stake.edit.unstake")}</span>
          {
            // @ts-ignore
            <span style={menuInfoStyleDisabled}>
              {t("my_stake.status.suffix.not_applicable")}
            </span>
          }
        </div>
      );
    default:
      return <></>;
  }
}

function renderWithdraw(record: IBucket): JSX.Element {
  const status = getStatus(
    record.withdrawWaitUntil,
    record.unstakeStartTime,
    record.stakeStartTime
  );
  const today = new Date();
  if (!record.withdrawWaitUntil) {
    return <></>;
  }
  const withdrawTime = new Date(record.withdrawWaitUntil);
  let time = withdrawTime.toLocaleDateString();
  // @ts-ignore
  if (withdrawTime > today && withdrawTime - today < MSEC_PER_DAY) {
    time = withdrawTime.toLocaleTimeString();
  }

  switch (status) {
    case "staking":
      return (
        <div {...ACTION_ROW_DISABLED}>
          <span>{t("my_stake.edit.withdraw")}</span>
          {
            // @ts-ignore
            <span style={menuInfoStyleDisabled}>
              {t("my_stake.status.suffix.not_applicable")}
            </span>
          }
        </div>
      );
    case "unstaking":
      return (
        <div {...ACTION_ROW_DISABLED}>
          <span>{t("my_stake.edit.withdraw")}</span>
          {
            // @ts-ignore
            <span style={menuInfoStyleDisabled}>
              {t("my_stake.status.suffix.from", { time })}
            </span>
          }
        </div>
      );
    case "withdrawable":
      return (
        <div {...ACTION_ROW_STYLE}>
          <span>{t("my_stake.edit.withdraw")}</span>
          {
            // @ts-ignore
            <span style={menuInfoStyle}>
              {t("my_stake.status.suffix.anytime")}
            </span>
          }
        </div>
      );
    default:
      return <></>;
  }
}

function renderAddStaking(): JSX.Element {
  return (
    <div {...ACTION_ROW_STYLE}>
      <span>{t("my_stake.edit.add_staking")}</span>
      {
        // @ts-ignore
        <span style={menuInfoStyle}>{t("my_stake.status.suffix.anytime")}</span>
      }
    </div>
  );
}

export function renderActionMenu(record: IBucket): JSX.Element {
  const canName = record.canName || "";
  return (
    <Menu className={"MyStakeInfoAction"}>
      <Menu.Item key="1">
        {
          <RevoteModal
            autoStake={record.autoStake}
            stakedDuration={record.stakedDuration}
            bucketIndex={record.index}
            canName={canName}
            clickable={renderRevote(record)}
          />
        }
      </Menu.Item>
      <Menu.Item key="addStaking">
        {
          // @ts-ignore
          <AddStakingModal
            bucketIndex={record.index}
            clickable={renderAddStaking()}
            stakeDuration={record.stakedDuration}
            stakedAmount={record.stakedAmount}
            nonDecay={record.autoStake}
          />
        }
      </Menu.Item>

      <Menu.Item key="2">
        {
          // @ts-ignore
          // tslint:disable-next-line:use-simple-attributes
          <RestakeModal
            bucketIndex={record.index}
            stakeDuration={record.stakedDuration}
            nonDecay={record.autoStake}
            stakeTime={record.stakeStartTime}
            stakedAmount={record.stakedAmount}
            clickable={renderRestake(record)}
          />
        }
      </Menu.Item>

      <Menu.Item key="3">
        {
          // @ts-ignore
          // tslint:disable-next-line:use-simple-attributes
          <UnstakeModal
            bucketIndex={record.index}
            stakeStartTime={record.stakeStartTime}
            stakeDuration={record.stakedDuration}
            nonDecay={record.autoStake}
            clickable={renderUnstake(record)}
          />
        }
      </Menu.Item>

      <Menu.Item key="4">
        {
          // @ts-ignore
          // tslint:disable-next-line:use-simple-attributes
          <WithdrawModal
            bucketIndex={record.index}
            waitUntil={record.withdrawWaitUntil}
            clickable={renderWithdraw(record)}
          />
        }
      </Menu.Item>
    </Menu>
  );
}
