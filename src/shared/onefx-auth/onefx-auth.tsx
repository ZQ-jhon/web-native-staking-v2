/* eslint-disable no-invalid-this */
// @flow
import { promisify } from "util";
import { logger } from "onefx/lib/integrated-gateways/logger";
// $FlowFixMe
import jwt from "jsonwebtoken";
import { UserModel } from "./model/user-model";
import { JwtModel } from "./model/jwt-model";
import { allowedLoginNext, authConfig } from "./auth-config";
import { getExpireEpochDays } from "./utils/expire-epoch";
import { EmailTokenModel } from "./model/email-token-model";

const verify = promisify(jwt.verify);

export class OnefxAuth {
  config: any;
  server: any;
  user: UserModel;
  jwt: JwtModel;
  emailToken: EmailTokenModel;

  constructor(server: any, config: any) {
    this.config = config || authConfig;
    this.server = server;
    this.user = new UserModel({ mongoose: server.gateways.mongoose });
    this.jwt = new JwtModel({
      mongoose: server.gateways.mongoose,
      secret: this.config.secret,
      expDays: this.config.ttl,
    });
    this.emailToken = new EmailTokenModel({
      mongoose: server.gateways.mongoose,
      expMins: config.emailTokenTtl,
    });
    this.config.cookieOpts = {
      ...this.config.cookieOpts,
      expires: new Date(getExpireEpochDays(this.config.ttl)),
    };
  }

  authRequired = async (ctx: any, next: any) => {
    await this.authOptionalContinue(ctx, () => null);
    const userId = ctx.state.userId;
    if (!userId) {
      logger.debug("user is not authenticated but auth is required");
      return ctx.redirect(
        `/logout/?next=${encodeURIComponent(
          `${this.config.loginUrl}?next=${encodeURIComponent(
            this.config.siteUrl + ctx.url
          )}`
        )}`
      );
    }
    // if (!ctx.state.eth) {
    //   const eth = await this.server.gateways.iotexMono.getLoginEthByIotexId(
    //     ctx.state.iotexId
    //   );
    //   if (!eth) {
    //     return ctx.redirect(
    //       `/logout/?next=${encodeURIComponent(
    //         `${this.config.siteUrl}/?error=please_login_with_metamask`
    //       )}`
    //     );
    //   }
    //   ctx.state.eth = eth;
    // }

    logger.debug(`user is authenticated ${userId}`);
    await next();
  };

  authOptionalContinue = async (ctx: any, next: any) => {
    const token = this.tokenFromCtx(ctx);
    ctx.state.userId = await this.jwt.verify(token);
    ctx.state.jwt = token;
    if (ctx.state.userId) {
      const user = await this.user.getById(ctx.state.userId);
      const roles = user && user.roles;
      if (roles && roles.indexOf("admin") !== -1) {
        ctx.state.roles = roles;
      }
      ctx.state.eth = user && user.eth;
      ctx.state.iotexId = user && user.iotexId;
    }
    if (this.server.config.displayInternal) {
      // TODO split admin role and internal display
      ctx.state.roles = ["admin"];
    }
    await next();
  };

  logout = async (ctx: any) => {
    ctx.cookies.set(this.config.cookieName, null, this.config.cookieOpts);
    const token = this.tokenFromCtx(ctx);
    this.jwt.revoke(token);
    const next = ctx.query.next || `${this.config.siteUrl}/`;
    const appendNext = `?next=${encodeURIComponent(next)}`;
    ctx.redirect(`${this.config.logoutUrl}${appendNext}`);
  };

  subFromMasterCookie = async (ctx: any, next: any) => {
    // logged-in users
    const subToken = await this.tokenFromCtx(ctx);
    if (subToken) {
      const userId = await this.jwt.verify(subToken);
      if (userId) {
        return await next();
      }
    }

    // un-logged-in users
    const masterToken =
      this.config.masterDevToken ||
      ctx.cookies.get(
        this.config.masterCookieName,
        this.config.masterCookieOpts
      );
    if (!masterToken) {
      return await next();
    }

    // invalid users from iotex.io
    let decoded;
    try {
      decoded = await verify(masterToken, this.config.masterSecret);
    } catch (e) {
      if (this.config.masterDevToken) {
        decoded = jwt.decode(this.config.masterDevToken);
      }
    }
    // no valid master token from iotex.io
    // @ts-ignore
    if (!decoded || !decoded.sub) {
      return await next();
    }

    const eth = await this.server.gateways.iotexMono.getLoginEthByIotexId(
      // @ts-ignore
      decoded.sub
    );
    // valid users from iotex.io
    //@ts-ignore
    const user = await this.user.getOrAddByIotexId(decoded.sub, eth);

    logger.debug(`user ${user.id} is in post authentication status`);
    const token = await this.jwt.create(user.id);
    ctx.cookies.set(this.config.cookieName, token, this.config.cookieOpts);
    ctx.state.jwt = token;

    await next();
  };
  // @ts-ignore
  postAuthentication = async (ctx: any) => {
    if (!ctx.state.userId) {
      return;
    }

    logger.debug(`user ${ctx.state.userId} is in post authentication status`);
    const user = await this.user.getById(ctx.state.userId);
    const roles = user.roles;
    const token = await this.jwt.create(ctx.state.userId, roles);
    ctx.cookies.set(this.config.cookieName, token, this.config.cookieOpts);
    ctx.state.jwt = token;
    const nextUrl = allowedLoginNext(
      ctx.query.next || (ctx.request.body && ctx.request.body.next)
    );
    if (ctx.is("json")) {
      return (ctx.body = { shouldRedirect: true, ok: true, next: nextUrl });
    }

    ctx.redirect(nextUrl);
  };

  tokenFromCtx = (ctx: any) => {
    let token =
      ctx.state.jwt ||
      ctx.cookies.get(this.config.cookieName, this.config.cookieOpts);
    if (!token && ctx.headers.authorization) {
      token = String(ctx.headers.authorization).replace("Bearer ", "");
    }
    return token;
  };
}
