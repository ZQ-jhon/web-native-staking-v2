import { Account } from "iotex-antenna/lib/account/account";
import { Context } from "onefx/lib/types";
import { v4 as uuidv4 } from "uuid";
import { MyServer } from "../../../server/start-server";

// tslint:disable-next-line
export function setEmailPasswordIdentityProviderRoutes(server: MyServer): void {
  // API routes

  server.post("api-sign-in-meta", "/api/sign-in/meta", async ctx => {
    const nonce = uuidv4();
    ctx.session.nonce = nonce;
    ctx.response.body = {
      message: "sign in",
      nonce
    };
  });

  server.post(
    "api-sign-in",
    "/api/sign-in/",
    async (ctx: Context, next: Function) => {
      const { sig, address } = ctx.request.body;
      const msg = `Login with ${address} and the nonce of ${ctx.session.nonce}`;
      ctx.session.nonce = null;

      const recovered = new Account().recover(
        msg,
        Buffer.from(sig, "hex"),
        false
      );
      if (recovered !== address) {
        ctx.response.body = {
          ok: false,
          error: {
            code: "auth/failed_to_login",
            message: ctx.t("auth/failed_to_login")
          }
        };
        return;
      }
      await next();
    },
    server.auth.postAuthentication
  );
}
