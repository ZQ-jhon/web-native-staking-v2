// @flow
import InfoCircleOutlined from "@ant-design/icons/InfoCircleOutlined";
import RetweetOutlined from "@ant-design/icons/RetweetOutlined";
import Form from "antd/lib/form";
import { FormInstance } from "antd/lib/form";
import InputNumber from "antd/lib/input-number";
import Switch from "antd/lib/switch";
import BigNumber from "bignumber.js";
import { get } from "dottie";
// @ts-ignore
import { t } from "onefx/lib/iso-i18n";
import React, { Component, RefObject } from "react";
import { TBpCandidate } from "../../types";
import { ownersToNames } from "../common/apollo-client";
import {
  CommonMarginBottomStyle,
  CommonMarginTop,
  NoMarginBottomStyle,
} from "../common/common-margin";
import { formItemLayout } from "../common/form-item-layout";
import { colors } from "../common/styles/style-color2";
import { fontFamily, fonts } from "../common/styles/style-font";
import { getPowerEstimation } from "../common/token-utils";
import {
  getStakeDurationMaxValue,
  validateStakeDuration,
} from "./field-validators";

export function extractCandidates(
  data: { bpCandidates: TBpCandidate } | undefined
): Array<{ label: string | JSX.Element; value: string }> {
  const bpCandidates: Record<string, TBpCandidate> = {};
  if (data && Array.isArray(data.bpCandidates)) {
    data.bpCandidates.forEach((i: TBpCandidate) => {
      if (i.status && i.status !== "UNQUALIFIED") {
        bpCandidates[i.registeredName] = i;
      }
    });
  }

  const dataSource: Array<{ label: string | JSX.Element; value: string }> = [];
  Object.keys(ownersToNames).forEach((key) => {
    const registeredName = ownersToNames[key];
    const delegateName = get(bpCandidates[registeredName], "name", "");
    dataSource.push({
      value: registeredName,
      label: (
        <span>
          {registeredName}
          <b>{delegateName ? ` - ${delegateName}` : ""}</b>
        </span>
      ),
    });
  });
  return dataSource;
}

type Props = {
  // tslint:disable-next-line:no-any
  children?: any;
  showAutoStack?: boolean;
  // tslint:disable-next-line:no-any
  style?: any;
  fieldName?: string;
  initialValue?: boolean;
  selfStaking?: boolean;
  stakeAmount?: BigNumber;
  stakeDuration?: number;
  forceDisable?: boolean;
  formRef?: RefObject<FormInstance>;
};

type State = {
  nonDecay: boolean;
};

type IconLabelType = {
  iconType: JSX.Element | string;
  text: string;
};

export function IconLabel({ iconType, text = "" }: IconLabelType): JSX.Element {
  return (
    <span>
      {iconType}
      <label
        style={{
          ...fonts.inputLabel,
          fontFamily,
          fontSize: "15px",
          marginLeft: "9px",
        }}
      >
        {text}{" "}
      </label>
    </span>
  );
}

export const subTextStyle = {
  fontWeight: "normal",
  fontSize: "12px",
  fontFamily,
  color: colors.black80,
  whiteSpace: "break-spaces",
};

export const centerTextStyle = {
  ...subTextStyle,
  textAlign: "center",
  color: colors.black,
  margin: "0 18px",
};

type FormItemTextTypes = {
  text: string;
  sub: string;
};

export function FormItemText({
  text = "",
  sub = "",
}: FormItemTextTypes): JSX.Element {
  return (
    <>
      <label style={{ ...fonts.inputLabel, fontFamily }}>{text}</label>
      <br />
      {
        // @ts-ignore
        <span style={subTextStyle}>{sub}</span>
      }
    </>
  );
}

export class AutoStakeFormItem extends Component<Props, State> {
  state: State = {
    nonDecay: false,
  };
  props: Props;

  async componentDidMount(): Promise<void> {
    const { formRef } = this.props;
    if (formRef) {
      const form = formRef.current;
      if (form) {
        form.setFieldsValue({
          nonDecay: this.props.initialValue,
        });
      }
    }
    this.setState({ nonDecay: this.props.initialValue || false });
  }

