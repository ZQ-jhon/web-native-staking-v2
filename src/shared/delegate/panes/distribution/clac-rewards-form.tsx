import Button from "antd/lib/button";
import Checkbox from "antd/lib/checkbox";
import Divider from "antd/lib/divider";
import Form, { FormInstance } from "antd/lib/form";
import Input from "antd/lib/input";
import { t } from "onefx/lib/iso-i18n";
import React, { Component, RefObject } from "react";
import { GreySpan } from "../../../common/component-style";
import { rewardFormItemLayout } from "../../../common/form-item-layout";
import { validateMaxEpochCount } from "../../../staking/field-validators";
import { CodeModal } from "../claim-rewards";

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
}: BookkeeperParams): string {
  return `bookkeeper --bp ${delegateName} --start ${startEpoch} --to ${epochCount} --percentage ${percentage} ${
    includeFoundationBonus ? "--with-foundation-bonus" : ""
  }`;
}

type Props = {
  isPublic?: boolean;
  onSubmit?(params: BookkeeperParams): void;
  delegateName?: string;
  startEpoch?: number;
  count?: number;
  includeFoundationBonus?: boolean;
  percentage?: number;
};
type State = {
  showModal: boolean;
  disabled: boolean;
};

class CalcRewardsForm extends Component<Props, State> {
  formRef: RefObject<FormInstance> = React.createRef<FormInstance>();

  constructor(props: Props) {
    super(props);
    this.state = {
      showModal: false,
      disabled: true,
    };
  }
  // tslint:disable-next-line:no-any
  changeToAbs = (e: any) => {
    return e.target.value === "" || isNaN(Number(e.target.value))
      ? e.target.value
      : Math.abs(e.target.value);
  };

  onFinish = (values: BookkeeperParams) => {
    const { isPublic } = this.props;
    if (isPublic) {
      return this.props.onSubmit && this.props.onSubmit(values);
    }
    this.setState({ showModal: true });
  };
  handleChange = () => {
    const form = this.formRef.current;
    this.setState({ disabled: false });
    const errors = form && form.getFieldsError();
    if (!!errors) {
      errors.map((err) => {
        if (!!err.errors.length) {
          this.setState({ disabled: true });
        }
      });
    }
  };
  // tslint:disable-next-line:max-func-body-length
  render(): JSX.Element {
    const { isPublic, delegateName } = this.props;
    return (
      // @ts-ignore
      <Form
        ref={this.formRef}
        {...rewardFormItemLayout}
        onFinish={this.onFinish}
        onFieldsChange={this.handleChange}
      >
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
        {
          // @ts-ignore
          <Form.Item
            {...rewardFormItemLayout}
            name={"delegateName"}
            label={t("rewards.distribution.register_name")}
            initialValue={delegateName}
            rules={[
              {
                required: true,
                message: t("rewards.distribution.register_name.required"),
              },
              {
                pattern: /^[a-z\d#]+$/,
                message: t("my_stake.canName.err"),
              },
            ]}
          >
            <Input />
          </Form.Item>
        }
        {
          // @ts-ignore
          <Form.Item
            {...rewardFormItemLayout}
            style={{ marginBottom: "3px" }}
            name={"startEpoch"}
            label={t("rewards.distribution.start")}
            initialValue={this.props.startEpoch}
            rules={[
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
            ]}
          >
            <Input />
          </Form.Item>
        }
        {/*
                // @ts-ignore */}
        <Form.Item {...rewardFormItemLayout} label={<span />}>
          <span>{t("rewards.distribution.start.help")}</span>
        </Form.Item>
        {
          // @ts-ignore
          <Form.Item
            {...rewardFormItemLayout}
            style={{ marginBottom: "3px" }}
            label={t("rewards.distribution.count")}
            name={"epochCount"}
            initialValue={this.props.count}
            rules={[
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
                // @ts-ignore
                message: t("tools.maxEpochCountError", { max: 250 }),
                validator: validateMaxEpochCount(250),
              },
            ]}
          >
            <Input />
          </Form.Item>
        }
        {/*
                // @ts-ignore */}
        <Form.Item {...rewardFormItemLayout} label={<span />}>
          <span>{t("rewards.distribution.count.help")}</span>
        </Form.Item>
        {
          // @ts-ignore
          <Form.Item name={"includeFoundationBonus"} initialValue={true}>
            <p>
              {isPublic
                ? t("rewards.distribution")
                : t("profile.rewards.dtbplan.p1")}
            </p>
            <Checkbox checked={true} disabled={true}>
              <GreySpan>{t("profile.rewards.constructor1")}</GreySpan>
            </Checkbox>
            <Checkbox defaultChecked={true}>
              <GreySpan>{t("profile.rewards.constructor2")}</GreySpan>
            </Checkbox>
          </Form.Item>
        }
        {
          // @ts-ignore
          <Form.Item
            {...rewardFormItemLayout}
            style={{ marginBottom: "3px" }}
            label={t("rewards.distribution.percentage")}
            name={"percentage"}
            initialValue={this.props.percentage}
            rules={[
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
            ]}
            getValueFromEvent={this.changeToAbs}
          >
            <Input />
          </Form.Item>
        }
        {/*
                // @ts-ignore */}
        <Form.Item {...rewardFormItemLayout} label={<span />}>
          <span>{t("rewards.distribution.percentage.help")}</span>
        </Form.Item>
        <Button
          type={"primary"}
          htmlType="submit"
          disabled={this.state.disabled}
        >
          {t("rewards.calculate.table.button")}
        </Button>
        <CodeModal
          show={this.state.showModal}
          getCode={() => {
            const form = this.formRef.current;
            if (!form) {
              return;
            }
            const opts = form.getFieldsValue();
            return getBookkeeperCalcCli(opts as BookkeeperParams);
          }}
          onClose={() => this.setState({ showModal: false })}
        />
      </Form>
    );
  }
}

export { CalcRewardsForm };
