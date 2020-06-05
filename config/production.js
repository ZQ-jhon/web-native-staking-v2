module.exports = {
  server: {
    cdnBase: "https://web-native-staking-v2.b-cdn.net/",
    routePrefix: "/v2",
    cookie: {
      secrets: JSON.parse(
        process.env.COOKIE_SECRETS || '["please specify COOKIE_SECRETS in env"]'
      )
    }
  },
  gateways: {
    logger: {
      level: "info"
    }
  }
};
