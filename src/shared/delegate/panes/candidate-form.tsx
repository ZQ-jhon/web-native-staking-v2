import UploadOutlined from "@ant-design/icons/UploadOutlined";
import Button from "antd/lib/button";
import Form, { FormInstance } from "antd/lib/form";
import Input from "antd/lib/input";
import InputNumber from "antd/lib/input-number";
import notification from "antd/lib/notification";
import Upload from "antd/lib/upload";
// @ts-ignore
import window from "global/window";
import gql from "graphql-tag";
import { t } from "onefx/lib/iso-i18n";
import React, { RefObject } from "react";
import { Component } from "react";
import { Mutation } from "react-apollo";
import { connect } from "react-redux";
import { TBpCandidate } from "../../../types";
import { ImageIcon } from "../../common/icon";
import { upload } from "../../common/upload";

type Props = {
  data: TBpCandidate;
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

const validateUrls = (_: void, value: string, callback: Function) => {
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

    formRef: RefObject<FormInstance> = React.createRef<FormInstance>();

    onSubmit = (
      // tslint:disable-next-line:no-any
      upsertBpCandidate: any
    ) => async (
      // tslint:disable-next-line:no-any
      e: any
    ) => {
      const { data } = this.props;

      e.preventDefault();
      if (!this.formRef.current) {
        return;
      }

      try {
        const values = await this.formRef.current.validateFields();
        window.console.log("Received values of Candidate form: ", values);

        // $FlowFixMe
        const prevData = { ...data };
        // @ts-ignore
        delete prevData.__typename;
        this.setState({ loading: true });
        // update profile
        await upsertBpCandidate({
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
        });
        this.setState({ loading: false });
        // scroll to top
        // $FlowFixMe
        window.document.documentElement.scrollTop = window.document.body.scrollTop = 0;
        // show success notification
        notification.success({
          message: t("profile.change_saved")
        });
      } catch (err) {
        this.setState({ loading: false });
        notification.error({
          message: `${t("profile.change_not_saved")}.`
        });
      }
    };

    // click preview button
    preview = () => {
      this.setState({ visible: true });
    };

    handleCloseModal = () => {
      this.setState({ visible: false });
    };

    // tslint:disable-next-line:no-any
    handleClickInsertFormat = (e: any, rewardPlan: any) => {
      e.preventDefault();
      const { showInsertFormat } = this.state;
      const re = showInsertFormat
        ? rewardPlan
        : t("profile.reward_plan.recomendFormat");
      const form = this.formRef.current;
      if (!form) {
        return;
      }
      form.setFieldsValue({ rewardPlan: re });
      this.setState({ showInsertFormat: !showInsertFormat });
    };

    // tslint:disable-next-line:no-any
    beforeUpload = (file: any, title: any) => {
      // @ts-ignore
      return upload(file, title).then(data => {
        // @ts-ignore
        this.setState({ [title]: data.secure_url });
        const form = this.formRef.current;
        if (!form) {
          return;
        }
        form.setFieldsValue({
          // @ts-ignore
          [title]: data.secure_url
        });
        return Promise.reject();
      });
    };

    // tslint:disable-next-line:max-func-body-length
    public render(): JSX.Element {
      const { showInsertFormat } = this.state;

      return (
        <Mutation mutation={UPSERT_BP_CANDIDATE}>
          {// tslint:disable-next-line
          (upsertBpCandidate: any, resp: any) => {
            const data =
              (resp && resp.data && resp.data.upsertBpCandidate) ||
              this.props.data;
            const logo = this.state.logo || data.logo;
            const bannerUrl = this.state.bannerUrl || data.bannerUrl;

            return (
              // @ts-ignore
              <Form
                layout={"vertical"}
                onSubmit={this.onSubmit(upsertBpCandidate)}
                style={{ padding: "1em" }}
                ref={this.formRef}
              >
                <h1>{t("profile.profile")}</h1>
                {/*
                // @ts-ignore */}
                <Form.Item name={"id"} initialValue={data.id}>
                  <Input name="id" type="hidden" placeholder={""} />
                </Form.Item>

                {/*
                // @ts-ignore */}
                <Form.Item
                  label={t("profile.name")}
                  name={"name"}
                  initialValue={data.name}
                  rules={[
                    {
                      required: true,
                      message: t("my_stake.bucketId.required")
                    }
                  ]}
                >
                  <Input />
                </Form.Item>
                {/*
                // @ts-ignore */}
                <Form.Item
                  label={t("profile.blurb")}
                  name={"blurb"}
                  initialValue={data.blurb}
                  rules={[
                    {
                      required: true,
                      message: t("profile.blurb.required")
                    }
                  ]}
                >
                  <Input />
                </Form.Item>
                {/*
                // @ts-ignore */}
                <Form.Item
                  label={t("profile.website")}
                  name={"website"}
                  initialValue={data.website}
                  rules={[
                    {
                      required: true,
                      message: t("profile.website.required")
                    },
                    { validator: validateUrls }
                  ]}
                >
                  <Input />
                </Form.Item>
                {/*
                // @ts-ignore */}
                <Form.Item
                  label={t("profile.logo")}
                  name={"logo"}
                  initialValue={logo}
                  rules={[
                    {
                      required: true,
                      message: t("profile.logo.required")
                    }
                  ]}
                >
                  <Input hidden={true} />
                </Form.Item>
                <Upload beforeUpload={file => this.beforeUpload(file, "logo")}>
                  {logo ? (
                    <ImageIcon url={logo} width={"auto"} height={"35px"} />
                  ) : (
                    <Button>
                      <UploadOutlined /> Click to Upload
                    </Button>
                  )}
                </Upload>

                {/*
                // @ts-ignore */}
                <Form.Item
                  label={t("profile.banner_url")}
                  name={"bannerUrl"}
                  initialValue={bannerUrl}
                  rules={[
                    {
                      required: true,
                      message: t("profile.banner_url.required")
                    }
                  ]}
                >
                  <Input hidden={true} />
                </Form.Item>
                <Upload
                  beforeUpload={file => this.beforeUpload(file, "bannerUrl")}
                >
                  {bannerUrl ? (
                    <img
                      alt="logo"
                      style={{ width: "50%", cursor: "pointer" }}
                      src={bannerUrl}
                    />
                  ) : (
                    <Button>
                      <UploadOutlined /> Click to Upload
                    </Button>
                  )}
                </Upload>

                {/*
                // @ts-ignore */}
                <Form.Item
                  label={t("profile.annual_reward")}
                  name={"annualReward"}
                  initialValue={data.annualReward}
                  rules={[
                    {
                      required: true,
                      message: t("profile.annual_reward.required")
                    }
                  ]}
                >
                  <InputNumber step={0.1} />
                </Form.Item>
                {/*
                // @ts-ignore */}
                <Form.Item
                  label={t("profile.social_media")}
                  name={"socialMedia"}
                  initialValue={(data.socialMedia || []).join(" ")}
                  rules={[
                    {
                      required: true,
                      message: t("profile.social_media.required")
                    },
                    { validator: validateUrls }
                  ]}
                >
                  <Input />
                </Form.Item>
                {/*
                // @ts-ignore */}
                <Form.Item
                  label={t("profile.location")}
                  name={"location"}
                  initialValue={data.location}
                  rules={[
                    {
                      required: true,
                      message: t("profile.location.required")
                    }
                  ]}
                >
                  <Input />
                </Form.Item>
                {/*
                // @ts-ignore */}
                <Form.Item
                  label={t("profile.introduction")}
                  name={"introduction"}
                  initialValue={data.introduction}
                  rules={[
                    {
                      required: true,
                      message: t("profile.introduction.required")
                    }
                  ]}
                >
                  <Input.TextArea rows={4} />
                </Form.Item>
                {/*
                // @ts-ignore */}
                <Form.Item
                  label={t("profile.team")}
                  name={"team"}
                  initialValue={data.team}
                  rules={[
                    {
                      required: true,
                      message: t("profile.team.required")
                    }
                  ]}
                >
                  <Input.TextArea rows={4} />
                </Form.Item>
                {/*
                // @ts-ignore */}
                <Form.Item
                  label={t("profile.tech_setup")}
                  name={"techSetup"}
                  initialValue={data.techSetup}
                  rules={[
                    {
                      required: true,
                      message: t("profile.tech_setup.required")
                    }
                  ]}
                >
                  <Input.TextArea rows={4} />
                </Form.Item>
                {/*
                // @ts-ignore */}
                <Form.Item
                  label={t("profile.community_plan")}
                  name={"communityPlan"}
                  initialValue={data.communityPlan}
                  rules={[
                    {
                      required: true,
                      message: t("profile.community_plan.required")
                    }
                  ]}
                >
                  <Input.TextArea rows={4} />
                </Form.Item>
                {/*
                // @ts-ignore */}
                <Form.Item
                  colon={false}
                  label={
                    <span>
                      <span>{t("profile.reward_plan")}:</span>

                      {/* tslint:disable-next-line:react-a11y-anchors react-a11y-event-has-role */}
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
                  name={"rewardPlan"}
                  initialValue={data.rewardPlan}
                  rules={[
                    {
                      required: true,
                      message: t("profile.reward_plan.required")
                    }
                  ]}
                >
                  <Input.TextArea rows={6} />
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
                  <Button onClick={this.preview}>{t("profile.preview")}</Button>
                </Form.Item>
              </Form>
            );
          }}
        </Mutation>
      );
    }
  }
);
