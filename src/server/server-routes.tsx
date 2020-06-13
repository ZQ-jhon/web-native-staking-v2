import Antenna from "iotex-antenna/lib";
import koa from "koa";
import { noopReducer } from "onefx/lib/iso-react-render/root/root-reducer";
import { Context } from "onefx/lib/types";
import * as React from "react";
import { setApiGateway } from "../api-gateway/api-gateway";
import { AppContainer } from "../shared/app-container";
import { apolloSSR } from "../shared/common/apollo-ssr";
import { setEmailPasswordIdentityProviderRoutes } from "../shared/onefx-auth-provider/email-password-identity-provider/email-password-identity-provider-handler";
import { Staking } from "./gateway/staking";
import { MyServer } from "./start-server";

export function setServerRoutes(server: MyServer): void {
  // Health checks
  server.get("health", "/health", (ctx: koa.Context) => {
    ctx.body = "OK";
  });

  setApiGateway(server);

  setEmailPasswordIdentityProviderRoutes(server);

  // @ts-ignore
  server.get("SPA", /^(?!\/?v2\/api-gateway\/).+$/, async (ctx: Context) => {
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
    ctx.setState(
      "staking.contractAddress",
      // @ts-ignore
      server.config.gateways.staking.contractAddress
    );
    ctx.setState(
      "staking.delegateProfileContractAddr",
      // @ts-ignore
      server.config.gateways.staking.delegateProfileContractAddr
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
