/* eslint-disable no-invalid-this,max-lines */
// @flow
import { AutoComplete, Button, Form, Icon, Radio } from "antd";
import { t } from "onefx/lib/iso-i18n";
import React, { Component } from "react";
import window from "global/window";
import { connect } from "react-redux";
// $FlowFixMe
import sleepPromise from "sleep-promise";
import { styled } from "onefx/lib/styletron-react";
import { Mutation, Query } from "react-apollo";
import { get } from "dotty";
import { formItemLayout } from "../../common/form-item-layout";
import { CommonModal } from "../../common/common-modal";
import {
  Bucket,
  DEFAULT_STAKING_GAS_LIMIT,
  encodeCandidateHexName,
  WeiToTokenValue
} from "../../common/token-utils";
import {
  CommonMargin,
  CommonMarginBottomStyle
} from "../../common/common-margin";
import { colors } from "../../common/styles/style-color2";
import { MyReferralTwitterButton } from "../../my-referrals/my-referral-twitter-button";
import { actionSmartContractCalled } from "../smart-contract-reducer";
import { validateCanName } from "../field-validators";
import { FormItemText, subTextStyle } from "../staking-form-item";
import {
  GET_ALL_CANDIDATE,
  RECORD_STAKING_REFERRAL
} from "../smart-contract-gql-queries";
import { StakeAndVoteExisting } from "../stake-and-vote-source-options/stake-and-vote-existing";
import { StakeAndVoteNew } from "../stake-and-vote-source-options/stake-and-vote-new";
import { SuccessStep } from "../my-stake-model-steps/success-step";
import { enableEthereum } from "../../common/enable-ethereum";
import { ConfirmStep } from "./confirm-step";
import { earnEmeraldsForVoting } from "./emerald-help";
import { getAntenna, getRemoteAntenna } from "../../common/get-antenna";
import {
  getIoAddressFromIoPay,
  getXAppTokenContract
} from "../../xapps/xapp-request";

import { fromRau, toRau } from "iotex-antenna/lib/account/utils";
import { NATIVE_TOKEN_ABI } from "../native-token-abi";
import { Contract } from "iotex-antenna/lib/contract/contract";

type TcanName = {
  value: string,
  errorMsg: string,
  validateStatus: string
};

type State = {
  visible: boolean,
  step: string,
  currentStakeDuration: number,
  currentStakeAmount: number,
  votingSource: "VOTING_FROM_WALLET" | "VOTING_FROM_EXISTING",
  stepConfirming: boolean,
  iotxBalance: number,
  canName: TcanName
};

type Props = {
  form: any,
  stakingContract: any,
  tokenContract: (isFreshStaking: boolean, bucket: Bucket) => Contract,
  addr: string, // my metamask unlocked acct address
  actionSmartContractCalled: (payload: boolean) => void,
  displayOthers: boolean,
  registeredName: string,
  forceDisplayModal: boolean,
  requestDismiss: () => any,
  stakingContractAddr?: string,
  allCandidates: any,
  siteUrl?: string,
  currentCandidate?: any,
  disableModal: boolean,
  isNative: boolean,
  isIoPay?: boolean,
  nativeTokenContractAddr: string,
  nativePatchTokenContractAddr: string
};

