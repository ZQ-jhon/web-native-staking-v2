// @flow
import { Form } from "antd";
// @ts-ignore
import window from "global/window";
import { t } from "onefx/lib/iso-i18n";
import React from "react";
import {
  CommonMarginBottomStyle,
  SmallMarginBottomStyle
} from "../../common/common-margin";
import { formItemLayout } from "../../common/form-item-layout";
import { colors } from "../../common/styles/style-color2";
import { Bucket } from "../../common/token-utils";
import { subTextStyle } from "../staking-form-item";

type Props = {
  bucket: Bucket,
  handleReEdit: Function
};

type CommonStepControlProps = {
  label: string,
  isStakeControl?: boolean,
  content?: string | number,
  style?: {},
  // tslint:disable-next-line:no-any
  children?: any
};

export function CommonStepControl({
  content,
  label,
  style,
  children,
  isStakeControl = false
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
        {isStakeControl ? (
          <span>&nbsp;&nbsp;IOTX</span>
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
  style?: {}
};

export function StakedAmountControl({
  amount,
  handleReEdit,
  style = {}
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
          float: "right"
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
  children: any
};

export function ConfirmStepWrapper({ children }: ConfirmStepWrapProps): JSX.Element {

  return (
    <div>
      {
        // @ts-ignore
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
      }
      <div style={{ margin: "15px 0 30px" }}>
        {t("my_stake.confirmation.msg")}
      </div>
      <span>{t("my_stake.u_sure")}</span>
    </div>
  );
}

export function ConfirmStep({ bucket, handleReEdit }: Props): JSX.Element {
  return (
    <ConfirmStepWrapper>
      {bucket.id && (
        <CommonStepControl content={bucket.id} label={t("my_stake.bucketId")} />
      )}

      <StakedAmountControl
        amount={bucket.stakedAmount}
        handleReEdit={handleReEdit}
      />

      <CommonStepControl
        content={bucket.canName}
        label={t("my_stake.canName")}
      />

      <CommonStepControl
        // @ts-ignore
        content={t("my_stake.stakeDuration.epochs", { stakeDuration: bucket.stakeDuration || 0 })}
        label={t("my_stake.stakeDuration")}
      />

      {/* tslint:disable-next-line:use-simple-attributes */}
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
