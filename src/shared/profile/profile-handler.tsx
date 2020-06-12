// @flow
import React from "react";
import koa from 'koa'
import { noopReducer } from "onefx/lib/iso-react-render/root/root-reducer";
import { combineReducers } from "redux";
import config from "config";
import { apolloSSR } from "../common/apollo-ssr";
//import { smartContractReducer } from "../smart-contract/smart-contract-reducer";
import { ProfileAppContainer } from "./profile-app";

export function setProfileHandler(server: any) {
  server.get(
    "/profile/*",
    async (ctx: koa.Context, next: any) => {
      // @ts-ignore
      if (config.profileIsMaintenance) {
        return ctx.redirect(`/page-maintenance`);
      }
      await next();
    },
    server.auth.subFromMasterCookie,
    server.auth.authRequired,
    // @ts-ignore
    async (ctx: koa.Context) => {
      if (
        ctx.query.utm_source === "cobowallet" ||
        ctx.session.utm_source === "cobowallet"
      ) {
        ctx.session.utm_source = "cobowallet";
        ctx.setState("base.isCobowallet", true);
      }
      // const registeredName = await server.gateways.nameRegistrationContract.getNameCache(
      //   ctx.state.eth
      // );
      // const whitelist =
      //   (await server.model.adminSettings.get("whitelist")) || [];
      // const enableMemberGiveaway =
      //   // @ts-ignore
      //   config.enableMemberGiveaway || whitelist.includes(ctx.state.eth);

      ctx.setState("base.displayWarning", server.config.displayWarning);
      ctx.setState("base.env", server.config.env);
      ctx.setState("base.eth", ctx.state.eth);
      ctx.setState("base.faucetEnable", server.config.faucetEnable);
      ctx.setState("base.roles", ctx.state.roles);
      // ctx.setState("base.registeredName", registeredName);
      ctx.setState("base.userId", ctx.state.userId);
      ctx.setState("base.epochSecondValue", server.config.epochSecondValue);
      ctx.setState(
        "base.stakingDurationSecond",
        server.config.stakingDurationSecond
      );
      // ctx.setState(
      //   "smartContract.nameRegistrationContractAddr",
      //   server.config.gateways.nameRegistrationContract.contractAddress
      // );
      // ctx.setState(
      //   "smartContract.stakingContractAddr",
      //   server.config.gateways.stakingContract.contractAddress
      // );
      // ctx.setState(
      //   "smartContract.tokenContractAddr",
      //   server.config.gateways.tokenContract.contractAddress
      // );
      // ctx.setState(
      //   "smartContract.nativeTokenContractAddr",
      //   server.config.gateways.nativeTokenContract.contractAddress
      // );
      // ctx.setState(
      //   "smartContract.nativePatchTokenContractAddr",
      //   server.config.gateways.nativePatchTokenContract.contractAddress
      // );
      // ctx.setState(
      //   "smartContract.multiSendContractAddr",
      //   server.config.gateways.multiSend.contractAddress
      // );
      // ctx.setState(
      //   "smartContract.delegateProfileContractAddr",
      //   server.config.gateways.delegateProfileContract.contractAddress
      // );
      //ctx.setState("base.enableMemberGiveaway", enableMemberGiveaway);
      ctx.body = await apolloSSR(ctx, {
        VDom: <ProfileAppContainer />,
        reducer: combineReducers({
          base: noopReducer,
          //smartContract: smartContractReducer,
          apolloState: noopReducer,
          webBpApolloState: noopReducer,
        }),
        clientScript: "/profile-main.js",
      });
    }
  );
}
