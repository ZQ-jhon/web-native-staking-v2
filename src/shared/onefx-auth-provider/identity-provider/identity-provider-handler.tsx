import { Account } from "iotex-antenna/lib/account/account";
import { fromString } from "iotex-antenna/lib/crypto/address";
import { Context } from "onefx/lib/types";
import { v4 as uuidv4 } from "uuid";
import ethToIotx from "../../../../config/eth-to-iotx.json";
import { MyServer } from "../../../server/start-server";
const ethByIotx: Record<string, string> = (ethToIotx || []).reduce(
  (pre: Record<string, string>, cur: { eth: string; iotx: string }) => {
    const iotx = cur.iotx.toLowerCase();
    pre[iotx] = cur.eth.toLowerCase();
    return pre;
  },
  {}
);

// tslint:disable-next-line
export function setIdentityProviderRoutes(server: MyServer): void {
  // API routes
  server.get("logout", "/logout", server.auth.logout);

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
      const rec = String(recovered).toLowerCase();
      // check mappings first and then convert by ourselves
      const eth =
        ethByIotx[rec] ||
        fromString(rec)
          .stringEth()
          .toLowerCase();
      let user = await server.auth.user.getByEth(eth);
      if (!user) {
        // sign up
        user = await server.auth.user.newAndSave({ eth });
      }
      ctx.state.userId = user.id;
      await next();
    },
    server.auth.postAuthentication
  );
}
