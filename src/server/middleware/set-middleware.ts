import koa from "koa";
import { userAgent } from "koa-useragent";
import UserAgent from "koa-useragent/dist/lib/useragent";
import { logger } from "onefx/lib/integrated-gateways/logger";
import { Server } from "onefx/lib/server";
import { Context, Next } from "onefx/lib/types";
import { setIoTeXCoreProxy } from "./iotex-core-proxy-middleware";
import { manifestMiddleware } from "./manifest-middleware";

export function setMiddleware(server: Server): void {
  server.use(userAgent);
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
      const userAgent: UserAgent = ctx.userAgent;
      if (userAgent && userAgent.isChrome) {
        const versionText = userAgent.version;
        if (versionText) {
          const splits = versionText.split(".");
          if (splits.length >= 1) {
            try {
              const versionNumber = Number(splits[0]);
              if (versionNumber <= 62) {
                logger.info(
                  `detect lower chrome version ${versionText} on android device, will remove csp\nuser-agent ${ua}`
                );
                return true;
              }
            } catch (e) {
              logger.info(
                `detect chrome version ${versionText} on android device, could not parse version number`
              );
            }
          }
        }
      }
    }
  }
  return false;
}
