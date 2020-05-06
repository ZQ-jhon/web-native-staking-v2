// @flow
import React from "react";

export const TWEET_WEB_INTENT_URL = "https://twitter.com/intent/tweet";

export const TwitterScriptSource = () => (
  <div className="share-section">
    <script
      async={true}
      src="https://platform.twitter.com/widgets.js"
      charSet="utf-8"
    />
  </div>
);

// tslint:disable-next-line:no-any
export function convertToString(objQuery: any): string {
  return Object.keys(objQuery)
    .map(key => `${key}=${encodeURIComponent(objQuery[key])}`)
    .join("&");
}

// tslint:disable-next-line:no-any
export function getTwitterAccount(delegate: any): string {
  if (delegate && delegate.socialMedia) {
    const twitterUrl = delegate.socialMedia.find((url: string) =>
      url.includes("twitter.com")
    );
    if (twitterUrl) {
      const matches = twitterUrl.match(
        /https?:\/\/(www\.)?twitter\.com\/(#!\/)?@?([^\/]*)/
      );
      if (matches && matches.length >= 4 && matches[3]) {
        return `@${matches[3]}`;
      }
    }
  }
  return "";
}
