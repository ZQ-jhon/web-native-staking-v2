import { Server } from "onefx";

export function setIoTeXCoreProxy(server: Server): void {
  const proxy = require("koa-server-http-proxy");
  // @ts-ignore
  let target = server.config.iotexCore;
  if (target) {
    target = target.indexOf("http") === -1 ? `http://${target}` : target;
    server.use(
      proxy("/iotex-core-proxy/", {
        target,
        pathRewrite: { "^/iotex-core-proxy/*": "/" },
        changeOrigin: true,
      })
    );
  }
}
