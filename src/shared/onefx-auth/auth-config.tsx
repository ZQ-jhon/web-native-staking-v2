// @ts-ignore
import process from "global/process";
import { logger } from "onefx/lib/integrated-gateways/logger";
import config from "config";

let secret = process.env.AUTH_SECRET;
if (!secret) {
  logger.warn("no AUTH_SECRET in process.env");
  secret = "TODO this is not a secret";
}

export const authConfig = {
  cookieName: "web-bp:auth5",
  // @ts-ignore
  siteUrl: config.auth.siteUrl,
  cookieOpts: {
    // @ts-ignore
    domain: config.auth.cookieDomain,
    secure: false,
    httpOnly: true,
    signed: false
  },
  masterCookieName: "iotex_b",
  masterCookieOpts: {
    domain: ".iotex.io",
    secure: false,
    httpOnly: true,
    signed: false
  },
  masterDevToken: process.env.MASTER_DEV_TOKEN || "",
  masterSecret: process.env.MASTER_SECRET || "",
  ttl: 90, // days
  // @ts-ignore
  loginUrl: config.auth.loginUrl,
  // @ts-ignore
  logoutUrl: config.auth.logoutUrl,
  allowedLoginNext: ["/profile/", "/", "/settings/reset-password/"],
  allowedLogoutNext: [
    "/",
    "https://member.iotex.io/",
    "https://member.iotex.fun/",
    "https://member-testnet.iotex.io/"
  ],
  secret,
  emailTokenTtl: 5, // mins
  emailTokenLink:
    String(process.env.NODE_ENV).indexOf("production") === -1
      ? "http://localhost:5004/email-token/"
      : "https://example.com/email-token/",
  mailgun: {
    apiKey: "TODO",
    domain: "mail.example.com",
    retryLimit: 2
  },
  emailTokenNext: "/settings/reset-password/"
};

// @ts-ignore
export function allowedLoginNext(next) {
  if (
    authConfig.allowedLoginNext.find(prefix => String(next).startsWith(prefix))
  ) {
    return next;
  }
  return authConfig.allowedLoginNext[0];
}

// @ts-ignore
export function allowedLogoutNext(next) {
  if (
    authConfig.allowedLogoutNext.find(prefix => String(next).startsWith(prefix))
  ) {
    return next;
  }
  return authConfig.allowedLogoutNext[0];
}
