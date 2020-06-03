import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { ApolloLink } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import ApolloLinkTimeout from "apollo-link-timeout";
import { createWebBpApolloClient } from "iotex-react-block-producers";
import isBrowser from "is-browser";
import fetch from "isomorphic-unfetch";
// @ts-ignore
import JsonGlobal from "safe-json-globals/get";

const state = isBrowser && JsonGlobal("state");
const apolloState = isBrowser && state.apolloState;
const apiGatewayUrl = isBrowser && state.base.apiGatewayUrl;
const csrfToken = isBrowser && state.base.csrfToken;
export const ownersToNames = isBrowser && state.base.ownersToNames;

const timeoutLink = new ApolloLinkTimeout(isBrowser ? 10000 : 200);
const myHttpLink = new HttpLink({
  uri: apiGatewayUrl,
  fetch,
  credentials: "same-origin",
  headers: { "x-csrf-token": csrfToken }
});
const timeoutHttpLink = timeoutLink.concat(myHttpLink);

export const apolloClient = new ApolloClient({
  ssrMode: !isBrowser,
  link: timeoutHttpLink,
  cache: new InMemoryCache().restore(apolloState)
});
export const webBpApolloClient = createWebBpApolloClient(
  "https://member.iotex.io/api-gateway/",
  "clientId"
);

const iotexscanGatewayUrl = "https://iotexscan.io/api-gateway/";
const MAX_CONCURRENT_REQUEST = 5;
let availableCap = MAX_CONCURRENT_REQUEST;
setInterval(() => (availableCap = MAX_CONCURRENT_REQUEST), 1000); // Rate cap to 5 requests per second

const limitRateFetch = async (
  req: RequestInfo,
  opt?: RequestInit
): Promise<Response> => {
  if (availableCap > 0) {
    availableCap--;
    return fetch(req, opt);
  }
  return new Promise(resolve =>
    setTimeout(() => resolve(limitRateFetch(req, opt)), 100)
  );
};

const apolloClientConfig = {
  uri: iotexscanGatewayUrl
};

const httpLink = new HttpLink({
  uri: iotexscanGatewayUrl,
  fetch: async (_, ...opts) => limitRateFetch(apolloClientConfig.uri, ...opts),
  headers: { "x-csrf-token": csrfToken }
});

const link = ApolloLink.from([httpLink]);

export const iotexExplorerClient = new ApolloClient({
  ssrMode: !isBrowser,
  link,
  cache: new InMemoryCache().restore(apolloState)
});

export const analyticsApolloClient = new ApolloClient({
  ssrMode: !isBrowser,
  link: new HttpLink({
    uri: "https://analytics.iotexscan.io/query",
    fetch,
    headers: { "x-iotex-client-id": "" }
  }),
  cache: isBrowser
    ? new InMemoryCache().restore(state.webBpApolloState)
    : new InMemoryCache()
});
