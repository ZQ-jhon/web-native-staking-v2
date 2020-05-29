/* eslint-disable no-invalid-this */
// @flow
import { Button, Input, Upload, InputNumber } from "antd";
// @ts-ignore
import window from "global/window";
import { Form, Icon } from "@ant-design/compatible";
import React, { Component } from "react";
import { connect } from "react-redux";
import { t } from "onefx/lib/iso-i18n";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
// $FlowFixMe
import { notification } from "antd";
import { TBpCandidate } from "../../types/global";
import { ImageIcon } from "../common/icon";
import { upload } from "../common/upload";
import { ProfileView } from "./profile-view";

type Props = {
  data: TBpCandidate;
  form: any;
};
type State = {
  visible: boolean;
  loading: boolean;
  logo: string;
  bannerUrl: string;
  showInsertFormat: boolean;
};
const UPSERT_BP_CANDIDATE = gql`
  mutation upsertBpCandidate($bpCandidateInput: BpCandidateInput!) {
    upsertBpCandidate(bpCandidateInput: $bpCandidateInput) {
      id
      name
      blurb
      website
      logo
      bannerUrl
      socialMedia
      location
      introduction
      team
      techSetup
      communityPlan
      rewardPlan
    }
  }
`;

//@ts-ignore
const validateUrls = (rule, value, callback) => {
  const str = String(value);
  const strs = str.split(" ");
  const reg = new RegExp(
    "^(?:(?:http|https)://|//)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$",
    "i"
  );
  for (const s of strs) {
    if (!reg.test(s)) {
      callback(t("profile.invalid_url", { value: s }));
    }
  }
  callback();
};

