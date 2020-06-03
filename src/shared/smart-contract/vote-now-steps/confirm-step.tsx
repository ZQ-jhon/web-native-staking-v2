// @flow
import { Form } from "antd";
import { t } from "onefx/lib/iso-i18n";
import React from "react";
import window from "global/window";
import { colors } from "../../common/styles/style-color2";
import {
  CommonMarginBottomStyle,
  SmallMarginBottomStyle
} from "../../common/common-margin";
import { formItemLayout } from "../../common/form-item-layout";
import { subTextStyle } from "../staking-form-item";
import { Bucket } from "../../common/token-utils";

type Props = {
  bucket: Bucket,
  isNative: boolean,
  handleReEdit: Function
};

type CommonStepControlProps = {
  label: string,
  isStakeControl?: boolean,
  content?: string | number,
  style?: {},
  isNative?: boolean,
  children?: any
};

export function CommonStepControl({
  content,
  label,
  style,
  children,
  isNative,
  isStakeControl = false
}: CommonStepControlProps) {
  return (
    <Form.Item
      {...formItemLayout}
      label={<span style={subTextStyle}>{label}</span>}
      style={SmallMarginBottomStyle}
    >
      <b>
        {!isStakeControl ? content : <span style={style}>{content}</span>}
        {isStakeControl ? (
          <span>&nbsp;&nbsp;{isNative ? "IOTX" : "IOTX-E"}</span>
        ) : (
          ""
        )}
      </b>
      {children}
    </Form.Item>
  );
}

type StakedAmountControlProps = {
  amount: number,
  handleReEdit: Function,
  isNative: boolean,
  style?: {}
};

export function StakedAmountControl({
  amount,
  handleReEdit,
  isNative,
  style = {}
}: StakedAmountControlProps) {
  return (
    <CommonStepControl
      label={t("my_stake.stakedAmount")}
      content={amount.toLocaleString()}
      style={style}
      isStakeControl={true}
      isNative={isNative}
    >
      <a
        href="#"
        style={{
          display: "inline-block",
          padding: "0 15px",
          float: "right"
        }}
        onClick={handleReEdit}
      >
        {t("my_stake.re_edit")}
      </a>
    </CommonStepControl>
  );
}

type ConfirmStepWrapProps = {
  children: any
};

export function ConfirmStepWrapper({ children }: ConfirmStepWrapProps) {
  return (
    <div>
      <Form
        style={{
          backgroundColor: colors.black20,
          padding: "15px",
          ...CommonMarginBottomStyle
        }}
        layout={"vertical"}
      >
        {children}
      </Form>
      <div style={{ margin: "15px 0 30px" }}>
        {t("my_stake.confirmation.msg")}
      </div>
      <span>{t("my_stake.u_sure")}</span>
    </div>
  );
}

export function ConfirmStep({ bucket, handleReEdit, isNative }: Props) {
  const net =
    window.web3 && window.web3.currentProvider.networkVersion === "42"
      ? "kovan"
      : "main";

  return (
    <ConfirmStepWrapper>
      {bucket.id && (
        <CommonStepControl content={bucket.id} label={t("my_stake.bucketId")} />
      )}

      <StakedAmountControl
        amount={bucket.stakedAmount}
        handleReEdit={handleReEdit}
        isNative={isNative}
      />

      <CommonStepControl
        content={bucket.canName}
        label={t("my_stake.canName")}
      />

      <CommonStepControl
        content={t(
          net === "kovan"
            ? "my_stake.stakeDuration.epochs.kovan"
            : "my_stake.stakeDuration.epochs",
          {
            stakeDuration: bucket.stakeDuration || 0
          }
        )}
        label={t("my_stake.stakeDuration")}
      />

      <CommonStepControl
        content={
          bucket.nonDecay
            ? t("my_stake.nonDecay.yes")
            : t("my_stake.nonDecay.no")
        }
        label={t("my_stake.nonDecay")}
      />
    </ConfirmStepWrapper>
  );
}
