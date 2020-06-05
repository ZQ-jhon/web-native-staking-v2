// $FlowFixMe
import { ApolloServer } from "apollo-server-koa";
import path from "path";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { MyServer } from "../server/start-server";
import { ArticleResolver } from "../shared/article/article-resolver";
import { BPResolver } from "./resolvers/bp-resolvers/bp-resolver";
import { MetaResolver } from "./resolvers/meta-resolver";
import { logger } from "onefx/lib/integrated-gateways/logger";

export type Context = {
  gateways: MyServer["gateways"];
  userId: string;
  session: any;
  model: any;
  auth: any;
  requestIp: string;
};

export async function setApiGateway(server: MyServer): Promise<void> {
  const resolvers = [MetaResolver, ArticleResolver, BPResolver];
  server.resolvers = resolvers;
  const sdlPath = path.resolve(__dirname, "api-gateway.graphql");
  try {
    const schema = await buildSchema({
      resolvers,
      emitSchemaFile: {
        path: sdlPath,
        commentDescriptions: true
      },
      validate: false
    });

    const apollo = new ApolloServer({
      schema,
      introspection: true,
      playground: true,
      context: async ({ ctx }): Promise<Context> => {
        // const clientId = ctx.req.headers["x-iotex-client-id"];
        // if (!clientId) {
        //   throw new AuthenticationError("unauthorized");
        // }
        // server.logger.info(`x-iotex-client-id: ${clientId}`);

        let requestIp;
        try {
          requestIp =
            ctx.req.headers["x-forwarded-for"] ||
            ctx.req.connection.remoteAddress ||
            ctx.req.socket.remoteAddress ||
            ctx.req.connection.socket.remoteAddress;
        } catch (e) {
          logger.warn("can not get requestIp");
        }

        const token = server.auth.tokenFromCtx(ctx);
        const userId = await server.auth.jwt.verify(token);
        return {
          userId,
          session: ctx.session,
          model: server.model,
          gateways: server.gateways,
          auth: server.auth,
          requestIp
        };
      }
    });
    const gPath = `${server.config.server.routePrefix || ""}/api-gateway/`;
    apollo.applyMiddleware({ app: server.app, path: gPath });
  } catch (e) {
    console.log("error=====================", e);
  }
}
