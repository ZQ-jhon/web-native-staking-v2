module.exports = {
  server: {
    cdnBase: "https://web-native-staking-v2.b-cdn.net/",
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
