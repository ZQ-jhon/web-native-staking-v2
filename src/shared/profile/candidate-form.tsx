/* eslint-disable no-invalid-this */
// @flow
import { Button, Input, Upload, InputNumber, Form } from "antd";
// @ts-ignore
import window from "global/window";
import React, { useState } from "react";
import { t } from "onefx/lib/iso-i18n";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
// $FlowFixMe
import { notification } from "antd";
import { TBpCandidate } from "../../types/global";
import { ImageIcon } from "../common/icon";
import { upload } from "../common/upload";
import { ProfileView } from "./profile-view";
import { UploadOutlined } from "@ant-design/icons";
import { connect } from "react-redux";

type Props = {
  data: TBpCandidate;
  form: any;
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
const CandidateFormInner = (props: Props) => {
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [logo, setLogo] = useState('')
  const [bannerUrl, setBannerUrl] = useState('')
  const [showInsertFormat, setShowInsertFormat] = useState(false)
  const [form] = Form.useForm();



  const onSubmit = (upsertBpCandidate: any) => (e: any) => {
    const { data } = props;

    e.preventDefault();
    //@ts-ignore

    form.validateFields().then(values => {
      const prevData = { ...data };
        delete prevData.category;
        setLoading(true);
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
              socialMedia: values.socialMedia.split(" "),
            },
          },
        })
          .then(() => {
            setLoading(false);
            // scroll to top
            // $FlowFixMe
            window.document.documentElement.scrollTop = window.document.body.scrollTop = 0;
            // show success notification
            notification.success({
              message: t("profile.change_saved"),
            });
          })
          .catch((err: any) => {
            // server error
            setLoading(false);
            notification.error({
              message: `${t("profile.change_not_saved")}: ${err}`,
            });
          });
    }).catch(errInfo => {
      console.log(errInfo)
    })
  };

  // click preview button
  const preview = () => {
    setVisible(true);
  };

  const handleCloseModal = () => {
    setVisible(false);
  };

  const handleClickInsertFormat = (e: any, rewardPlan: any) => {
    e.preventDefault();
    rewardPlan = showInsertFormat
      ? rewardPlan
      : t("profile.reward_plan.recomendFormat");
    form.setFieldsValue({ rewardPlan });
    setShowInsertFormat(!showInsertFormat)
  };

  const beforeUpload = (file: any, title: any) => {
    return upload(file, title).then((data) => {
      // @ts-ignore
      if (title === 'logo'){
        setLogo(data.secure_url)
      }
      else {
        setBannerUrl(data.secure_url) 
      }
      form.setFieldsValue({
        [title]: data.secure_url,
      });
      return Promise.reject();
    });
  };

  return (
    // @ts-ignore
    <Mutation mutation={UPSERT_BP_CANDIDATE}>
      {(upsertBpCandidate: any, resp: any) => {
        const data =
          (resp && resp.data && resp.data.upsertBpCandidate) ||
          props.data;

        return (
          //@ts-ignore
          <Form
            form={form}
            layout='vertical'
            name="candidate-form"
            onSubmit={onSubmit(upsertBpCandidate)}
          >
            <h1>{t("profile.profile")}</h1>
              
            <Form.Item 
                initialValue={data.id} noStyle
              >
              <Input name="id" type="hidden" />
            </Form.Item>

            <Form.Item name='name' label={t("profile.name")} initialValue={data.name} rules={[
                  {
                    required: true,
                    message: t("profile.name.required"),
                  },
                ]} >
                <Input />
            </Form.Item>

            <Form.Item label={t("profile.blurb")}
                name='blurb'
                initialValue={data.blurb}
                rules={[
                  {
                    required: true,
                    message: t("profile.blurb.required"),
                  },
                ]}
              >
              <Input />
            </Form.Item>

            <Form.Item label={t("profile.website")}
              initialValue={data.website}
              rules={[
                {
                  required: true,
                  message: t("profile.website.required"),
                },
                { validator: validateUrls },
              ]}>
              <Input />
            </Form.Item>

            <Form.Item label={t("profile.logo")}
              name='logo'
              initialValue={logo || data.logo}
              rules={[
                {
                  required: true,
                  message: t("profile.logo.required"),
                },
              ]}>
              <Input hidden={true} />
              <Upload
                beforeUpload={(file) => beforeUpload(file, "logo")}
              >
                {(logo || data.logo) ? (
                  <ImageIcon url={logo || data.logo} width={"auto"} height={"35px"} />
                ) : (
                  <Button>
                    <UploadOutlined /> Click to Upload
                  </Button>
                )}
              </Upload>
            </Form.Item>

            <Form.Item label={t("profile.banner_url")}
              name='bannerUrl'
                initialValue={bannerUrl || data.bannerUrl}
                rules={[
                  {
                    required: true,
                    message: t("profile.banner_url.required"),
                  },
                ]}
              ><Input hidden={true} />
              <Upload
                beforeUpload={(file) =>
                  beforeUpload(file, "bannerUrl")
                }
              >
                {(bannerUrl || data.bannerUrl) ? (
                  <img
                    alt="logo"
                    style={{ width: "50%", cursor: "pointer" }}
                    src={bannerUrl || data.bannerUrl}
                  />
                ) : (
                  <Button>
                    <UploadOutlined /> Click to Upload
                  </Button>
                )}
              </Upload>
            </Form.Item>

            <Form.Item label={t("profile.annual_reward")}
              name="annualReward"
              initialValue={data.annualReward}
              rules={[
                {
                  required: true,
                  message: t("profile.annual_reward.required"),
                },
              ]}>
              <InputNumber step={0.1} />
            </Form.Item>

            <Form.Item label={t("profile.social_media")} 
              name="socialMedia"
                initialValue={(data.socialMedia || []).join(" ")}
                rules={[
                  {
                    required: true,
                    message: t("profile.social_media.required"),
                  },
                  { validator: validateUrls },
                ]
              }><Input />
            </Form.Item>

            <Form.Item label={t("profile.location")} 
                initialValue={data.location}
                rules={[
                  {
                    required: true,
                    message: t("profile.location.required"),
                  },
                ]
              }><Input />
            </Form.Item>

            <Form.Item label={t("profile.introduction")}
              name="introduction"
                initialValue={data.introduction}
                rules={[
                  {
                    required: true,
                    message: t("profile.introduction.required"),
                  },
                ]}><Input.TextArea rows={4} />
            </Form.Item>

            <Form.Item label={t("profile.team")}
            name="team"
                initialValue={data.team}
                rules={[
                  {
                    required: true,
                    message: t("profile.team.required"),
                  },
                ]
              }><Input.TextArea rows={4} />
            </Form.Item>

            <Form.Item label={t("profile.tech_setup")}
            name="techSetup"
                initialValue={data.techSetup}
                rules={[
                  {
                    required: true,
                    message: t("profile.tech_setup.required"),
                  },
                ]
              }><Input.TextArea rows={4} />
            </Form.Item>

            <Form.Item label={t("profile.community_plan")}
            name="communityPlan"
                initialValue={data.communityPlan}
                rules={[
                  {
                    required: true,
                    message: t("profile.community_plan.required"),
                  },
                ]
              }><Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item
              colon={false}
              label={
                <span>
                  <span>{t("profile.reward_plan")}:</span>
                  <a
                    style={{ marginLeft: 20 }}
                    onClick={(e) =>
                      handleClickInsertFormat(e, data.rewardPlan)
                    }
                  >
                    {showInsertFormat
                      ? t("profile.reward_plan.insertCancel")
                      : t("profile.reward_plan.insertFormat")}
                  </a>
                </span>
              }
            
            name=  "rewardPlan"
                initialValue={data.rewardPlan}
                rules={[
                  {
                    required: true,
                    message: t("profile.reward_plan.required"),
                  },
                ]
              }><Input.TextArea rows={6} />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                style={{ marginRight: "10px" }}
                loading={loading}
                onClick={onSubmit(upsertBpCandidate)}
              >
                {t("profile.update")}
              </Button>
              <Button onClick={preview}>
                {t("profile.preview")}
              </Button>
            </Form.Item>
            <Form.Item>
              <ProfileView
                data={data}
                visible={visible}
                handleCloseModal={handleCloseModal}
              />
            </Form.Item>
          </Form>
        );
      }}
    </Mutation>
  );
}

export const CandidateForm = connect()(CandidateFormInner)