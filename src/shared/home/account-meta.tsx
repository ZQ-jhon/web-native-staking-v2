import BigNumber from "bignumber.js";
import Antenna from "iotex-antenna/lib";
import { t } from "onefx/lib/iso-i18n";
import { styled } from "onefx/lib/styletron-react";
import React, { Component } from "react";
import { connect } from "react-redux";
import { getStaking } from "../../server/gateway/staking";
import { getIoPayAddress } from "../common/get-antenna";
import {
  actionUpdateAccountMeta,
  actionUpdateBuckets
} from "./buckets-reducer";

type Props = {
  antenna?: Antenna;
  actionUpdateBuckets?: Function;
  actionUpdateAccountMeta?: Function;
};

type State = {
  totalStaked: BigNumber | string;
  pendingUnstaked: BigNumber | string;
  readyToWithdraw: BigNumber | string;
  totalVotes: BigNumber | string;
};

export const BucketsLoader = connect(
  () => {
    return {};
  },
  dispatch => ({
    // tslint:disable-next-line:no-any
    actionUpdateBuckets: (payload: any) =>
      dispatch(actionUpdateBuckets(payload)),
    // tslint:disable-next-line:no-any
    actionUpdateAccountMeta: (payload: any) =>
      dispatch(actionUpdateAccountMeta(payload))
  })
)(
  class BucketsLoaderInner extends Component<Props, State> {
    async componentDidMount(): Promise<void> {
      const { actionUpdateBuckets, actionUpdateAccountMeta } = this.props;
      const staking = getStaking();
      const address = await getIoPayAddress();
      const buckets = await staking.getBucketsByVoter(address, 0, 999);
      let totalStaked = new BigNumber(0);
      let totalVotes = new BigNumber(0);
      let pendingUnstaked = new BigNumber(0);
      let withdrawableAmount = new BigNumber(0);
      for (const b of buckets) {
        const stakedAmount = b.stakedAmount;
        totalVotes = totalVotes.plus(stakedAmount);
        if (b.status === "staking") {
          totalStaked = totalStaked.plus(stakedAmount);
        } else if (b.status === "unstaking") {
          pendingUnstaked = pendingUnstaked.plus(stakedAmount);
        } else if (b.status === "withdrawable") {
          withdrawableAmount = withdrawableAmount.plus(stakedAmount);
        }
      }
      if (actionUpdateBuckets) {
        actionUpdateBuckets(buckets);
      }
      if (actionUpdateAccountMeta) {
        actionUpdateAccountMeta({
          totalStaked: totalStaked.toFixed(0),
          totalVotes: totalVotes.toFixed(0),
          pendingUnstaked: pendingUnstaked.toFixed(0),
          readyToWithdraw: withdrawableAmount.toFixed(0),
          address
        });
      }
    }

    render(): JSX.Element {
      return <div />;
    }
  }
);

type AMProps = {
  address: string;
  totalStaked: string;
  pendingUnstaked: string;
  readyToWithdraw: string;
  totalVotes: string;
};

export const AccountMeta = connect(
  (state: {
    accountMeta: {
      address: string;
      totalStaked: string;
      pendingUnstaked: string;
      readyToWithdraw: string;
      totalVotes: string;
    };
  }) => {
    return { ...(state.accountMeta || {}) };
  }
)(
  class AccountMetaInner extends Component<AMProps> {
    render(): JSX.Element | undefined {
      const {
        address,
        totalStaked,
        pendingUnstaked,
        readyToWithdraw,
        totalVotes
      } = this.props;
      return (
        <>
          <b>{t("my_stake.address")}</b>
          <LabelText>{address}</LabelText>
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
