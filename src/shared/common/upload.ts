// @flow
// $FlowFixMe
import { message } from "antd";
import axios from "axios";
// @ts-ignore
import window from "global/window";
import { t } from "onefx/lib/iso-i18n";

const uploadConfig = {
  cloud_name: "dd47adfyb",
  upload_preset: "fs94iyc4",
  url: "https://api.cloudinary.com/v1_1/dd47adfyb/upload"
};
export const upload = (
  // tslint:disable-next-line:no-any
  file: any,
  // tslint:disable-next-line:no-any
  title: any,
  // tslint:disable-next-line:no-any
  sizeLimit: any = 500
): Promise<{}> => {
  const fileSizeLimit = file.size / 1024 < sizeLimit;
  if (!fileSizeLimit) {
    message.error(`${t("upload.limit")} ${sizeLimit}KB!`);
    return Promise.reject();
  }
  const formData = new window.FormData();
  formData.append("upload_preset", uploadConfig.upload_preset);
  formData.append("file", file);
  formData.append("multiple", "false");
  formData.append("tags", title ? `myphotoalbum,${title}` : "myphotoalbum");
  formData.append("context", title ? `photo=${title}` : "");
  return axios.post(uploadConfig.url, formData).then(({ data }) => data);
};
