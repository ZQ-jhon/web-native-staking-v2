// @flow
import React, { Component } from "react";
import { Form, Icon, InputNumber, Switch } from "antd";
import { t } from "onefx/lib/iso-i18n";
import window from "global/window";
import { formItemLayout } from "../common/form-item-layout";
import {
  CommonMarginBottomStyle,
  CommonMarginTop
} from "../common/common-margin";
import { fontFamily, fonts } from "../common/styles/style-font";
import { colors } from "../common/styles/style-color2";
import { Flex } from "../common/flex";
import {
  getPowerEstimation,
  getPowerEstimationForKovan
} from "../common/token-utils";
import {
  validateStakeDuration,
  getStakeDurationMaxValue
} from "./field-validators";

type Props = {
  children?: any,
  showAutoStack?: boolean,
  style?: any,
  fieldName?: string,
  initialValue?: boolean,
  stakeAmount?: number,
  stakeDuration?: number,
  form: any,
  forceDisable?: boolean
};

type State = {
  nonDecay: boolean
};

type IconLabelType = {
  iconType: string,
  text: string
};

export function IconLabel({ iconType = "", text = "" }: IconLabelType) {
  return (
    <span>
      <Icon type={iconType} style={{ color: colors.deltaUp }} />
      <label
        style={{
          ...fonts.inputLabel,
          fontFamily,
          fontSize: "15px",
          marginLeft: "9px"
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
  color: colors.black80
};

export const centerTextStyle = {
  ...subTextStyle,
  textAlign: "center",
  color: colors.black,
  margin: "0 18px"
};

type FormItemTextTypes = {
  text: any,
  sub: any
};

export function FormItemText({ text = "", sub = "" }: FormItemTextTypes) {
  return (
    <label style={{ ...fonts.inputLabel, fontFamily }}>
      {text}
      <br />
      <span style={subTextStyle}>{sub}</span>
    </label>
  );
}

export class AutoStakeFormItem extends Component<Props, State> {
  state: State = {
    nonDecay: false
  };
  props: Props;

  componentDidMount() {
    this.setState({ nonDecay: this.props.initialValue });
  }

  getPowerEstimation(
    amount: number,
    duration: number,
    dayFromToday: number,
    net: string
  ) {
    if (net === "kovan") {
      const resp = getPowerEstimationForKovan(amount, duration, dayFromToday);
      return { total: resp.total.toFormat(0), date: resp.date };
    }
    const resp = getPowerEstimation(amount, duration, dayFromToday);
    return { total: resp.total.toFormat(0), date: resp.date };
  }

  render() {
    const {
      fieldName = "nonDecay",
      showAutoStack = true,
      children,
      form,
      stakeAmount = 0,
      stakeDuration = 0,
      forceDisable = false
    } = this.props;
    const { getFieldDecorator } = form;
    const net =
      window.web3 && window.web3.currentProvider.networkVersion === "42"
        ? "kovan"
        : "main";
    return (
      <div>
        {showAutoStack ? (
          <div>
            <Form.Item
              {...formItemLayout}
              label={
                <IconLabel iconType={"retweet"} text={t("my_stake.nonDecay")} />
              }
              style={{ marginBottom: 0 }}
            >
              <div style={{ textAlign: "right" }}>
                {getFieldDecorator(fieldName, {
                  valuePropName: "checked",
                  initialValue: this.state.nonDecay
                })(
                  <Switch
                    style={{ textAlign: "right" }}
                    disabled={forceDisable || !this.props.stakeDuration}
                    onChange={checked => {
                      if (!forceDisable) {
                        this.setState({ nonDecay: checked });
                      }
                    }}
                  />
                )}
              </div>
            </Form.Item>
            <span style={{ ...subTextStyle, ...CommonMarginBottomStyle }}>
              {t("my_stake.autoStake_explain")}
            </span>
          </div>
        ) : null}
        <CommonMarginTop />

        <div style={{ marginTop: "26px" }}>
          <IconLabel
            iconType={"info-circle"}
            text={t("my_stake.voting_power")}
          />
        </div>
        <div style={{ marginBottom: "18px", marginTop: "10px" }}>
          <span style={subTextStyle}>{t("my_stake.voting_power_explain")}</span>
        </div>

        <Flex backgroundColor={colors.black10} padding={"15px"}>
          {this.state.nonDecay ? (
            <p
              style={centerTextStyle}
              dangerouslySetInnerHTML={{
                __html: t(
                  net === "kovan"
                    ? "my_stake.nonDecay.calculate_auto.kovan"
                    : "my_stake.nonDecay.calculate_auto",
                  {
                    duration: stakeDuration,
                    votes: this.getPowerEstimation(
                      stakeAmount,
                      stakeDuration,
                      0,
                      net
                    ).total
                  }
                )
              }}
            />
          ) : (
            <Flex margin={"0 auto"} alignItems={"baseline"}>
              <p
                style={centerTextStyle}
                dangerouslySetInnerHTML={{
                  __html: t(
                    "my_stake.nonDecay.calculate_estimate",
                    this.getPowerEstimation(stakeAmount, stakeDuration, 0, net)
                  )
                }}
              />
              <span>...</span>
              <p
                style={centerTextStyle}
                dangerouslySetInnerHTML={{
                  __html: t(
                    "my_stake.nonDecay.calculate_estimate",
                    this.getPowerEstimation(
                      stakeAmount,
                      stakeDuration,
                      Math.round(Number(stakeDuration) / 3),
                      net
                    )
                  )
                }}
              />
              <span>...</span>
              <p
                style={centerTextStyle}
                dangerouslySetInnerHTML={{
                  __html: t(
                    "my_stake.nonDecay.calculate_estimate",
                    this.getPowerEstimation(
                      stakeAmount,
                      stakeDuration,
                      stakeDuration,
                      net
                    )
                  )
                }}
              />
            </Flex>
          )}
        </Flex>
        {children}
      </div>
    );
  }
}

type DurationFormItemProps = {
  fieldName?: string,
  form: any,
  initialValue?: number,
  onChange?: number => void,
  validatorFactory?: (
    maxDuration: number
  ) => (rule: any, value: any, callback: any) => void
};

export class DurationFormItem extends Component<DurationFormItemProps> {
  props: DurationFormItemProps;

  render() {
    const net =
      window.web3 && window.web3.currentProvider.networkVersion === "42"
        ? "kovan"
        : "main";
    let maxDuration = getStakeDurationMaxValue();
    const {
      fieldName = "stakeDuration",
      form,
      initialValue = 0,
      onChange,
      validatorFactory = validateStakeDuration
    } = this.props;
    const { getFieldDecorator } = form;
    maxDuration = maxDuration >= initialValue ? maxDuration : initialValue;

    return (
      <Form.Item
        {...formItemLayout}
        label={
          <FormItemText
            text={t("my_stake.stakeDuration")}
            sub={
              net === "kovan"
                ? t("my_stake.duration_of_epoch.kovan")
                : t("my_stake.duration_of_epoch")
            }
          />
        }
        style={CommonMarginBottomStyle}
      >
        {getFieldDecorator(fieldName, {
          initialValue,
          rules: [
            {
              required: true,
              message: t("my_stake.stakeDuration.required")
            },
            {
              validator: validatorFactory(maxDuration)
            }
          ]
        })(
          <InputNumber
            size="large"
            step={7}
            min={0}
            max={maxDuration}
            style={{ width: "100%", background: "#f7f7f7", border: "none" }}
            onChange={onChange}
          />
        )}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={subTextStyle}>{t("my_stake.change_anytime")}</span>
          <span style={subTextStyle}>
            {net === "kovan"
              ? t("my_stake.epoch_hour")
              : t("my_stake.epoch_day")}
          </span>
        </div>
      </Form.Item>
    );
  }
}
