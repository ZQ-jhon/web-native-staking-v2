/* tslint:disable:no-any */
import config from "config";
import { Config, Server } from "onefx/lib/server";
import { setModel } from "../model";
import { Gateways, setGateways } from "./gateway/gateway";
import { setMiddleware } from "./middleware";
import { setServerRoutes } from "./server-routes";

export type MyServer = Server & { [key: string]: any; gateways: Gateways };

export async function startServer(): Promise<Server> {
  const server: MyServer = new Server((config as any) as Config) as MyServer;
  setGateways(server);
  setMiddleware(server);
  setModel(server);
  setServerRoutes(server);

  const port = Number(process.env.PORT || config.get("server.port"));
  server.listen(port);
  return server;
}
