// @flow
import { InfoCircleOutlined, RetweetOutlined } from "@ant-design/icons/lib";
import { Form, InputNumber, Switch } from "antd";
import BigNumber from "bignumber.js";
// @ts-ignore
import { t } from "onefx/lib/iso-i18n";
import React, { Component } from "react";
import {
  CommonMarginBottomStyle,
  CommonMarginTop,
  NoMarginBottomStyle
} from "../common/common-margin";
import { Flex } from "../common/flex";
import { formItemLayout } from "../common/form-item-layout";
import { colors } from "../common/styles/style-color2";
import { fontFamily, fonts } from "../common/styles/style-font";
import { getPowerEstimation } from "../common/token-utils";
import {
  getStakeDurationMaxValue,
  validateStakeDuration
} from "./field-validators";

type Props = {
  // tslint:disable-next-line:no-any
  children?: any;
  showAutoStack?: boolean;
  // tslint:disable-next-line:no-any
  style?: any;
  fieldName?: string;
  initialValue?: boolean;
  stakeAmount?: BigNumber;
  stakeDuration?: number;
  forceDisable?: boolean;
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
  color: colors.black80,
  whiteSpace: "break-spaces"
};

export const centerTextStyle = {
  ...subTextStyle,
  textAlign: "center",
  color: colors.black,
  margin: "0 18px"
};

type FormItemTextTypes = {
  text: string;
  sub: string;
};

export function FormItemText({
  text = "",
  sub = ""
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
    nonDecay: false
  };
  props: Props;

  componentDidMount(): void {
    // @ts-ignore
    this.setState({ nonDecay: this.props.initialValue });
  }

  getPowerEstimation(
    amount: number,
    duration: number,
    dayFromToday: number
    // tslint:disable-next-line:no-any
  ): any {
    const resp = getPowerEstimation(amount, duration, dayFromToday);
    return { total: resp.total.toFormat(0), date: resp.date };
  }

  // tslint:disable-next-line:max-func-body-length
  render(): JSX.Element {
    const {
      fieldName = "nonDecay",
      showAutoStack = true,
      children,
      stakeAmount = new BigNumber(0),
      stakeDuration = 0,
      forceDisable = false
    } = this.props;
    return (
      <div>
        {showAutoStack ? (
          <div>
            {
              // @ts-ignore
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
                initialValue={this.state.nonDecay}
                valuePropName={"checked"}
              >
                {
                  // tslint:disable-next-line:use-simple-attributes
                  <Switch
                    style={{ textAlign: "right" }}
                    onChange={checked => {
                      if (!forceDisable) {
                        this.setState({ nonDecay: checked });
                      }
                    }}
                  />
                }
              </Form.Item>
            }
            {
              // @ts-ignore
              <span style={{ ...subTextStyle, ...CommonMarginBottomStyle }}>
                {t("my_stake.autoStake_explain")}
              </span>
            }
          </div>
        ) : null}
        <CommonMarginTop />

        <div style={{ marginTop: "26px" }}>
          <IconLabel
            iconType={<InfoCircleOutlined style={{ color: colors.deltaUp }} />}
            text={t("my_stake.voting_power")}
          />
        </div>
        <div style={{ marginBottom: "18px", marginTop: "10px" }}>
          {
            // @ts-ignore
            <span style={subTextStyle}>
              {t("my_stake.voting_power_explain")}
            </span>
          }
        </div>

        <Flex backgroundColor={colors.black10} padding={"15px"}>
          {this.state.nonDecay ? (
            // tslint:disable-next-line:react-no-dangerous-html
            <p
              // @ts-ignore
              style={centerTextStyle}
              dangerouslySetInnerHTML={{
                __html: t(
                  "my_stake.nonDecay.calculate_auto",
                  // @ts-ignore
                  {
                    duration: stakeDuration,
                    votes: this.getPowerEstimation(
                      stakeAmount.toNumber(),
                      stakeDuration,
                      0
                    ).total
                  }
                )
              }}
            />
          ) : (
            <Flex margin={"0 auto"} alignItems={"baseline"}>
              {/* tslint:disable-next-line:react-no-dangerous-html */}
              <p
                // @ts-ignore
                style={centerTextStyle}
                dangerouslySetInnerHTML={{
                  __html: t(
                    "my_stake.nonDecay.calculate_estimate",
                    this.getPowerEstimation(
                      stakeAmount.toNumber(),
                      stakeDuration,
                      0
                    )
                  )
                }}
              />
              <span>...</span>
              {/* tslint:disable-next-line:react-no-dangerous-html */}
              <p
                // @ts-ignore
                style={centerTextStyle}
                dangerouslySetInnerHTML={{
                  __html: t(
                    "my_stake.nonDecay.calculate_estimate",
                    this.getPowerEstimation(
                      stakeAmount.toNumber(),
                      stakeDuration,
                      Math.round(Number(stakeDuration) / 3)
                    )
                  )
                }}
              />
              <span>...</span>
              {/* tslint:disable-next-line:react-no-dangerous-html */}
              <p
                // @ts-ignore
                style={centerTextStyle}
                dangerouslySetInnerHTML={{
                  __html: t(
                    "my_stake.nonDecay.calculate_estimate",
                    this.getPowerEstimation(
                      stakeAmount.toNumber(),
                      stakeDuration,
                      stakeDuration
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
  fieldName?: string;
  initialValue?: number;
  onChange?(value: number): void;
  validatorFactory?(
    maxDuration: number
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
      validatorFactory = validateStakeDuration
    } = this.props;

    maxDuration = maxDuration >= initialValue ? maxDuration : initialValue;
    return (
      <>
        {
          // @ts-ignore
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
                message: t("my_stake.stakeDuration.required")
              },
              {
                validator: validatorFactory(maxDuration)
              }
            ]}
            initialValue={initialValue}
          >
            <InputNumber
              size="large"
              step={7}
              min={0}
              max={maxDuration}
              style={{ width: "100%", background: "#f7f7f7", border: "none" }}
              // @ts-ignore
              onChange={onChange}
            />
          </Form.Item>
        }
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
