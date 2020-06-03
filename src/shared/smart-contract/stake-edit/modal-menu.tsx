// @flow
// $FlowFixMe
import { Menu } from "antd";
import { t } from "onefx/lib/iso-i18n";
import { colors } from "../../common/styles/style-color2";
import { RevoteModal } from "./revote-modal";
import { UnstakeModal } from "./unstake-modal";
import { WithdrawModal } from "./withdraw-modal";
import { RestakeModal } from "./restake-modal";
import { AddStakingModal } from "./add-staking-modal";

const MSEC_PER_DAY = 24 * 60 * 60 * 1000;
const ACTION_ROW_STYLE = {
  style: {
    color: colors.black,
    fontSize: "12px",
    height: "30px",
    display: "flex",
    justifyContent: "space-between"
  }
};
const ACTION_ROW_DISABLED = {
  style: {
    ...ACTION_ROW_STYLE.style,
    color: colors.black65,
    cursor: "not-allowed"
  },
  onClick: (e: any) => e.stopPropagation()
};
const menuInfoStyle = {
  color: colors.black80,
  width: "100px",
  marginLeft: "20px",
  display: "inline-block",
  textAlign: "left"
};
const menuInfoStyleDisabled = {
  ...menuInfoStyle,
  color: colors.black65
};

function renderRevote(record: any) {
  const status = record.getStatus();

  switch (status) {
    case "staking":
      return (
        <div {...ACTION_ROW_STYLE}>
          <span>{t("my_stake.edit.revote")}</span>
          <span style={menuInfoStyle}>
            {t("my_stake.status.suffix.anytime")}
          </span>
        </div>
      );
    case "unstaking":
      return (
        <div {...ACTION_ROW_DISABLED}>
          <span>{t("my_stake.edit.revote")}</span>
          <span style={menuInfoStyleDisabled}>
            {t("my_stake.status.suffix.not_applicable")}
          </span>
        </div>
      );
    case "withdrawable":
      return (
        <div {...ACTION_ROW_DISABLED}>
          <span>{t("my_stake.edit.revote")}</span>
          <span style={menuInfoStyleDisabled}>
            {t("my_stake.status.suffix.anytime")}
          </span>
        </div>
      );
    default:
      return null;
  }
}

function renderRestake(record: any) {
  const status = record.getStatus();

  return ["staking", "unstaking", "withdrawable"].includes(status) ? (
    <div {...ACTION_ROW_STYLE}>
      <span>{t("my_stake.edit.restake")}</span>
      <span style={menuInfoStyle}>{t("my_stake.status.suffix.anytime")}</span>
    </div>
  ) : null;
}

function renderUnstake(record: any, stakingDurationSecond: any) {
  if (record.stakeDuration === 0) {
    return (
      <div {...ACTION_ROW_STYLE}>
        <span>{t("my_stake.edit.unstake")}</span>
        <span style={menuInfoStyle}>{t("my_stake.status.suffix.anytime")}</span>
      </div>
    );
  }

  const status = record.getStatus();
  const today = new Date();
  const startTime = new Date(record.stakeStartTime);
  const endTime = new Date(
    startTime.getTime() + record.stakeDuration * stakingDurationSecond * 1000
  );
  let disabled = today <= endTime;
  let time =
    Math.abs(today - endTime) < MSEC_PER_DAY
      ? endTime.toLocaleTimeString()
      : endTime.toLocaleDateString();
  let menuInfo = t("my_stake.status.suffix.from", { time });
  if (record.nonDecay) {
    disabled = true;
    menuInfo = t("my_stake.status.suffix.not_applicable");
  }

  switch (status) {
    case "staking":
      return (
        <div {...(disabled ? ACTION_ROW_DISABLED : ACTION_ROW_STYLE)}>
          <span>{t("my_stake.edit.unstake")}</span>
          <span style={disabled ? menuInfoStyleDisabled : menuInfoStyle}>
            {menuInfo}
          </span>
        </div>
      );
    case "unstaking":
      return (
        <div {...ACTION_ROW_DISABLED}>
          <span>{t("my_stake.edit.unstake")}</span>
          <span style={menuInfoStyleDisabled}>
            {t("my_stake.status.suffix.not_applicable")}
          </span>
        </div>
      );
    case "withdrawable":
      return (
        <div {...ACTION_ROW_DISABLED}>
          <span>{t("my_stake.edit.unstake")}</span>
          <span style={menuInfoStyleDisabled}>
            {t("my_stake.status.suffix.not_applicable")}
          </span>
        </div>
      );
    default:
      return null;
  }
}

