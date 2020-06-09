import { Context } from "onefx/lib/types";
import { v4 as uuidv4 } from "uuid";
import validator from "validator";
import { MyServer } from "../../../server/start-server";

type Handler = (ctx: Context, next: Function) => Promise<{}>;

export function emailValidator(): Handler {
  return async (ctx: Context, next: Function) => {
    let { email } = ctx.request.body;
    email = String(email).toLowerCase();
    email = validator.trim(email);
    if (!validator.isEmail(email)) {
      return (ctx.response.body = {
        ok: false,
        error: {
          code: "auth/invalid-email",
          message: ctx.t("auth/invalid-email")
        }
      });
    }

    ctx.request.body.email = email;
    return next(ctx);
  };
}

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
    emailValidator(),
    async (ctx: Context, next: Function) => {
      const { email, password } = ctx.request.body;
      const user = await server.auth.user.getByMail(email);
      if (!user) {
        ctx.response.body = {
          ok: false,
          error: {
            code: "auth/user-not-found",
            message: ctx.t("auth/user-not-found")
          }
        };
        return;
      }
      const isPasswordVerified = await server.auth.user.verifyPassword(
        user._id,
        password
      );
      if (!isPasswordVerified) {
        ctx.response.body = {
          ok: false,
          error: {
            code: "auth/wrong-password",
            message: ctx.t("auth/wrong-password")
          }
        };
        return;
      }
      if (user.isBlocked) {
        ctx.response.body = {
          ok: false,
          error: {
            code: "auth/user-disabled",
            message: ctx.t("auth/user-disabled")
          }
        };
        return;
      }
      ctx.state.userId = user._id;
      await next();
    },
    server.auth.postAuthentication
  );
}
