// @flow
import {Form, Input} from "antd";
import {FormInstance} from "antd/lib/form";
import {validateAddress} from "iotex-antenna/lib/account/utils";
import {t} from "onefx/lib/iso-i18n";
import React, {Component, RefObject} from "react";
import {CommonMarginBottomStyle} from "../../common/common-margin";
import {Flex} from "../../common/flex";
import {formItemLayout} from "../../common/form-item-layout";
import {getIoPayAddress, getIotxBalance} from "../../common/get-antenna";
import {IopayRequired} from "../../common/iopay-required";
import {Bucket} from "../../common/token-utils";
import {smallerOrEqualTo, validateStakeDuration} from "../field-validators";
import {AutoStakeFormItem, DurationFormItem, FormItemText, subTextStyle} from "../staking-form-item";

type Props = {
  currentStakeDuration: number,
  currentStakeAmount: number,
  handleSelectChange: Function,
  handleDurationChange: Function,
  handleStakedAmountChange: Function,
  formRef?: RefObject<FormInstance>,
  reEdit?: boolean,
  bucket?: Bucket
};

type State = {
  iotxBalance: number
};

// @ts-ignore
@IopayRequired
class StakeAndVoteNew extends Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      iotxBalance: 0,
    };
  }

  async componentDidMount(): Promise<void> {
    try{
      const ioAddress = await getIoPayAddress();
      if (validateAddress(ioAddress)){
        const iotxBalance = await getIotxBalance(ioAddress);
        this.setState({ iotxBalance });
      } else{
        window.console.log(`getIoPayAddress() return ioAddress '${ioAddress}' invalidate`);
      }
    } catch (e) {
      window.console.log("error when load iotx balance", e);
    }
    const{ reEdit, formRef, bucket} = this.props;
    if (reEdit && formRef && bucket) {
      const form = formRef.current;
      if(form) {
        form.setFieldsValue({
          nonDecay: bucket.nonDecay,
          stakeDuration: bucket.stakeDuration,
          stakedAmount: bucket.stakedAmount
        });
      }
    }
  }

  // tslint:disable-next-line:max-func-body-length
  render(): JSX.Element {
    const tokenType = "IOTX";
    const {
      formRef,
      currentStakeDuration,
      currentStakeAmount,
      handleSelectChange,
      handleDurationChange,
      handleStakedAmountChange,
    } = this.props;

    const {
      iotxBalance
    } = this.state;

    return (
      <>{
        // @ts-ignore
        <Form.Item
          {...formItemLayout}
          labelAlign={"left"}
          label={
            <FormItemText
              text={t("my_stake.stakedAmount")}
              sub={t("my_stake.amount_of_vote")}
            />
          }
          style={CommonMarginBottomStyle}
          name="stakedAmount"
          rules={[
            {
              required: true,
              message: t("my_stake.stakedAmount.required")
            },
            {
              validator: smallerOrEqualTo(iotxBalance, 100)
            }
          ]}
        >
          <Input
            type="number"
            size="large"
            addonAfter={tokenType}
            style={{ width: "100%", background: "#f7f7f7", border: "none" }}
            onChange={event => {
              const numberValue = Number(event.target.value);
              handleStakedAmountChange(numberValue);
            }}
            onBlur={event => {
              const numberValue = Number(event.target.value);
              const minValue = 100;
              if (numberValue < minValue && formRef && formRef.current) {
                const { setFieldsValue } = formRef.current;
                setFieldsValue({ stakedAmount: minValue });
                handleStakedAmountChange(minValue);
              }
            }}
          />
        </Form.Item>
      }
        <Form.Item
          {...formItemLayout}
          style={CommonMarginBottomStyle}
          label={<span/>}
        >
          <Flex justifyContent="space-between">
            {(
              // @ts-ignore
              <span style={subTextStyle}>{t("my_stake.allow_add_more")}</span>
            )}
            {(
              // @ts-ignore
              <span style={subTextStyle}>
            {`${t("my_stake.current_balance")} ${iotxBalance.toFixed(
              2
            )} ${tokenType}`}
          </span>
            )}
          </Flex>
        </Form.Item>
        {
          // @ts-ignore
          <DurationFormItem
            onChange={numberValue => {
              handleDurationChange(numberValue);
            }}
            validatorFactory={validateStakeDuration}
          />
        }
        {(
          // @ts-ignore
          <AutoStakeFormItem
            initialValue={false}
            stakeAmount={currentStakeAmount}
            stakeDuration={currentStakeDuration}
            onChange={handleSelectChange}
          />
        )}
      </>
    );
  }
}

export { StakeAndVoteNew };