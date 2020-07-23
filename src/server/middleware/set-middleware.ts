import koa from "koa";
import { Server } from "onefx/lib/server";
import { Context, Next } from "onefx/lib/types";
import { setIoTeXCoreProxy } from "./iotex-core-proxy-middleware";
import { manifestMiddleware } from "./manifest-middleware";

export function setMiddleware(server: Server): void {
  server.use(async (ctx: Context, next: Next) => {
    await next();
    if (shouldPassCSP(ctx)) {
      ctx.set("Content-Security-Policy", "");
    }
  });
  server.initMiddleware();
  server.use(manifestMiddleware(server));
  setIoTeXCoreProxy(server);
}

export function shouldPassCSP(ctx: koa.Context): boolean {
  if (ctx.response.type === "text/html") {
    const ua = ctx.header["user-agent"];
    if (
      (ua && ua.includes("IoPayAndroid")) ||
      ctx.session.app_source === "IoPay"
    ) {
      return true;
    }
  }
  return false;
}
