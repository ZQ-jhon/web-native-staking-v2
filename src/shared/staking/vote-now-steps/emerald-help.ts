// @flow
import notification from "antd/lib/notification";
import axios from "axios";
// @ts-ignore
import window from "global/window";

// tslint:disable-next-line:no-any
export async function earnEmeraldsForVoting(): Promise<any> {
  const axiosInstance = axios.create({ timeout: 30000 });

  try {
    const res = await axiosInstance.post("/api-gateway/", {
      operationName: "earnEmeraldsForVoting",
      variables: {
        earnEmeraldsForVoting: true
      },
      query: `mutation earnEmeraldsForVoting($earnEmeraldsForVoting: Boolean) {
        earnEmeraldsForVoting(earnEmeraldsForVoting: $earnEmeraldsForVoting)
      }`
    });

    return res.data.data;
  } catch (e) {
    window.console.error(`failed to add emeralds for voting: ${e}`);
    notification.error({
      message: "Error",
      description: e.message,
      duration: 3
    });
    return false;
  }
}