// $FlowFixMe
export const CandidateForm = connect()(
  // $FlowFixMe
  Form.create({ name: "candidate-form" })(
    class CandidateForm extends Component<Props, State> {
      props: Props;
      state: State;

      constructor(props: Props) {
        super(props);
        this.state = {
          visible: false,
          loading: false,
          logo: "",
          bannerUrl: "",
          showInsertFormat: false
        };
      }

      onSubmit = (upsertBpCandidate: any) => (e: any) => {
        const { data } = this.props;

        e.preventDefault();
        //@ts-ignore
        this.props.form.validateFields(async (err, values) => {
          if (!err) {
            window.console.log("Received values of Candidate form: ", values);

            // $FlowFixMe
            const prevData = { ...data };
            delete prevData.category;
            this.setState({ loading: true });
            // update profile
            upsertBpCandidate({
              variables: {
                bpCandidateInput: {
                  id: prevData.id,
                  name: prevData.name,
                  blurb: prevData.blurb,
                  website: prevData.website,
                  logo: prevData.logo,
                  bannerUrl: prevData.bannerUrl,
                  location: prevData.location,
                  introduction: prevData.introduction,
                  team: prevData.team,
                  techSetup: prevData.techSetup,
                  communityPlan: prevData.communityPlan,
                  rewardPlan: prevData.rewardPlan,
                  annualReward: prevData.annualReward,
                  ...values,
                  socialMedia: values.socialMedia.split(" ")
                }
              }
            })
              .then(() => {
                this.setState({ loading: false });
                // scroll to top
                // $FlowFixMe
                window.document.documentElement.scrollTop = window.document.body.scrollTop = 0;
                // show success notification
                notification.success({
                  message: t("profile.change_saved")
                });
              })
              .catch((err: any) => {
                // server error
                this.setState({ loading: false });
                notification.error({
                  message: `${t("profile.change_not_saved")}: ${err}`
                });
              });
          }
        });
      };

      // click preview button
      preview = () => {
        this.setState({ visible: true });
      };

      handleCloseModal = () => {
        this.setState({ visible: false });
      };

      handleClickInsertFormat = (e: any, rewardPlan: any) => {
        e.preventDefault();
        const { showInsertFormat } = this.state;
        rewardPlan = showInsertFormat
          ? rewardPlan
          : t("profile.reward_plan.recomendFormat");
        this.props.form.setFieldsValue({ rewardPlan });
        this.setState({ showInsertFormat: !showInsertFormat });
      };

      beforeUpload = (file: any, title: any) => {
        return upload(file, title).then(data => {
          // @ts-ignore
          this.setState({ [title]: data.secure_url });
          const { form } = this.props;
          form.setFieldsValue({
            [title]: data.secure_url
          });
          return Promise.reject();
        });
      };

      render() {
        const { getFieldDecorator } = this.props.form;
        const { showInsertFormat } = this.state;

        return (
          // @ts-ignore
          <Mutation mutation={UPSERT_BP_CANDIDATE}>
            {(upsertBpCandidate: any, resp: any) => {
              const data =
                (resp && resp.data && resp.data.upsertBpCandidate) ||
                this.props.data;
              const logo = this.state.logo || data.logo;
              const bannerUrl = this.state.bannerUrl || data.bannerUrl;

              return (
                <Form
                  onSubmit={this.onSubmit(upsertBpCandidate)}
                  style={{ padding: "1em" }}
                >
                  <h1>{t("profile.profile")}</h1>

                  {getFieldDecorator("id", {
                    initialValue: data.id
                  })(<input name="id" type="hidden" />)}

                  <Form.Item label={t("profile.name")}>
                    {getFieldDecorator("name", {
                      initialValue: data.name,
                      rules: [
                        {
                          required: true,
                          message: t("profile.name.required")
                        }
                      ]
                    })(<Input />)}
                  </Form.Item>

                  <Form.Item label={t("profile.blurb")}>
                    {getFieldDecorator("blurb", {
                      initialValue: data.blurb,
                      rules: [
                        {
                          required: true,
                          message: t("profile.blurb.required")
                        }
                      ]
                    })(<Input />)}
                  </Form.Item>

                  <Form.Item label={t("profile.website")}>
                    {getFieldDecorator("website", {
                      initialValue: data.website,
                      rules: [
                        {
                          required: true,
                          message: t("profile.website.required")
                        },
                        { validator: validateUrls }
                      ]
                    })(<Input />)}
                  </Form.Item>

                  <Form.Item label={t("profile.logo")}>
                    {getFieldDecorator("logo", {
                      initialValue: logo,
                      rules: [
                        {
                          required: true,
                          message: t("profile.logo.required")
                        }
                      ]
                    })(<Input hidden={true} />)}
                    <Upload
                      beforeUpload={file => this.beforeUpload(file, "logo")}
                    >
                      {logo ? (
                        <ImageIcon url={logo} width={"auto"} height={"35px"} />
                      ) : (
                        <Button>
                          <Icon type="upload" /> Click to Upload
                        </Button>
                      )}
                    </Upload>
                  </Form.Item>

                  <Form.Item label={t("profile.banner_url")}>
                    {getFieldDecorator("bannerUrl", {
                      initialValue: bannerUrl,
                      rules: [
                        {
                          required: true,
                          message: t("profile.banner_url.required")
                        }
                      ]
                    })(<Input hidden={true} />)}
                    <Upload
                      beforeUpload={file =>
                        this.beforeUpload(file, "bannerUrl")
                      }
                    >
                      {bannerUrl ? (
                        <img
                          alt="logo"
                          style={{ width: "50%", cursor: "pointer" }}
                          src={bannerUrl}
                        />
                      ) : (
                        <Button>
                          <Icon type="upload" /> Click to Upload
                        </Button>
                      )}
                    </Upload>
                  </Form.Item>

                  <Form.Item label={t("profile.annual_reward")}>
                    {getFieldDecorator("annualReward", {
                      initialValue: data.annualReward,
                      rules: [
                        {
                          required: true,
                          message: t("profile.annual_reward.required")
                        }
                      ]
                    })(<InputNumber step={0.1} />)}
                  </Form.Item>

                  <Form.Item label={t("profile.social_media")}>
                    {getFieldDecorator("socialMedia", {
                      initialValue: (data.socialMedia || []).join(" "),
                      rules: [
                        {
                          required: true,
                          message: t("profile.social_media.required")
                        },
                        { validator: validateUrls }
                      ]
                    })(<Input />)}
                  </Form.Item>

                  <Form.Item label={t("profile.location")}>
                    {getFieldDecorator("location", {
                      initialValue: data.location,
                      rules: [
                        {
                          required: true,
                          message: t("profile.location.required")
                        }
                      ]
                    })(<Input />)}
                  </Form.Item>

                  <Form.Item label={t("profile.introduction")}>
                    {getFieldDecorator("introduction", {
                      initialValue: data.introduction,
                      rules: [
                        {
                          required: true,
                          message: t("profile.introduction.required")
                        }
                      ]
                    })(<Input.TextArea rows={4} />)}
                  </Form.Item>

                  <Form.Item label={t("profile.team")}>
                    {getFieldDecorator("team", {
                      initialValue: data.team,
                      rules: [
                        {
                          required: true,
                          message: t("profile.team.required")
                        }
                      ]
                    })(<Input.TextArea rows={4} />)}
                  </Form.Item>

                  <Form.Item label={t("profile.tech_setup")}>
                    {getFieldDecorator("techSetup", {
                      initialValue: data.techSetup,
                      rules: [
                        {
                          required: true,
                          message: t("profile.tech_setup.required")
                        }
                      ]
                    })(<Input.TextArea rows={4} />)}
                  </Form.Item>

                  <Form.Item label={t("profile.community_plan")}>
                    {getFieldDecorator("communityPlan", {
                      initialValue: data.communityPlan,
                      rules: [
                        {
                          required: true,
                          message: t("profile.community_plan.required")
                        }
                      ]
                    })(<Input.TextArea rows={4} />)}
                  </Form.Item>
                  <Form.Item
                    colon={false}
                    label={
                      <span>
                        <span>{t("profile.reward_plan")}:</span>
                        <a
                          style={{ marginLeft: 20 }}
                          onClick={e =>
                            this.handleClickInsertFormat(e, data.rewardPlan)
                          }
                        >
                          {showInsertFormat
                            ? t("profile.reward_plan.insertCancel")
                            : t("profile.reward_plan.insertFormat")}
                        </a>
                      </span>
                    }
                  >
                    {getFieldDecorator("rewardPlan", {
                      initialValue: data.rewardPlan,
                      rules: [
                        {
                          required: true,
                          message: t("profile.reward_plan.required")
                        }
                      ]
                    })(<Input.TextArea rows={6} />)}
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      style={{ marginRight: "10px" }}
                      loading={this.state.loading}
                      onClick={this.onSubmit(upsertBpCandidate)}
                    >
                      {t("profile.update")}
                    </Button>
                    <Button onClick={this.preview}>
                      {t("profile.preview")}
                    </Button>
                  </Form.Item>
                  <ProfileView
                    data={data}
                    visible={this.state.visible}
                    handleCloseModal={this.handleCloseModal}
                  />
                </Form>
              );
            }}
          </Mutation>
        );
      }
    }
  )
);
