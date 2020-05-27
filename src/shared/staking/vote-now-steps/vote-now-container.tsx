// @flow
import PlusCircleFilled from "@ant-design/icons/PlusCircleFilled";
import SnippetsFilled from "@ant-design/icons/SnippetsFilled";
import { AutoComplete, Button, Form, Radio } from "antd";
import { FormInstance } from "antd/lib/form";
import { get } from "dottie";
// @ts-ignore
import window from "global/window";
import { t } from "onefx/lib/iso-i18n";
import { styled } from "onefx/lib/styletron-react";
import React, { Component, RefObject } from "react";
import { Mutation, Query } from "react-apollo";
import { connect } from "react-redux";
// @ts-ignore
import {
  CommonMargin,
  CommonMarginBottomStyle
} from "../../common/common-margin";
import { CommonModal } from "../../common/common-modal";
import { formItemLayout } from "../../common/form-item-layout";
import { getIoPayAddress } from "../../common/get-antenna";
import { colors } from "../../common/styles/style-color2";
import { DEFAULT_STAKING_GAS_LIMIT } from "../../common/token-utils";
import { MyReferralTwitterButton } from "../../my-referrals/my-referral-twitter-button";
import { validateCanName } from "../field-validators";
import {
  GET_ALL_CANDIDATE,
  RECORD_STAKING_REFERRAL
} from "../smart-contract-gql-queries";
import { actionSmartContractCalled } from "../smart-contract-reducer";
import { StakeAndVoteExisting } from "../stake-and-vote-source-options/stake-and-vote-existing";
import { StakeAndVoteNew } from "../stake-and-vote-source-options/stake-and-vote-new";
import { FormItemText, subTextStyle } from "../staking-form-item";
import { ConfirmStep } from "./confirm-step";
import { SuccessStep } from "./success-step";

import BigNumber from "bignumber.js";
import { toRau } from "iotex-antenna/lib/account/utils";
import { getStaking, IBucket } from "../../../server/gateway/staking";
import { webBpApolloClient } from "../../common/apollo-client";

type TcanName = {
  value: string;
  errorMsg: string;
  validateStatus: string;
};

type State = {
  visible: boolean;
  step: string;
  currentStakeDuration: number;
  currentStakeAmount: number;
  votingSource: "VOTING_FROM_WALLET" | "VOTING_FROM_EXISTING";
  stepConfirming: boolean;
  canName: TcanName;
  reEdit: boolean;
};

type Props = {
  displayOthers: boolean;
  forceDisplayModal: boolean;
  // tslint:disable-next-line:no-any
  requestDismiss(): any;
  actionSmartContractCalled?(payload: boolean): void;
  registeredName?: string;
  siteUrl?: string;
  // tslint:disable-next-line:no-any
  currentCandidate?: any;
  disableModal?: boolean;
  isIoPay?: boolean;
};

const CONFIRM_STEP = "CONFIRM";
const SUCCESS_STEP = "SUCCESS";

const ModalTitle = styled("b", props => ({
  fontSize: "24px",
  ...props
}));

const Confirmation = styled("div", () => ({
  color: colors.error,
  fontSize: "12px",
  marginTop: "10px"
}));

