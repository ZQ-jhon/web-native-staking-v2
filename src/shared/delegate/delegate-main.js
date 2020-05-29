import { clientReactRender } from "onefx/lib/iso-react-render/client-react-render";
import { combineReducers } from "redux";
import { ApolloProvider } from "react-apollo";
import { noopReducer } from "onefx/lib/iso-react-render/root/root-reducer";
import { apolloClient } from "../common/apollo-client";
import { smartContractReducer } from "../smart-contract/smart-contract-reducer";
import { baseReducer } from "../../shared/base-reducer";
import { DelegateApp } from "./delegate-app";

clientReactRender({
  VDom: (
    <ApolloProvider client={apolloClient}>
      <DelegateApp />
    </ApolloProvider>
  ),
  clientScript: "/profile-main.js",
  reducer: combineReducers({
    base: baseReducer,
    apolloState: noopReducer,
    webBpApolloState: noopReducer,
    smartContract: smartContractReducer
  })
});