type TNewStake = {
  canName: string,
  nonDecay: boolean,
  stakeDuration: number,
  stakedAmount: number,
  data: string
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

export async function getIotxBalance(address: string): Promise<number> {
  const antenna = getAntenna();
  const { accountMeta } = await antenna.iotx.getAccount({ address });

  return Number(fromRau(accountMeta.balance, "IOTX"));
}

export async function getIoAddressFromRemote(): Promise<string> {
  const antenna = getRemoteAntenna();
  let sec = 1;
  let address;
  while (!address) {
    await sleepPromise(sec * 1000);
    address =
      antenna.iotx.accounts &&
      antenna.iotx.accounts[0] &&
      antenna.iotx.accounts[0].address;
    sec = sec * 2;
    if (sec >= 16) {
      sec = 16;
    }
  }
  return address;
}

// $FlowFixMe
export const VoteNowContainer = connect(
  state => ({
    stakingContractAddr: state.smartContract.stakingContractAddr,
    allCandidates: state.smartContract.allCandidates,
    siteUrl: state.base.siteUrl,
    nativeTokenContractAddr: state.smartContract.nativeTokenContractAddr,
    nativePatchTokenContractAddr:
      state.smartContract.nativePatchTokenContractAddr,
    isIoPay: state.base.isIoPay
  }),
  dispatch => ({
    actionSmartContractCalled(payload) {
      dispatch(actionSmartContractCalled(payload));
    }
  })
)(
  // $FlowFixMe
  Form.create({ name: "upsert-stake" })(
    class UpsertStakeInner extends Component<Props, State> {
      state: State;
      props: Props;
      bucket: Bucket;
      isExistingBucket: boolean;
      txHash: string = "";
      ioAddress: string = "";

      handleOk = (recordStakingReferral: any) => async (e: any) => {
        e.preventDefault();

        const { isIoPay } = this.props;
        const { isNative = isIoPay } = this.props;

        this.setState({ stepConfirming: true });
        if (isNative) {
          await this.launchNativeStaking(recordStakingReferral);
        } else {
          await this.launchStaking(recordStakingReferral);
        }

        this.setState({ stepConfirming: false });
      };

      async launchNativeStaking(recordStakingReferral: any) {
        const {
          isIoPay = false,
          nativeTokenContractAddr,
          tokenContract: tokenContractFn
        } = this.props;

        const tokenContract = isIoPay
          ? await getXAppTokenContract(
              NATIVE_TOKEN_ABI,
              nativeTokenContractAddr
            )
          : tokenContractFn(this.isFreshStaking(), this.bucket);
        await sleepPromise(3000); // FIXME: Remove this statement if the issue of getTokenContract function fixed
        const { stakeDuration, nonDecay, id, stakedAmount } = this.bucket;
        const canName = this.bucket.canNameHex();
        const amount = toRau(stakedAmount, "Iotx");
        const data = {
          gasLimit: DEFAULT_STAKING_GAS_LIMIT,
          gasPrice: toRau("1", "Qev"),
          amount
        };

        try {
          if (this.isFreshStaking()) {
            this.txHash = await tokenContract.methods.createPygg(
              canName,
              stakeDuration,
              Number(nonDecay), // FIXME: report 'failed to rawEncode: Error: Argument is not a number' error, if not transform to number explicitly
              "0",
              data
            );

            recordStakingReferral({
              variables: {
                stakingReferralInput: {
                  referralEthAddr: this.ioAddress,
                  txHash: this.txHash
                }
              }
            });
          } else {
            this.txHash = await tokenContract.methods.restake(
              id,
              stakeDuration,
              Number(nonDecay),
              "0x0",
              data
            );
          }
          window.console.log(`create native staking: ${this.txHash}`);
          this.setState({ step: SUCCESS_STEP });
        } catch (err) {
          window.console.error(`failed to make transaction: ${err.stack}`);
        }
      }

      async launchStaking(recordStakingReferral: any) {
        const {
          stakingContract,
          tokenContract: tokenContractFn,
          addr,
          stakingContractAddr
        } = this.props;
        const tokenContract = tokenContractFn(
          this.isFreshStaking(),
          this.bucket
        );

        try {
          if (this.isFreshStaking()) {
            // create a new bucket
            const stakingAmountWei = this.bucket.stakedAmountWei();
            const allowance = await tokenContract.allowance(
              addr,
              stakingContractAddr,
              { from: addr }
            );
            const allowanceWei = allowance[0];
            window.console.log(
              `tokenContract.allowance(addr, stakingContractAddr, {from: ${addr}}): ${allowanceWei}`
            );
            if (stakingAmountWei.comparedTo(allowanceWei) > 0) {
              const tx = await tokenContract.approve(
                stakingContractAddr,
                stakingAmountWei,
                {
                  from: addr,
                  gas: 60000
                }
              );
              window.console.log(
                `tokenContract.approve(${stakingContractAddr ||
                  ""}, ${stakingAmountWei}) => ${tx}`
              );
            }
            this.txHash = await stakingContract.createBucket(
              this.bucket.canNameHex(),
              this.bucket.stakedAmountWei(),
              this.bucket.stakeDuration,
              this.bucket.nonDecay,
              "0x0",
              { from: addr, gas: 300000 }
            );

            recordStakingReferral({
              variables: {
                stakingReferralInput: {
                  referralEthAddr: addr,
                  txHash: this.txHash
                }
              }
            });
            window.console.log("createBucket txHash", this.txHash);
          } else {
            // revote from existing bucket
            window.console.log("Received values of Revote form: ", {
              revoteBucketId: this.bucket.id,
              revoteCanName: this.bucket.canName
            });

            this.txHash = await stakingContract.revote(
              this.bucket.id,
              encodeCandidateHexName(this.bucket.canName || ""),
              "0x0",
              { from: addr, gas: 100000 }
            );
          }
          this.setState({ step: SUCCESS_STEP });
          // vote suceess to earn 10 emeralds
          earnEmeraldsForVoting();
        } catch (err) {
          window.console.error(`failed to make transaction: ${err.stack}`);
        }
      }

      isFreshStaking(): boolean {
        return (
          !this.isExistingBucket ||
          this.state.votingSource === "VOTING_FROM_WALLET"
        );
      }

      async componentDidMount() {
        const { isIoPay = false } = this.props;
        const {
          tokenContract: tokenContractFn,
          isNative = isIoPay
        } = this.props;
        const tokenContract = tokenContractFn(
          this.isFreshStaking(),
          this.bucket
        );

        await enableEthereum();

        if (isNative) {
          this.ioAddress = isIoPay
            ? await getIoAddressFromIoPay()
            : await getIoAddressFromRemote();
          const iotxBalance = await getIotxBalance(this.ioAddress);
          this.setState({ iotxBalance });
        } else {
          const balance = await tokenContract.balanceOf(
            window.web3.eth.accounts[0]
          );

          if (balance && balance[0]) {
            this.setState({
              iotxBalance: WeiToTokenValue(balance[0].toString())
            });
          }
        }
      }

      constructor(props: any) {
        super(props);
        this.state = {
          visible: false,
          step: "",
          currentStakeAmount: 0,
          currentStakeDuration: 0,
          votingSource: "VOTING_FROM_WALLET",
          stepConfirming: false,
          iotxBalance: 0,
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
          actionSmartContractCalled(true);
        }
        this.setState({ visible: false, step: undefined });
        if (this.props.requestDismiss) {
          this.props.form.resetFields();
          this.props.requestDismiss();
        }
      };

      handleConfirmation = (e: any) => {
        e.preventDefault();
        if (!this.state.canName.validateStatus) {
          this.handleCanNameChange(this.state.canName.value);
        }
        this.props.form.validateFields(async (err, values: TNewStake) => {
          if (!err && !this.state.canName.errorMsg) {
            window.console.log("Received values of form: ", {
              ...values,
              canName: this.state.canName.value
            });
            const { nonDecay, stakeDuration, stakedAmount, id } =
              this.bucket || {};
            this.bucket = Bucket.fromFormInput(
              values.canName || this.state.canName.value,
              values.nonDecay || nonDecay || false,
              values.stakeDuration || stakeDuration || 0,
              values.stakedAmount || stakedAmount || 0,
              id
            );
            this.setState({ step: CONFIRM_STEP });
          }
        });
      };
      handleSuccess = (e: any) => {
        e.preventDefault();
        this.handleCancel();
      };
      handleRadioChange = (e: any) => {
        this.setState({ votingSource: e.target.value });
        if (e.target.value === "VOTING_FROM_WALLET") {
          delete this.bucket;
        }
      };
      handleSelectChange = (value: any) => {
        const { stakedAmount, stakeDuration } = value;
        this.bucket = value;
        this.setState({
          currentStakeDuration: stakeDuration,
          currentStakeAmount: stakedAmount
        });
      };
      handleRevote = (bucket: Bucket) => {
        this.bucket = bucket;
        this.isExistingBucket = true;
        this.setState({
          currentStakeAmount: bucket.stakedAmount,
          currentStakeDuration: bucket.stakeDuration
        });
      };
      handleReEdit = (e: any) => {
        e.preventDefault();
        this.setState({ step: "" });
        if (this.state.votingSource === "VOTING_FROM_WALLET") {
          window.setTimeout(() => {
            this.props.form.setFieldsValue({
              nonDecay: this.bucket.nonDecay,
              stakeDuration: this.bucket.stakeDuration,
              stakedAmount: this.bucket.stakedAmount
            });
          }, 0);
        }
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
                <Icon type="snippets" style={{ marginRight: "17px" }} />
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

      handleCanNameChange = (value: any) => {
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

      handleDurationChange(number: any) {
        this.setState({ currentStakeDuration: number });
        if (!number) {
          this.props.form.setFieldsValue({
            nonDecay: false
          });
        }
      }

      getFooter = (recordStakingReferral: any) => {
        const { isIoPay } = this.props;
        const {
          disableModal,
          currentCandidate,
          isNative = isIoPay
        } = this.props;

        switch (this.state.step) {
          case SUCCESS_STEP:
            return [
              !disableModal && (
                <Button key="back" onClick={this.handleCancel}>
                  {t("name_registration.cancel")}
                </Button>
              ),
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
              // $FlowFixMe
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
                  {t(
                    isNative
                      ? "my_stake.on_process_native_confirmation"
                      : "my_stake.on_process_confirmation"
                  )}
                </Confirmation>
              )
            ];
        }
      };

      renderSteps() {
        const { isIoPay = false } = this.props;
        const {
          form,
          isNative = isIoPay,
          tokenContract: tokenContractFn,
          siteUrl = ""
        } = this.props;
        const tokenContract = tokenContractFn(
          this.isFreshStaking(),
          this.bucket
        );
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
                isNative={isNative}
              />
            );
          case SUCCESS_STEP:
            return <SuccessStep txHash={this.txHash} siteUrl={siteUrl} />;
          default:
            return (
              <Form layout={"vertical"}>
                <Form.Item
                  {...formItemLayout}
                  label={
                    <FormItemText
                      text={t("my_stake.canName")}
                      sub={t("my_stake.canName_tint")}
                    />
                  }
                  style={CommonMarginBottomStyle}
                  required={true}
                  validateStatus={this.state.canName.validateStatus}
                  help={this.state.canName.errorMsg}
                >
                  <Query ssr={false} query={GET_ALL_CANDIDATE}>
                    {({ data }: any) => {
                      const bpCandidates = {};
                      const allCandidates =
                        (data && data.bpCandidatesOnContract) || [];
                      if (data && Array.isArray(data.bpCandidates)) {
                        data.bpCandidates.forEach(i => {
                          if (i.status && i.status !== "UNQUALIFIED") {
                            bpCandidates[i.registeredName] = i;
                          }
                        });
                      }
                      const dataSource = allCandidates
                        .map(item => {
                          const delegateName = get(
                            bpCandidates[item.name],
                            "name",
                            ""
                          );
                          const displayName = delegateName
                            ? `${item.name} - ${delegateName}`
                            : item.name;
                          return { text: displayName, value: item.name };
                        })
                        .filter(item => Boolean(item.value));
                      return (
                        <AutoComplete
                          defaultValue={this.state.canName.value}
                          onChange={this.handleCanNameChange}
                          size="large"
                          disabled={Boolean(this.props.registeredName)}
                          dataSource={dataSource}
                          filterOption={(inputValue, option) =>
                            String(get(option, "props.children"))
                              .toLowerCase()
                              .indexOf(inputValue.toLowerCase()) !== -1
                          }
                        />
                      );
                    }}
                  </Query>
                  <span style={subTextStyle}>
                    {t("my_stake.change_anytime")}
                  </span>
                </Form.Item>
                <Form.Item {...formItemLayout} style={CommonMarginBottomStyle}>
                  <Radio.Group
                    value={votingSource}
                    onChange={this.handleRadioChange}
                  >
                    <Radio value="VOTING_FROM_WALLET">
                      {t("voting.vote.from.wallet")}
                    </Radio>
                    <Radio
                      value="VOTING_FROM_EXISTING"
                      style={{ marginTop: 8 }}
                    >
                      {t("voting.vote.existing.bucket")}
                    </Radio>
                  </Radio.Group>
                </Form.Item>
                {votingSource === "VOTING_FROM_WALLET" ? (
                  <StakeAndVoteNew
                    handleSelectChange={it => this.handleSelectChange(it)}
                    handleDurationChange={it => this.handleDurationChange(it)}
                    iotxBalance={this.state.iotxBalance}
                    form={form}
                    currentStakeDuration={currentStakeDuration}
                    currentStakeAmount={currentStakeAmount}
                    handleStakedAmountChange={it =>
                      this.setState({ currentStakeAmount: it })
                    }
                    isNative={isNative}
                  />
                ) : (
                  <StakeAndVoteExisting
                    handleRevote={bucket => this.handleRevote(bucket)}
                    form={form}
                    currentStakeDuration={currentStakeDuration}
                    currentStakeAmount={currentStakeAmount}
                    defaultValue={this.bucket && this.bucket.id}
                    isNative={isNative}
                    tokenContract={tokenContract}
                  />
                )}
              </Form>
            );
        }
      }

      render() {
        const {
          forceDisplayModal,
          displayOthers = false,
          disableModal
        } = this.props;
        return (
          <Mutation mutation={RECORD_STAKING_REFERRAL}>
            {recordStakingReferral => {
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
                        <Icon type="plus" /> {t("my_stake.new_vote")}
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
  )
);
