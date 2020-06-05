const { config } = require("dotenv");
config();

module.exports = {
  project: "web-native-staking-v2",
  server: {
    routePrefix: "/v2",
    port: process.env.PORT || 5004,
    staticDir: "./dist",
    delayInitMiddleware: false,
    cookie: {
      secrets: ["insecure plain text", "insecure secret here"]
    },
    noSecurityHeadersRoutes: {
      "/nsv2/api-gateway/": true,
      "/api/": true
    },
    noCsrfRoutes: {
      "/nsv2/api-gateway/": true,
      "/api/": true
    }
  },
  ssm: {
    enabled: false
  },
  gateways: {
    logger: {
      enabled: true,
      level: "debug"
    },
    staking: {
      // provider: "https://kovan.infura.io/v3/1d4b3ba280cb43678bb11eb272ea70f4",
      contractAddress: "io1zn9mn4v63jg3047ylqx9nqaqz0ev659777q3xc"
    },
    mongoose: {
      enabled: true,
      debug: false,
      uri: process.env.MONGODB_URI,
      connectTimeoutMS: 5000
    },
    iotexMono: {
      endpoint: "https://iotex.fun/internal-api/",
      healthEndpoint: "https://iotex.fun/health/",
      timeout: 8000
    }
  },
  analytics: {
    googleTid: "TODO: replace with your googleTid"
  },
  auth: {
    siteUrl: "http://localhost:5004",
    cookieDomain: "localhost",
    loginUrl: "https://iotex.fun/login/",
    logoutUrl: "https://iotex.fun/logout/"
  },
  csp: {
    "default-src": ["none"],
    "manifest-src": ["self"],
    "style-src": ["self", "unsafe-inline", "https://fonts.googleapis.com/css"],
    "frame-src": [
      "https://wvjb-queue-message/",
      "https://bridge-loaded/",
      "yy://jb-queue-message/"
    ],
    "connect-src": [
      "self",
      "https://www.google-analytics.com/",
      "https://member.iotex.io/api-gateway/",
      "wss://local.iotex.io:64102/",
      "https://member.iotex.io/iotex-core-proxy/",
      "https://api.nightly-cluster-2.iotex.one/",
      "https://api.testnet.iotex.one/",
      ...(process.env.API_GATEWAY_URL ? [process.env.API_GATEWAY_URL] : [])
    ],
    "child-src": ["self"],
    "font-src": ["self", "data:", "https://fonts.gstatic.com/"],
    "img-src": ["*", "data:"],
    "media-src": ["self"],
    "object-src": ["self"],
    "script-src": ["self", "https://www.google-analytics.com/", "unsafe-eval"]
  },
  apiGatewayUrl:
    process.env.API_GATEWAY_URL || "http://localhost:5004/nsv2/api-gateway/"
};
