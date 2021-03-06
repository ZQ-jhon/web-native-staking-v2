// @flow
import Form from "antd/lib/form";
// @ts-ignore
import { t } from "onefx/lib/iso-i18n";
import React from "react";
import { IBucket } from "../../../server/gateway/staking";
import {
  CommonMarginBottomStyle,
  SmallMarginBottomStyle,
} from "../../common/common-margin";
import { formItemLayout } from "../../common/form-item-layout";
import { colors } from "../../common/styles/style-color2";
import { subTextStyle } from "../staking-form-item";

type Props = {
  bucket: IBucket;
  handleReEdit: Function;
};

type CommonStepControlProps = {
  label: string;
  isStakeControl?: boolean;
  content?: string | number;
  style?: {};
  // tslint:disable-next-line:no-any
  children?: any;
};

export function CommonStepControl({
  content,
  label,
  style,
  children,
  isStakeControl = false,
}: CommonStepControlProps): JSX.Element {
  return (
    <Form.Item
      {...formItemLayout}
      labelAlign={"left"}
      // @ts-ignore
      label={<span style={subTextStyle}>{label}</span>}
      style={SmallMarginBottomStyle}
    >
      <b>
        {!isStakeControl ? content : <span style={style}>{content}</span>}
        {isStakeControl ? <span>&nbsp;&nbsp;IOTX</span> : ""}
      </b>
      {children}
    </Form.Item>
  );
}

type StakedAmountControlProps = {
  amount: number;
  handleReEdit: Function;
  style?: {};
};

export function StakedAmountControl({
  amount,
  handleReEdit,
  style = {},
}: StakedAmountControlProps): JSX.Element {
  return (
    <CommonStepControl
      label={t("my_stake.stakedAmount")}
      content={amount.toLocaleString()}
      style={style}
      isStakeControl={true}
    >
      {/* tslint:disable-next-line:react-a11y-anchors */}
      <a
        href="#"
        style={{
          display: "inline-block",
          padding: "0 15px",
          float: "right",
        }}
        // @ts-ignore
        onClick={handleReEdit}
      >
        {t("my_stake.re_edit")}
      </a>
    </CommonStepControl>
  );
}

type ConfirmStepWrapProps = {
  // tslint:disable-next-line:no-any
  children: any;
};

export function ConfirmStepWrapper({
  children,
}: ConfirmStepWrapProps): JSX.Element {
  return (
    <div>
      {
        // @ts-ignore
        <Form
          style={{
            backgroundColor: colors.black20,
            padding: "15px",
            ...CommonMarginBottomStyle,
          }}
          layout={"vertical"}
        >
          {children}
        </Form>
      }
      <span>{t("my_stake.u_sure")}</span>
    </div>
  );
}

export function ConfirmStep({ bucket, handleReEdit }: Props): JSX.Element {
  return (
    <ConfirmStepWrapper>
      {bucket.index && (
        <CommonStepControl
          content={bucket.index}
          label={t("my_stake.bucketId")}
        />
      )}
      <StakedAmountControl
        amount={Number(bucket.stakedAmount)}
        handleReEdit={handleReEdit}
      />

      <CommonStepControl
        content={bucket.canName}
        label={t("my_stake.canName")}
      />

      <CommonStepControl
        // @ts-ignore
        content={t("my_stake.stakeDuration.epochs", {
          stakeDuration: bucket.stakedDuration || 0,
        })}
        label={t("my_stake.stakeDuration")}
      />

      {/* tslint:disable-next-line:use-simple-attributes */}
      <CommonStepControl
        content={
          bucket.autoStake
            ? t("my_stake.nonDecay.yes")
            : t("my_stake.nonDecay.no")
        }
        label={t("my_stake.nonDecay")}
      />
    </ConfirmStepWrapper>
  );
}
