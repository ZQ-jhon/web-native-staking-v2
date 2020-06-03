import Antenna from "iotex-antenna/lib";
import koa from "koa";
import { noopReducer } from "onefx/lib/iso-react-render/root/root-reducer";
import * as React from "react";
import { setApiGateway } from "../api-gateway/api-gateway";
import { setProfileHandler } from "../shared/profile/profile-handler";
import { AppContainer } from "../shared/app-container";
import { apolloSSR } from "../shared/common/apollo-ssr";
import { Staking } from "./gateway/staking";
import { MyServer } from "./start-server";

export function setServerRoutes(server: MyServer): void {
  // Health checks
  server.get("health", "/health", (ctx: koa.Context) => {
    ctx.body = "OK";
  });

  setApiGateway(server);
  setProfileHandler(server);

  // @ts-ignore
  server.get(
    "SPA",
    /^(?!\/?tools\/token-migration\/api-gateway\/|\/profile\/.*).+$/,
    async (ctx: koa.Context) => {
      const st = new Staking({
        antenna: new Antenna("https://api.testnet.iotex.one")
      });
      const height = await st.getHeight();
      const resp = await st.getAllCandidates(0, 1000, height);
      const ownersToNames: Record<string, string> = {};
      for (const c of resp) {
        ownersToNames[c.ownerAddress] = c.name;
      }
      ctx.setState("base.ownersToNames", ownersToNames);
      ctx.setState(
        "staking.contractAddress",
        // @ts-ignore
        server.config.gateways.staking.contractAddress
      );
      checkingAppSource(ctx);
      // @ts-ignore
      ctx.body = await apolloSSR(ctx, server.config.apiGatewayUrl, {
        VDom: <AppContainer />,
        reducer: noopReducer,
        clientScript: "/main.js"
      });
    }
  );
}

export function checkingAppSource(ctx: koa.Context): void {
  if (
    ctx.header["user-agent"].includes("IoPayAndroid") ||
    ctx.header["user-agent"].includes("IoPayiOs") ||
    ctx.session.app_source === "IoPay"
  ) {
    ctx.session.app_source = "IoPay";
    ctx.setState("base.isIoPay", true);
  }
}
