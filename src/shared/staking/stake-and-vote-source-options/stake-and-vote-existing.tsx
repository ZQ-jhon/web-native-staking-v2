// @flow
import { Select } from "antd";
import { Form } from "antd";
import { t } from "onefx/lib/iso-i18n";
import React, { Component } from "react";
import { connect } from "react-redux";
import { getStaking, IBucket } from "../../../server/gateway/staking";
import { CommonMarginBottomStyle } from "../../common/common-margin";
import { formItemLayout } from "../../common/form-item-layout";
import { getIoPayAddress } from "../../common/get-antenna";
import { IopayRequired } from "../../common/iopay-required";
import {
  AutoStakeFormItem,
  FormItemText,
  IconLabel,
  subTextStyle
} from "../staking-form-item";

type Props = {
  currentStakeDuration: number;
  currentStakeAmount: number;
  handleRevote: Function;
  defaultValue?: number;
  epochSecondValue?: number;
  buckets: Array<IBucket>;
};

type State = {
  existingBuckets: Array<IBucket>;
  loading: boolean;
};

// @ts-ignore
@IopayRequired
// @ts-ignore
@connect((state: { buckets: Array<IBucket> }) => ({
  // @ts-ignore
  buckets: state.buckets
}))
class StakeAndVoteExisting extends Component<Props, State> {
  async componentDidMount(): Promise<void> {
    const staking = getStaking();
    const address = await getIoPayAddress();
    const buckets = await staking.getBucketsByVoter(address, 0, 999);
    this.setState({
      existingBuckets: buckets,
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
        {
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
                    dangerouslySetInnerHTML={{
                      __html: t("my_stake.inMyVotes")
                    }}
                  />
                }
              />
            }
            style={{ ...CommonMarginBottomStyle }}
            name="bucketId"
            rules={[
              {
                required: true,
                message: t("my_stake.bucketId.required")
              }
            ]}
            initialValue={defaultValue}
          >
            {
              // @ts-ignore
              <Select
                size="large"
                loading={loading}
                // @ts-ignore
                onChange={bucketId => {
                  const bucket = existingBuckets.find(
                    b => String(b.index) === bucketId
                  );
                  handleRevote(bucket);
                }}
              >
                {existingBuckets.map((bucket, i) => (
                  <Select.Option key={i} value={String(bucket.index)}>
                    <div style={{ fontSize: 14 }}>
                      Bucket ID {bucket.index} | <b>{bucket.candidate}</b>{" "}
                      {!bucket.candidate && "Not Voted Yet"}
                    </div>
                    <div style={{ fontSize: 12, color: "#999" }}>
                      Amount: {String(bucket.stakedAmount)} | Staking Period:{" "}
                      {String(bucket.stakedDuration)}
                    </div>
                  </Select.Option>
                ))}
              </Select>
            }
            {!currentStakeDuration || !currentStakeAmount ? (
              // @ts-ignore
              <span style={subTextStyle}>{t("my_stake.extend_anytime")}</span>
            ) : (
              <></>
            )}
          </Form.Item>
        }
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
