/* tslint:disable:no-any */
import config from "config";
import { Config, Server } from "onefx/lib/server";
import { setModel } from "../model";
import { OnefxAuth } from "../shared/onefx-auth";
import { authConfig } from "../shared/onefx-auth/auth-config";
import { setGateways } from "./gateway/gateway";
import { setMiddleware } from "./middleware";
import { setServerRoutes } from "./server-routes";
import { MetaResolver } from "../api-gateway/resolvers/meta-resolver";
import { ArticleResolver } from "../shared/article/article-resolver";
import { BPResolver } from "../api-gateway/resolvers/bp-resolvers/bp-resolver";
import { IotexMono } from "./gateway/iotex-mono";
import { BpServerStatus } from "./gateway/bp-server-status";

export type MyConfig = Config & {
  gateways: {
    iotexMono: {
      endpoint: string;
      healthEndpoint: string;
      timeout: number;
    };
  };
};

const defaultConfig: Config = {
  project: "",
  server: {
    host: "",
    port: "",
    staticDir: "",
    delayInitMiddleware: false,
    cookie: {
      secrets: []
    },
    noSecurityHeadersRoutes: {},
    noCsrfRoutes: {}
  },
  gateways: {
    logger: {
      enabled: true,
      baseDir: "",
      topicName: "",
      level: "debug"
    }
  },
  csp: {},
  analytics: {},
  session: {}
};

const serverConfig: Config = {
  ...defaultConfig,
  ...config
};

export type MyServer = Server & {
  resolvers: Array<
    typeof MetaResolver | typeof ArticleResolver | typeof BPResolver
  >;
  model: {};
  gateways: {
    iotexMono: IotexMono;
    bpServerStatus: BpServerStatus;
  };
  config: MyConfig;
  // tslint:disable-next-line:no-any
  auth: OnefxAuth;
};

export async function startServer(): Promise<Server> {
  const server: MyServer = new Server(serverConfig as MyConfig) as MyServer;
  server.app.proxy = Boolean(config.get("server.proxy"));
  setGateways(server);
  setMiddleware(server);
  server.auth = new OnefxAuth(server, authConfig);
  setModel(server);
  setServerRoutes(server);

  const port = Number(process.env.PORT || config.get("server.port"));
  server.listen(port);
  return server;
}