function renderWithdraw(record: any) {
  const status = record.getStatus();
  const today = new Date();
  const withdrawTime = new Date(record.withdrawWaitUntil);
  let time = withdrawTime.toLocaleDateString();
  if (withdrawTime > today && withdrawTime - today < MSEC_PER_DAY) {
    time = withdrawTime.toLocaleTimeString();
  }

  switch (status) {
    case "staking":
      return (
        <div {...ACTION_ROW_DISABLED}>
          <span>{t("my_stake.edit.withdraw")}</span>
          <span style={menuInfoStyleDisabled}>
            {t("my_stake.status.suffix.not_applicable")}
          </span>
        </div>
      );
    case "unstaking":
      return (
        <div {...ACTION_ROW_DISABLED}>
          <span>{t("my_stake.edit.withdraw")}</span>
          <span style={menuInfoStyleDisabled}>
            {t("my_stake.status.suffix.from", { time })}
          </span>
        </div>
      );
    case "withdrawable":
      return (
        <div {...ACTION_ROW_STYLE}>
          <span>{t("my_stake.edit.withdraw")}</span>
          <span style={menuInfoStyle}>
            {t("my_stake.status.suffix.anytime")}
          </span>
        </div>
      );
    default:
      return null;
  }
}

function renderAddStaking() {
  return (
    <div {...ACTION_ROW_STYLE}>
      <span>{t("my_stake.edit.add_staking")}</span>
      <span style={menuInfoStyle}>{t("my_stake.status.suffix.anytime")}</span>
    </div>
  );
}

export function renderActionMenu(
  record: any,
  stakingContract: any,
  addr: string,
  stakingDurationSecond: any,
  isNative: boolean
) {
  return (
    <Menu className={"MyStakeInfoAction"}>
      <Menu.Item key="1">
        <RevoteModal
          bucketIndex={record.id}
          canName={record.canName}
          addr={addr}
          stakingContract={stakingContract}
          clickable={renderRevote(record)}
          isNative={isNative}
          isPatchContract={record.isPatch}
        />
      </Menu.Item>

      {isNative && (
        <Menu.Item key="addStaking">
          <AddStakingModal
            bucketIndex={record.id}
            stakingContract={stakingContract}
            addr={addr}
            clickable={renderAddStaking()}
            stakeDuration={record.stakeDuration}
            stakedAmount={record.stakedAmount}
            nonDecay={record.nonDecay}
            isPatchContract={record.isPatch}
          />
        </Menu.Item>
      )}

      <Menu.Item key="2">
        <RestakeModal
          bucketIndex={record.id}
          stakeDuration={record.stakeDuration}
          nonDecay={record.nonDecay}
          stakeTime={record.stakeStartTime}
          stakedAmount={record.stakedAmount}
          addr={addr}
          stakingContract={stakingContract}
          clickable={renderRestake(record)}
          isNative={isNative}
          isPatchContract={record.isPatch}
        />
      </Menu.Item>

      <Menu.Item key="3">
        <UnstakeModal
          bucketIndex={record.id}
          stakeStartTime={record.stakeStartTime}
          stakeDuration={record.stakeDuration}
          nonDecay={record.nonDecay}
          addr={addr}
          stakingContract={stakingContract}
          clickable={renderUnstake(record, stakingDurationSecond)}
          isNative={isNative}
          isPatchContract={record.isPatch}
        />
      </Menu.Item>

      <Menu.Item key="4">
        <WithdrawModal
          bucketIndex={record.id}
          waitUntil={record.withdrawWaitUntil}
          addr={addr}
          stakingContract={stakingContract}
          clickable={renderWithdraw(record)}
          isNative={isNative}
          isPatchContract={record.isPatch}
        />
      </Menu.Item>
    </Menu>
  );
}
