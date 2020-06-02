// @flow
import React, { Component } from "react";
// $FlowFixMe
import { Button, Checkbox, Divider, Input, Form } from "antd";
import { t } from "onefx/lib/iso-i18n";
import { CodeModal } from "../claim-rewards";
import { GreySpan } from "./distribution-styles";
import { validateMaxEpochCount } from "../../smart-contract/field-validators";

export type BookkeeperParams = {
  delegateName: string;
  startEpoch: number;
  epochCount: number;
  percentage: number;
  includeFoundationBonus: boolean;
};

function getBookkeeperCalcCli({
  delegateName,
  startEpoch,
  epochCount,
  percentage,
  includeFoundationBonus,
}: BookkeeperParams) {
  return `bookkeeper --bp ${delegateName} --start ${startEpoch} --to ${epochCount} --percentage ${percentage} ${
    includeFoundationBonus ? "--with-foundation-bonus" : ""
  }`;
}

type Props = {
  form?: any;
  isPublic?: boolean;
  onSubmit?: (params: BookkeeperParams) => void;
  delegateName?: string;
  startEpoch?: number;
  count?: number;
  includeFoundationBonus?: boolean;
  percentage?: number;
};
type State = {
  showModal: boolean;
};
@Form.create({ name: "calc-rewards" })
class CalcRewardsForm extends Component<Props, State> {
  state = { showModal: false };

  changeToAbs = (e: any) => {
    return e.target.value == "" || isNaN(Number(e.target.value))
      ? e.target.value
      : Math.abs(e.target.value);
  };

  render() {
    const { form, isPublic, delegateName } = this.props;
    const { getFieldDecorator } = form || {};
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
      },
    };
    return (
      <Form {...formItemLayout}>
        {isPublic ? (
          <div
            style={{ whiteSpace: "normal", margin: "16px 0", fontSize: "16px" }}
          >
            {t("rewards.form_title")}
          </div>
        ) : (
          <Divider orientation={"left"} style={{ marginTop: 30 }}>
            {t("rewards.distribution.step_1")}
          </Divider>
        )}
        <Form.Item
          {...formItemLayout}
          label={t("rewards.distribution.register_name")}
        >
          {getFieldDecorator("delegateName", {
            initialValue: delegateName,
            rules: [
              {
                required: true,
                message: t("rewards.distribution.register_name.required"),
              },
              {
                pattern: /^[a-z\d#]+$/,
                message: t("my_stake.canName.err"),
              },
            ],
          })(<Input />)}
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label={t("rewards.distribution.start")}
          help={t("rewards.distribution.start.help")}
        >
          {getFieldDecorator("startEpoch", {
            initialValue: this.props.startEpoch,
            getValueFromEvent: this.changeToAbs,
            rules: [
              {
                required: true,
                message: t("rewards.distribution.start.required"),
              },
              {
                type: "integer",
                message: t("rewards.distribution.integer.error"),
                transform: (value: string) => {
                  return Number(value);
                },
              },
            ],
          })(<Input />)}
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label={t("rewards.distribution.count")}
          help={t("rewards.distribution.count.help")}
        >
          {getFieldDecorator("epochCount", {
            initialValue: this.props.count,
            rules: [
              {
                required: true,
                message: t("rewards.distribution.to.required"),
              },
              {
                type: "integer",
                message: t("rewards.distribution.integer.error"),
                transform: (value: string) => {
                  return Number(value);
                },
              },
              {
                message: t("tools.maxEpochCountError", { max: 250 }),
                validator: validateMaxEpochCount(250),
              },
            ],
            getValueFromEvent: this.changeToAbs,
          })(<Input />)}
        </Form.Item>
        <Form.Item>
          <p>
            {isPublic
              ? t("rewards.distribution")
              : t("profile.rewards.dtbplan.p1")}
          </p>
          <Checkbox checked={true} disabled={true}>
            <GreySpan>{t("profile.rewards.constructor1")}</GreySpan>
          </Checkbox>
          {getFieldDecorator("includeFoundationBonus", {
            // Be careful that Initial Value of this.props.includeFoundationBonus is undefined.
            initialValue: true,
          })(
            <Checkbox defaultChecked={true}>
              <GreySpan>{t("profile.rewards.constructor2")}</GreySpan>
            </Checkbox>
          )}
        </Form.Item>

        <Form.Item
          {...formItemLayout}
          label={t("rewards.distribution.percentage")}
          help={t("rewards.distribution.percentage.help")}
        >
          {getFieldDecorator("percentage", {
            initialValue: this.props.percentage,
            rules: [
              {
                required: true,
                message: t("rewards.distribution.percentage.required"),
              },
              {
                type: "number",
                message: t("claim-reward.amount.error"),
                transform: (value: string) => {
                  return Number(value);
                },
              },
            ],
            getValueFromEvent: this.changeToAbs,
          })(<Input />)}
        </Form.Item>

        <Button
          type={"primary"}
          onClick={() => {
            if (!form) {
              return;
            }
            form.validateFields((err, value: BookkeeperParams) => {
              if (err) {
                return;
              }
              if (isPublic) {
                return this.props.onSubmit && this.props.onSubmit(value);
              }
              this.setState({ showModal: true });
            });
          }}
        >
          {t("rewards.calculate.table.button")}
        </Button>
        <CodeModal
          show={this.state.showModal}
          getCode={() => {
            if (!form) {
              return;
            }
            const opts = form.getFieldsValue();
            return getBookkeeperCalcCli(opts);
          }}
          onClose={() => this.setState({ showModal: false })}
        />
      </Form>
    );
  }
}

export { CalcRewardsForm };
