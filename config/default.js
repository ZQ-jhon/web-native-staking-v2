const { config } = require("dotenv");
config();

module.exports = {
  project: "web-native-staking-v2",
  server: {
    proxy: true,
    routePrefix: "",
    port: process.env.PORT || 5004,
    staticDir: "./dist",
    delayInitMiddleware: false,
    cookie: {
      secrets: ["insecure plain text", "insecure secret here"],
    },
    noSecurityHeadersRoutes: {
      "/v2/api-gateway/": true,
      "/api/": true,
    },
    noCsrfRoutes: {
      "/v2/api-gateway/": true,
      "/api/": true,
      "/iotex-core-proxy/": true,
    },
  },
  ssm: {
    enabled: false,
  },
  gateways: {
    logger: {
      enabled: true,
      level: "debug",
    },
    mongoose: {
      enabled: true,
      debug: false,
      uri: process.env.MONGODB_URI,
      connectTimeoutMS: 5000,
    },
    staking: {
      delegateProfileContractAddr: "io1lfl4ppn2c3wcft04f0rk0jy9lyn4pcjcm7638u",
    },
  },
  analytics: {
    googleTid: "TODO: replace with your googleTid",
  },
  apiGatewayUrl:
    process.env.API_GATEWAY_URL || "http://localhost:5004/v2/api-gateway/",
  iotexCore: "https://api.iotex.one",
  easterHeight: "4478761",
  webBp: "https://member.iotex.io/api-gateway/",
};
