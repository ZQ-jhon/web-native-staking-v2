import BigNumber from "bignumber.js";
import Antenna from "iotex-antenna/lib";
import { fromRau } from "iotex-antenna/lib/account/utils";
import { t } from "onefx/lib/iso-i18n";
import { styled } from "onefx/lib/styletron-react";
import React, { Component } from "react";
import { connect } from "react-redux";
import { Staking } from "../../server/gateway/staking";
import { actionUpdateBuckets } from "./buckets-reducer";

type Props = {
  antenna?: Antenna;
  actionUpdateBuckets?: Function;
};

type State = {
  totalStaked: BigNumber | string;
  pendingUnstaked: BigNumber | string;
  readyToWithdraw: BigNumber | string;
  totalVotes: BigNumber | string;
};

export const AccountMeta = connect(
  () => {
    return {};
  },
  dispatch => ({
    // tslint:disable-next-line:no-any
    actionUpdateBuckets: (payload: any) =>
      dispatch(actionUpdateBuckets(payload))
  })
)(
  class AccountMeta extends Component<Props, State> {
    constructor(props: Props) {
      super(props);
      this.state = {
        totalStaked: "-",
        pendingUnstaked: "-",
        readyToWithdraw: "-",
        totalVotes: "-"
      };
    }

    async componentDidMount(): Promise<void> {
      const { antenna, actionUpdateBuckets } = this.props;
      if (!antenna) {
        return;
      }
      const staking = new Staking({ antenna });
      const buckets = await staking.getBucketsByVoter(
        antenna.iotx.accounts[0].address,
        0,
        999
      );
      let totalStaked = new BigNumber(0);
      let totalVotes = new BigNumber(0);
      let pendingUnstaked = new BigNumber(0);
      let withdrawableAmount = new BigNumber(0);
      for (const b of buckets) {
        const stakedAmount = fromRau(b.stakedAmount, "Iotx");
        totalVotes = totalVotes.plus(stakedAmount);
        if (b.status === "staking") {
          totalStaked = totalStaked.plus(stakedAmount);
        } else if (b.status === "unstaking") {
          pendingUnstaked = pendingUnstaked.plus(stakedAmount);
        } else if (b.status === "withdrawable") {
          withdrawableAmount = withdrawableAmount.plus(stakedAmount);
        }
      }
      this.setState({
        totalStaked,
        totalVotes,
        pendingUnstaked,
        readyToWithdraw: withdrawableAmount
      });
      if (actionUpdateBuckets) {
        actionUpdateBuckets(buckets);
      }
    }

    render(): JSX.Element | undefined {
      const { antenna } = this.props;
      if (!antenna) {
        return;
      }
      const {
        totalStaked,
        pendingUnstaked,
        readyToWithdraw,
        totalVotes
      } = this.state;
      return (
        <>
          <b>{t("my_stake.address")}</b>
          <LabelText>{antenna.iotx.accounts[0].address}</LabelText>
          <b>{t("my_stake.staking_amount")}</b>
          <LabelText>{String(totalStaked)}</LabelText>
          <b>{t("my_stake.unstake_pendding_amount")}</b>
          <LabelText>{String(pendingUnstaked)}</LabelText>
          <b>{t("my_stake.withdrawable_amount")}</b>
          <LabelText>{String(readyToWithdraw)}</LabelText>
          <b>{t("my_stake.votes_amount")}</b>
          <LabelText>{String(totalVotes)}</LabelText>
        </>
      );
    }
  }
);

const LabelText = styled("span", props => ({
  fontSize: "14px",
  marginBottom: "24px",
  wordBreak: "break-word",
  ...props
}));
