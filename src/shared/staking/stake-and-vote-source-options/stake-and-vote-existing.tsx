// @flow
import { Select } from "antd";
import { Form } from "antd";
import { t } from "onefx/lib/iso-i18n";
import React, { Component } from "react";
import { connect } from "react-redux";
import { CommonMarginBottomStyle } from "../../common/common-margin";
import { formItemLayout } from "../../common/form-item-layout";
import { IopayRequired } from "../../common/iopay-required";
import { Bucket, DEFAULT_EPOCH_SECOND } from "../../common/token-utils";
import {
  AutoStakeFormItem,
  FormItemText,
  IconLabel,
  subTextStyle
} from "../staking-form-item";
import { getNativeStakeStatus } from "../staking-utils";

type Props = {
  currentStakeDuration: number,
  currentStakeAmount: number,
  handleRevote: Function,
  defaultValue?: number,
  epochSecondValue?: number,
  // tslint:disable-next-line:no-any
  tokenContract?: any
};

type State = {
  existingBuckets: Array<Bucket>,
  loading: boolean
};

// @ts-ignore
@IopayRequired
// @ts-ignore
@connect(state => ({
// @ts-ignore
  epochSecondValue: state.base.epochSecondValue,
}))
class StakeAndVoteExisting extends Component<Props, State> {
  async componentDidMount(): Promise<void> {
    const {
      tokenContract,
      epochSecondValue = DEFAULT_EPOCH_SECOND
    } = this.props;

    const stakeStatus = await getNativeStakeStatus(
      tokenContract,
      epochSecondValue
    );
    const existingBuckets = (stakeStatus.buckets) || [];
    this.setState({
      existingBuckets,
      loading: false
    });
  }

  state: State = {
    existingBuckets: [],
    loading: true
  };

  render(): JSX.Element {
    const { handleRevote, defaultValue } = this.props;
    const { existingBuckets, loading } = this.state;

    const { currentStakeDuration, currentStakeAmount } = this.props;
    return (
      <div>
        <div style={{ marginTop: "26px" }}>
          <IconLabel
            iconType={"info-circle"}
            text={t("my_stake.exsitingBucketWarning")}
          />
        </div>
        <div style={{ marginBottom: "18px", marginTop: "10px" }}>
          {
            // @ts-ignore
            <span style={subTextStyle}>
            {t("my_stake.exsitingBucketWarningExplain")}
          </span>
          }
        </div>
        {(
          // @ts-ignore
          <Form.Item
            {...formItemLayout}
            labelAlign={"left"}
            label={
              <FormItemText
                text={t("my_stake.existingBucket")}
                // @ts-ignore
                sub={
                  // tslint:disable-next-line:react-no-dangerous-html
                  <span
                    dangerouslySetInnerHTML={{ __html: t("my_stake.inMyVotes") }}
                  />
                }
              />
            }
            style={{...CommonMarginBottomStyle}}
            name="bucketId"
            rules={[
              {
                required: true,
                message: t("my_stake.bucketId.required")
              }
            ]}
            initialValue={defaultValue}
          >
            {(
              // @ts-ignore
              <Select
                size="large"
                loading={loading}
                // @ts-ignore
                onChange={bucketId => {
                  const bucket = existingBuckets.find(
                    b => String(b.id) === bucketId
                  );
                  handleRevote(bucket);
                }}
              >
                {existingBuckets.map((bucket, index) => (
                  <Select.Option key={index} value={String(bucket.id)}>
                    <div style={{ fontSize: 14 }}>
                      Bucket ID {bucket.id} | <b>{bucket.canName}</b>{" "}
                      {!bucket.canName && "Not Voted Yet"}
                    </div>
                    <div style={{ fontSize: 12, color: "#999" }}>
                      Amount: {bucket.stakedAmount} | Staking Period:{" "}
                      {bucket.stakeDuration}
                    </div>
                  </Select.Option>
                ))}
              </Select>
            )}
            {(!currentStakeDuration || !currentStakeAmount) ? (
              // @ts-ignore
              <span style={subTextStyle}>{t("my_stake.extend_anytime")}</span>
            ) : <></>}
          </Form.Item>
        )}
        {
          // @ts-ignore
          <AutoStakeFormItem
            showAutoStack={false}
            initialValue={false}
            stakeAmount={currentStakeAmount}
            stakeDuration={currentStakeDuration}
          />
        }
      </div>
    );
  }
}

export { StakeAndVoteExisting };
