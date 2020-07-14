module.exports = {
  server: {
    cdnBase: "",
    cookie: {
      secrets: JSON.parse(
        process.env.COOKIE_SECRETS || '["please specify COOKIE_SECRETS in env"]'
      ),
    },
  },
  gateways: {
    logger: {
      level: "info",
    },
  },
};