  getPowerEstimation(
    amount: BigNumber,
    duration: number,
    nonDecay: boolean,
    selfStaking: boolean
  ): string {
    const resp = getPowerEstimation(amount, duration, nonDecay, selfStaking);
    return resp.toFormat(0);
  }

  // tslint:disable-next-line:max-func-body-length
  render(): JSX.Element {
    const {
      fieldName = "nonDecay",
      showAutoStack = true,
      children,
      stakeAmount = new BigNumber(0),
      stakeDuration = 0,
      initialValue,
    } = this.props;
    const votingPower = this.getPowerEstimation(
      stakeAmount,
      stakeDuration,
      this.state.nonDecay,
      this.props.selfStaking || false
    );
    return (
      <div>
        {showAutoStack ? (
          <div>
            {/*
              // @ts-ignore */}
            <Form.Item
              {...formItemLayout}
              className={"autoStakeSwitch"}
              labelAlign={"left"}
              label={
                <IconLabel
                  iconType={
                    <RetweetOutlined style={{ color: colors.deltaUp }} />
                  }
                  text={t("my_stake.nonDecay")}
                />
              }
              style={{ marginBottom: 0 }}
              name={fieldName}
              initialValue={initialValue}
              valuePropName={"checked"}
            >
              <Switch
                style={{ textAlign: "right" }}
                onChange={(checked) => {
                  this.setState({ nonDecay: checked });
                }}
              />
            </Form.Item>
            {/*
              // @ts-ignore */}
            <span style={{ ...subTextStyle, ...CommonMarginBottomStyle }}>
              {t("my_stake.autoStake_explain")}
            </span>
          </div>
        ) : null}
        <CommonMarginTop />

        <div style={{ marginTop: "26px" }}>
          <IconLabel
            iconType={<InfoCircleOutlined style={{ color: colors.deltaUp }} />}
            text={t("my_stake.voting_power")}
          />
          <span style={{ float: "right", fontWeight: "bold" }}>
            {t("my_stake.votes_number", { votes: votingPower })}
          </span>
        </div>
        <div style={{ marginBottom: "18px", marginTop: "10px" }}>
          {/*
              // @ts-ignore */}
          <span style={subTextStyle}>{t("my_stake.voting_power_explain")}</span>
        </div>
        {children}
      </div>
    );
  }
}

type DurationFormItemProps = {
  fieldName?: string;
  initialValue?: number;
  onChange?(value: number): void;
  validatorFactory?(
    maxDuration: number,
    minValue?: number
  ): // tslint:disable-next-line:no-any
  (rule: any, value: any, callback: any) => void;
};

export class DurationFormItem extends Component<DurationFormItemProps> {
  props: DurationFormItemProps;

  render(): JSX.Element {
    let maxDuration = getStakeDurationMaxValue();
    const {
      fieldName = "stakeDuration",
      initialValue = 0,
      onChange,
      validatorFactory = validateStakeDuration,
    } = this.props;
    const minDuration = initialValue;

    maxDuration = maxDuration >= initialValue ? maxDuration : initialValue;
    return (
      <>
        {/*
          // @ts-ignore */}
        <Form.Item
          {...formItemLayout}
          style={NoMarginBottomStyle}
          labelAlign={"left"}
          label={
            // tslint:disable-next-line:use-simple-attributes
            <FormItemText
              text={t("my_stake.stakeDuration")}
              sub={t("my_stake.duration_of_epoch")}
            />
          }
          name={fieldName}
          rules={[
            {
              required: true,
              message: t("my_stake.stakeDuration.required"),
            },
            {
              validator: validatorFactory(maxDuration, minDuration),
            },
          ]}
          initialValue={initialValue}
        >
          <InputNumber
            type="number"
            size="large"
            min={0}
            max={maxDuration}
            style={{ width: "100%", background: "#f7f7f7", border: "none" }}
            // @ts-ignore
            onChange={onChange}
          />
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          style={CommonMarginBottomStyle}
          label={<span />}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {
              // @ts-ignore
              <span style={subTextStyle}>{t("my_stake.change_anytime")}</span>
            }
            {
              // @ts-ignore
              <span style={subTextStyle}>{t("my_stake.epoch_day")}</span>
            }
          </div>
        </Form.Item>
      </>
    );
  }
}
