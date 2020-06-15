// @flow
/* eslint-disable no-invalid-this,no-unused-vars */
import React from "react";
// $FlowFixMe
import { assetURL } from "onefx/lib/asset-url";
import { Avatar, Popover } from "antd";
import { t } from "onefx/lib/iso-i18n";
import isBrowser from "is-browser";
// @ts-ignore
import JsonGlobal from "safe-json-globals/get";
import { colors } from "../common/styles/style-color2";
import { Image } from "../common/image";
import { MinusOutlined, ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";

export function renderDelegateName(text: any, record: any, _index: any) {
  return (
    <a href={`/delegate/${record.id}`} style={{ display: "flex" }}>
      <Image
        src={record.logo}
        resizeWidth={32}
        width={"32px"}
        height={"32px"}
      />
      <div
        style={{
          paddingLeft: "1em",
          color: colors.PRODUCING,
          fontWeight: "bold",
          lineHeight: 1.36
        }}
      >
        <div>{text}</div>
        {/* Todo change to name for voting */}
        <div
          style={{
            fontSize: "12px",
            color: "#999",
            fontWeight: "normal",
            paddingTop: "5px"
          }}
        >
          {record.registeredName}
        </div>
      </div>
    </a>
  );
}

const state = isBrowser && JsonGlobal("state");
const ENABLE_DETAILED_STATUS =
  state && state.base && state.base.enableDetailedServerStatus;

export function renderStatus(_text: any, record: any, _index: any) {
  const status = record.status ? record.status : "UNQUALIFIED";
  const serverStatus = record.serverStatus
    ? record.serverStatus
    : "NOT_EQUIPPED";
  return (
    <Popover
      content={
        <p
          dangerouslySetInnerHTML={{ __html: t("candidates.election.explain") }}
        />
      }
      trigger="hover"
    >
      {ENABLE_DETAILED_STATUS ? (
        <div style={{ cursor: "pointer" }}>
          <Avatar
            shape="square"
            size={14}
            src={assetURL(`/bpStatus/${serverStatus}.png`)}
          />
          <span style={{ padding: "0.5em" }}>
            {t(`candidates.election.${serverStatus}`)}
          </span>
        </div>
      ) : (
        <div style={{ cursor: "pointer" }}>
          <Avatar
            shape="square"
            size={14}
            style={{ backgroundColor: colors[status as keyof(typeof colors)] }}
          />
          <span style={{ padding: "0.5em" }}>
            {t(`candidates.election.${status}`)}
          </span>
        </div>
      )}
    </Popover>
  );
}

export function renderLiveVotes(text: any, record: any, _index: any) {
  let iconType = "minus";
  if (record.liveVotesDelta > 0) {
    iconType = "arrow-up";
  } else if (record.liveVotesDelta < 0) {
    iconType = "arrow-down";
  }

  let color = colors.black80;
  if (record.liveVotesDelta > 0) {
    color = colors.deltaUp;
  } else if (record.liveVotesDelta < 0) {
    color = colors.error;
  }

  return (
    <div>
      {
        <span style={{ padding: "0.5em" }}>
          {Math.abs(text).toLocaleString()}
        </span>
      }
      {
        iconType == 'minus' && <MinusOutlined style={{
          color,
          fontSize: "11px"
        }} />
      }
      {
        iconType == 'arrow-up' && <ArrowUpOutlined style={{
          color,
          fontSize: "11px"
        }} />
      }
      {
        iconType == 'arrow-down' && <ArrowDownOutlined style={{
          color,
          fontSize: "11px"
        }} />
      }
      <span
        style={{ padding: "0.5em", fontSize: "11px", color: colors.black80 }}
      >
        {Math.abs(record.liveVotesDelta).toLocaleString()}
      </span>
    </div>
  );
}

export function getIconType(url: string) {
  if (url.includes("twitter.com")) {
    return "twitter";
  } else if (url.includes("medium.com")) {
    return "medium";
  } else if (url.includes("linkedin.com")) {
    return "linkedin";
  } else if (url.includes("t.me")) {
    return "team";
  } else if (url.includes("reddit.com")) {
    return "reddit";
  } else if (url.includes("weibo.com")) {
    return "weibo";
  } else if (url.includes("facebook.com")) {
    return "facebook";
  }
  return "global";
}

export function getTwitterAccount(delegate: any) {
  if (delegate && delegate.socialMedia) {
    const twitterUrl = delegate.socialMedia.find((url: any) =>
      url.includes("twitter.com")
    );
    if (twitterUrl) {
      const matches = twitterUrl.match(
        /* eslint-disable no-useless-escape */
        /https?:\/\/(www\.)?twitter\.com\/(#!\/)?@?([^\/]*)/
      );
      if (matches && matches.length >= 4 && matches[3]) {
        return `@${matches[3]}`;
      }
    }
  }
  return "";
}

export function getCollapsesParams(data: any) {
  return [
    {
      key: "1",
      inputId: "introduction",
      type: "P",
      content: data.introduction,
      header: t("candidates.introduction")
    },
    {
      key: "2",
      inputId: "team",
      type: "P",
      content: data.team,
      header: t("candidates.team")
    },
    {
      key: "3",
      inputId: "techSetup",
      type: "P",
      content: data.techSetup,
      header: t("candidates.tech_setup")
    },
    {
      key: "4",
      inputId: "communityPlan",
      type: "P",
      content: data.communityPlan,
      header: t("candidates.community_plan")
    },
    {
      key: "5",
      inputId: "rewardPlan",
      type: "P",
      content: data.rewardPlan,
      header: t("candidates.reward_plan")
    }
  ];
}

export function convertToString(objQuery: any) {
  return Object.keys(objQuery)
    .map(key => `${key}=${encodeURIComponent(objQuery[key])}`)
    .join("&");
}
