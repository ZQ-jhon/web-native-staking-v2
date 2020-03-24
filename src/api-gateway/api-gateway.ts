import { ApolloServer } from "apollo-server-koa";
import path from "path";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { MyServer } from "../server/start-server";
import { ArticleResolver } from "../shared/article/article-resolver";
import { MetaResolver } from "./resolvers/meta-resolver";

export async function setApiGateway(server: MyServer): Promise<void> {
  const resolvers = [MetaResolver, ArticleResolver];
  server.resolvers = resolvers;

  const sdlPath = path.resolve(__dirname, "api-gateway.graphql");
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
    context: async _ => {
      return {};
    }
  });
  const gPath = `${server.config.server.routePrefix || ""}/api-gateway/`;
  apollo.applyMiddleware({ app: server.app, path: gPath });
}