const VoteNowContainer = connect(
  (state: { base: { siteUrl: string; isIoPay: boolean } }) => ({
    siteUrl: state.base.siteUrl,
    isIoPay: state.base.isIoPay
  }),
  dispatch => ({
    // tslint:disable-next-line:no-any
    actionSmartContractCalled(payload: any): any {
      dispatch(actionSmartContractCalled(payload));
    }
  })
)(
  class VoteNowContainer extends Component<Props, State> {
    state: State;
    props: Props;
    bucket: IBucket;
    isExistingBucket: boolean;
    txHash: string = "";
    ioAddress: string = "";
    formRef: RefObject<FormInstance> = React.createRef<FormInstance>();

    // tslint:disable-next-line:no-any
    handleOk = (recordStakingReferral: any) => async (e: any) => {
      e.preventDefault();
      this.setState({ stepConfirming: true });
      await this.launchNativeStaking(recordStakingReferral);
      this.setState({ stepConfirming: false });
    };

    // tslint:disable-next-line:no-any
    async launchNativeStaking(recordStakingReferral: any): Promise<void> {
      const {
        stakedDuration,
        autoStake,
        index,
        stakedAmount,
        canName
      } = this.bucket;
      const amount = String(stakedAmount);
      if (canName) {
        try {
          if (this.state.votingSource === "VOTING_FROM_EXISTING") {
            this.txHash = await getStaking().changeCandidate({
              bucketIndex: index,
              candidateName: canName,
              payload: "",
              gasLimit: DEFAULT_STAKING_GAS_LIMIT,
              gasPrice: toRau("1", "Qev")
            });
          } else if (this.isFreshStaking()) {
            this.txHash = await getStaking().createStake({
              candidateName: canName,
              stakedAmount: toRau(amount, "Iotx"),
              stakedDuration,
              autoStake,
              payload: "",
              gasLimit: DEFAULT_STAKING_GAS_LIMIT,
              gasPrice: toRau("1", "Qev")
            });
            this.ioAddress = await getIoPayAddress();
            recordStakingReferral({
              variables: {
                stakingReferralInput: {
                  referralEthAddr: this.ioAddress,
                  txHash: this.txHash
                }
              }
            });
          } else {
            this.txHash = await getStaking().restake({
              bucketIndex: index,
              stakedDuration,
              autoStake,
              payload: "",
              gasLimit: DEFAULT_STAKING_GAS_LIMIT,
              gasPrice: toRau("1", "Qev")
            });
          }
          window.console.log(`create native staking: ${this.txHash}`);
          this.setState({ step: SUCCESS_STEP });
        } catch (err) {
          window.console.error(`failed to make transaction: ${err.stack}`);
        }
      }
    }

    isFreshStaking(): boolean {
      return (
        !this.isExistingBucket ||
        this.state.votingSource === "VOTING_FROM_WALLET"
      );
    }

    // tslint:disable-next-line:no-any
    constructor(props: any) {
      super(props);
      this.state = {
        visible: false,
        step: "",
        currentStakeAmount: 0,
        currentStakeDuration: 0,
        votingSource: "VOTING_FROM_WALLET",
        stepConfirming: false,
        reEdit: false,
        canName: {
          value: props.registeredName || "",
          errorMsg: "",
          validateStatus: ""
        }
      };
    }

    onSubmit = () => {
      this.setState({ visible: true });
    };

    handleCancel = () => {
      if (this.state.step === SUCCESS_STEP) {
        const { actionSmartContractCalled } = this.props;
        if (actionSmartContractCalled) {
          actionSmartContractCalled(true);
        }
      }
      const form = this.formRef.current;
      if (form) {
        form.resetFields();
      }
      if (this.props.requestDismiss) {
        this.props.requestDismiss();
      }
      // @ts-ignore
      this.setState({
        visible: false,
        step: "",
        reEdit: false,
        stepConfirming: false
      });
    };

    // tslint:disable-next-line:no-any
    handleConfirmation = async (e: any) => {
      if (!this.formRef.current) {
        return;
      }
      e.preventDefault();
      if (!this.state.canName.validateStatus) {
        this.handleCanNameChange(this.state.canName.value);
      }
      const values = await this.formRef.current.validateFields();
      if (!this.state.canName.errorMsg) {
        window.console.log("Received values of form: ", {
          ...values,
          canName: this.state.canName.value
        });
        const bucket = this.bucket || {};
        // @ts-ignore
        this.bucket = {
          canName: values.canName || this.state.canName.value,
          autoStake:
            values.nonDecay !== undefined
              ? values.nonDecay
              : bucket.autoStake || false,
          stakedDuration: values.stakeDuration || bucket.stakedDuration || 0,
          stakedAmount:
            values.stakedAmount || bucket.stakedAmount || new BigNumber(0)
        };
        this.setState({ step: CONFIRM_STEP });
      }
    };

    // tslint:disable-next-line:no-any
    handleSuccess = (e: any) => {
      e.preventDefault();
      this.handleCancel();
    };
    // tslint:disable-next-line:no-any
    handleRadioChange = (e: any) => {
      this.setState({ votingSource: e.target.value });
      if (e.target.value === "VOTING_FROM_WALLET") {
        delete this.bucket;
      }
    };
    // tslint:disable-next-line:no-any
    handleSelectChange = (value: any) => {
      const { stakedAmount, stakeDuration } = value;
      this.bucket = value;
      this.setState({
        currentStakeDuration: stakeDuration,
        currentStakeAmount: stakedAmount
      });
    };
    handleRevote = (bucket: IBucket) => {
      this.bucket = bucket;
      this.isExistingBucket = true;
      this.setState({
        currentStakeAmount: Number(bucket.stakedAmount),
        currentStakeDuration: bucket.stakedDuration
      });
    };
    // tslint:disable-next-line:no-any
    handleReEdit = (e: any) => {
      e.preventDefault();
      this.setState({ step: "", reEdit: true });
    };
    getTitle = () => {
      switch (this.state.step) {
        case CONFIRM_STEP:
          return <ModalTitle>{t("my_stake.on_process")}</ModalTitle>;
        case SUCCESS_STEP:
          return <ModalTitle>{t("my_stake.vote_success")}</ModalTitle>;
        default:
          return (
            <span>
              <SnippetsFilled type="snippets" style={{ marginRight: "17px" }} />
              <ModalTitle>{t("my_stake.new")}</ModalTitle>
            </span>
          );
      }
    };
    getOkText = () => {
      switch (this.state.step) {
        case CONFIRM_STEP:
          return t("my_stake.make_transaction");
        case SUCCESS_STEP:
          return t("my_stake.back");
        default:
          return t("my_stake.proceed_to_vote");
      }
    };

    // tslint:disable-next-line:no-any
    getHandleOk = (recordStakingReferral: any) => (e: any) => {
      switch (this.state.step) {
        case CONFIRM_STEP:
          return this.handleOk(recordStakingReferral)(e);
        case SUCCESS_STEP:
          return this.handleSuccess(e);
        default:
          return this.handleConfirmation(e);
      }
    };

    // tslint:disable-next-line:no-any
    handleCanNameChange = (value: any) => {
      // @ts-ignore
      validateCanName(null, value, errorMsg => {
        this.setState({
          canName: {
            value,
            errorMsg,
            validateStatus: errorMsg ? "error" : "success"
          }
        });
      });
    };

    // tslint:disable-next-line:no-any
    handleDurationChange(numberValue: any): void {
      this.setState({ currentStakeDuration: numberValue });
      const form = this.formRef.current;
      if (!numberValue && form) {
        form.setFieldsValue({
          nonDecay: false
        });
      }
    }

    // tslint:disable-next-line:no-any
    getFooter = (recordStakingReferral: any) => {
      const { disableModal, currentCandidate } = this.props;

      switch (this.state.step) {
        case SUCCESS_STEP:
          return [
            !disableModal && (
              <Button key="back" onClick={this.handleCancel}>
                {t("name_registration.cancel")}
              </Button>
            ),
            " ",
            // tslint:disable-next-line:use-simple-attributes
            <MyReferralTwitterButton
              key="twitter"
              data={
                currentCandidate || {
                  name: this.bucket && this.bucket.canName
                }
              }
            />
          ];
        default:
          return [
            !disableModal && (
              <Button key="back" onClick={this.handleCancel}>
                {t("name_registration.cancel")}
              </Button>
            ),
            " ",
            // tslint:disable-next-line:use-simple-attributes
            <Button
              key="submit"
              type="primary"
              loading={Boolean(this.state.step) && this.state.stepConfirming}
              onClick={e => this.getHandleOk(recordStakingReferral)(e)}
            >
              {this.getOkText()}
            </Button>,
            Boolean(this.state.step) && this.state.stepConfirming && (
              <Confirmation key="confirmation">
                {t("my_stake.on_process_native_confirmation")}
              </Confirmation>
            )
          ];
      }
    };

    // tslint:disable-next-line:max-func-body-length
    renderSteps(): JSX.Element {
      const { siteUrl = "" } = this.props;
      const {
        votingSource,
        currentStakeDuration,
        currentStakeAmount
      } = this.state;

      switch (this.state.step) {
        case CONFIRM_STEP:
          return (
            <ConfirmStep
              bucket={this.bucket}
              handleReEdit={this.handleReEdit}
            />
          );
        case SUCCESS_STEP:
          return <SuccessStep txHash={this.txHash} siteUrl={siteUrl} />;
        default:
          return (
            // @ts-ignore
            <Form layout={"horizontal"} ref={this.formRef}>
              {/*
                // @ts-ignore */}
              <Query
                client={webBpApolloClient}
                ssr={false}
                query={GET_ALL_CANDIDATE}
              >
                {/* tslint:disable-next-line:no-any */}
                {({ data }: any) => {
                  const bpCandidates = {};
                  const allCandidates =
                    (data && data.bpCandidatesOnContract) || [];
                  if (data && Array.isArray(data.bpCandidates)) {
                    data.bpCandidates.forEach(
                      (i: {
                        status: string;
                        registeredName: string | number;
                      }) => {
                        if (i.status && i.status !== "UNQUALIFIED") {
                          // @ts-ignore
                          bpCandidates[i.registeredName] = i;
                        }
                      }
                    );
                  }
                  const dataSource = allCandidates
                    // @ts-ignore
                    .map(item => {
                      const delegateName = get(
                        // @ts-ignore
                        bpCandidates[item.name],
                        "name",
                        ""
                      );
                      const displayName = delegateName
                        ? `${item.name} - ${delegateName}`
                        : item.name;
                      return { text: displayName, value: item.name };
                    })
                    // tslint:disable-next-line:no-any
                    .filter((item: { value: any }) => Boolean(item.value));
                  return (
                    <Form.Item
                      {...formItemLayout}
                      labelAlign={"left"}
                      label={
                        <FormItemText
                          text={t("my_stake.canName")}
                          sub={t("my_stake.canName_tint")}
                        />
                      }
                      style={CommonMarginBottomStyle}
                      required={true}
                      // @ts-ignore
                      validateStatus={this.state.canName.validateStatus}
                      help={this.state.canName.errorMsg}
                    >
                      {/*
                      // @ts-ignore */}
                      <AutoComplete
                        defaultValue={this.state.canName.value}
                        onChange={this.handleCanNameChange}
                        size="large"
                        disabled={Boolean(this.props.registeredName)}
                        dataSource={dataSource}
                        // @ts-ignore
                        filterOption={(inputValue, option) =>
                          String(
                            get(
                              // @ts-ignore
                              option,
                              "props.children"
                            )
                          )
                            .toLowerCase()
                            .indexOf(inputValue.toLowerCase()) !== -1
                        }
                      />
                    </Form.Item>
                  );
                }}
              </Query>
              <span
                // @ts-ignore
                style={subTextStyle}
              >
                {t("my_stake.change_anytime")}
              </span>
              <Form.Item {...formItemLayout} style={CommonMarginBottomStyle}>
                <Radio.Group
                  value={votingSource}
                  onChange={this.handleRadioChange}
                >
                  <Radio value="VOTING_FROM_WALLET">
                    {t("voting.vote.from.wallet")}
                  </Radio>
                  <Radio value="VOTING_FROM_EXISTING" style={{ marginTop: 8 }}>
                    {t("voting.vote.existing.bucket")}
                  </Radio>
                </Radio.Group>
              </Form.Item>
              {votingSource === "VOTING_FROM_WALLET" ? (
                <StakeAndVoteNew
                  bucket={this.bucket}
                  reEdit={this.state.reEdit}
                  // @ts-ignore
                  handleSelectChange={it => this.handleSelectChange(it)}
                  // @ts-ignore
                  handleDurationChange={it => this.handleDurationChange(it)}
                  formRef={this.formRef}
                  currentStakeDuration={currentStakeDuration}
                  currentStakeAmount={currentStakeAmount}
                  // @ts-ignore
                  handleStakedAmountChange={it =>
                    this.setState({ currentStakeAmount: it })
                  }
                />
              ) : (
                // @ts-ignore
                // tslint:disable-next-line:use-simple-attributes
                <StakeAndVoteExisting
                  // @ts-ignore
                  handleRevote={bucket => this.handleRevote(bucket)}
                  currentStakeDuration={currentStakeDuration}
                  currentStakeAmount={new BigNumber(currentStakeAmount)}
                  defaultValue={this.bucket && this.bucket.index}
                />
              )}
            </Form>
          );
      }
    }

    render(): JSX.Element {
      const {
        forceDisplayModal,
        displayOthers = false,
        disableModal
      } = this.props;
      return (
        // @ts-ignore
        <Mutation mutation={RECORD_STAKING_REFERRAL}>
          {/* tslint:disable-next-line:no-any */}
          {(recordStakingReferral: any) => {
            return (
              <div>
                {disableModal && (
                  <div>
                    <h1>{this.getTitle()}</h1>
                    {this.renderSteps()}
                    <CommonMargin />
                    {this.getFooter(recordStakingReferral)}
                    <CommonMargin />
                  </div>
                )}
                {!disableModal && (
                  // @ts-ignore
                  // tslint:disable-next-line:use-simple-attributes
                  <CommonModal
                    className="vote-modal"
                    title={this.getTitle()}
                    visible={forceDisplayModal || this.state.visible}
                    onCancel={this.handleCancel}
                    footer={this.getFooter(recordStakingReferral)}
                  >
                    {this.renderSteps()}
                  </CommonModal>
                )}
                {displayOthers && (
                  <Button
                    type={"primary"}
                    size="large"
                    onClick={() => {
                      this.onSubmit();
                    }}
                  >
                    <span>
                      <PlusCircleFilled type="plus" /> {t("my_stake.new_vote")}
                    </span>
                  </Button>
                )}
              </div>
            );
          }}
        </Mutation>
      );
    }
  }
);
export { VoteNowContainer };
