import { noopReducer } from "onefx/lib/iso-react-render/root/root-reducer";
import { combineReducers } from "redux";
import config from "config";
import { apolloSSR } from "../common/apollo-ssr";
import { smartContractReducer } from "../smart-contract/smart-contract-reducer";
import { baseReducer } from "../../shared/base-reducer";
import { DelegateApp } from "./delegate-app";

export function setDelegateHandler(server) {
  server.get("(/delegate/.*)", server.auth.subFromMasterCookie, async ctx => {
    const whitelist = (await server.model.adminSettings.get("whitelist")) || [];
    const enableMemberGiveaway =
      config.enableMemberGiveaway || whitelist.includes(ctx.state.eth);

    ctx.setState("base.totalEmerald", ctx.state.totalEmerald || 0);
    ctx.setState("base.displayWarning", server.config.displayWarning);
    ctx.setState("base.env", server.config.env);
    ctx.setState("base.eth", ctx.state.eth);
    ctx.setState("base.userId", ctx.state.userId);
    ctx.setState("base.roles", ctx.state.roles);
    ctx.setState(
      "smartContract.stakingContractAddr",
      server.config.gateways.stakingContract.contractAddress
    );
    ctx.setState(
      "smartContract.tokenContractAddr",
      server.config.gateways.tokenContract.contractAddress
    );
    ctx.setState(
      "smartContract.nativeTokenContractAddr",
      server.config.gateways.nativeTokenContract.contractAddress
    );
    ctx.setState(
      "smartContract.nativePatchTokenContractAddr",
      server.config.gateways.nativePatchTokenContract.contractAddress
    );
    ctx.setState("base.enableMemberGiveaway", enableMemberGiveaway);
    ctx.setState("base.easterHeight", server.config.easterHeight);
    checkingAppSource(ctx);
    ctx.body = await apolloSSR(ctx, server.config.apiGatewayUrl, {
      VDom: <DelegateApp />,
      reducer: combineReducers({
        base: baseReducer,
        smartContract: smartContractReducer,
        apolloState: noopReducer,
        webBpApolloState: noopReducer
      }),
      clientScript: "/delegate-main.js"
    });
  });
}

export function checkingAppSource(ctx) {
  if (
    ((ctx.url === "/" || ctx.url === "/my-votes") &&
      ctx.header["user-agent"].includes("IoPayAndroid")) ||
    ctx.header["user-agent"].includes("IoPayiOs") ||
    ctx.session.app_source === "IoPay"
  ) {
    ctx.session.app_source = "IoPay";
    ctx.setState("base.isIoPay", true);
  }
}
