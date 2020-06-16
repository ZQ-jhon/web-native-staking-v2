import Antenna from "iotex-antenna/lib";
import koa from "koa";
import { noopReducer } from "onefx/lib/iso-react-render/root/root-reducer";
import { Context } from "onefx/lib/types";
import * as React from "react";
import { setApiGateway } from "../api-gateway/api-gateway";
import { AppContainer } from "../shared/app-container";
import { apolloSSR } from "../shared/common/apollo-ssr";
import { setIdentityProviderRoutes } from "../shared/onefx-auth-provider/identity-provider/identity-provider-handler";
import { Staking } from "./gateway/staking";
import { MyServer } from "./start-server";

async function setAllCandidates(ctx: Context): Promise<void> {
  const st = new Staking({
    antenna: new Antenna("https://api.iotex.one")
  });
  const height = await st.getHeight();
  const resp = await st.getAllCandidates(0, 1000, height);
  const ownersToNames: Record<string, string> = {};
  for (const c of resp) {
    ownersToNames[c.ownerAddress] = c.name;
  }
  ctx.setState("base.ownersToNames", ownersToNames);
}

export function setServerRoutes(server: MyServer): void {
  // Health checks
  server.get("health", "/health", (ctx: koa.Context) => {
    ctx.body = "OK";
  });

  setApiGateway(server);

  setIdentityProviderRoutes(server);

  // @ts-ignore
  server.get(
    "delegate-profile",
    "/profile*",
    server.auth.authRequired,
    async (ctx: Context) => {
      const user = await server.auth.user.getById(ctx.state.userId);
      ctx.setState("base.eth", user!.eth);
      ctx.setState("base.next", ctx.query.next);
      ctx.setState("base.apiToken", ctx.state.jwt);
      await setAllCandidates(ctx);
      ctx.setState(
        "staking.contractAddress",
        // @ts-ignore
        server.config.gateways.staking.contractAddress
      );
      checkingAppSource(ctx);
      ctx.body = await apolloSSR(ctx, {
        VDom: <AppContainer />,
        reducer: noopReducer,
        clientScript: "main.js"
      });
    }
  );

  server.get("SPA", /^(?!\/?v2\/api-gateway\/).+$/, async (ctx: Context) => {
    ctx.setState("base.next", ctx.query.next);
    await setAllCandidates(ctx);
    ctx.setState(
      "staking.contractAddress",
      // @ts-ignore
      server.config.gateways.staking.contractAddress
    );
    checkingAppSource(ctx);
    ctx.body = await apolloSSR(ctx, {
      VDom: <AppContainer />,
      reducer: noopReducer,
      clientScript: "main.js"
    });
  });
}

export function checkingAppSource(ctx: koa.Context): void {
  const ua = ctx.header["user-agent"];
  if (
    (ua && (ua.includes("IoPayAndroid") || ua.includes("IoPayiOs"))) ||
    ctx.session.app_source === "IoPay"
  ) {
    ctx.session.app_source = "IoPay";
    ctx.setState("base.isIoPayMobile", true);
  }
}
