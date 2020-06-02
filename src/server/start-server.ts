/* tslint:disable:no-any */
import config from "config";
import { Config, Server } from "onefx/lib/server";
import { setModel } from "../model";
import { Gateways, setGateways } from "./gateway/gateway";
import { OnefxAuth } from "../shared/onefx-auth/onefx-auth";
import { authConfig } from "../shared/onefx-auth/auth-config";
import { setMiddleware } from "./middleware";
import { setServerRoutes } from "./server-routes";

export type MyServer = Server & { [key: string]: any; gateways: Gateways };

export async function startServer(): Promise<Server> {
  const server: MyServer = new Server((config as any) as Config) as MyServer;
  setGateways(server);
  setMiddleware(server);
  server.auth = new OnefxAuth(server, authConfig);
  setModel(server);
  setServerRoutes(server);

  const port = Number(process.env.PORT || config.get("server.port"));
  server.listen(port);
  return server;
}
