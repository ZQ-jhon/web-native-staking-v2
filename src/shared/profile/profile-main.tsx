import { clientReactRender } from "onefx/lib/iso-react-render/client-react-render";
import { combineReducers } from "redux";
import { ApolloProvider } from "react-apollo";
import { noopReducer } from "onefx/lib/iso-react-render/root/root-reducer";
import { apolloClient } from "../common/apollo-client";
import { smartContractReducer } from "../smart-contract/smart-contract-reducer";
import { ProfileAppContainer } from "./profile-app";

clientReactRender({
  VDom: (
    <ApolloProvider client={apolloClient}>
      <ProfileAppContainer />
    </ApolloProvider>
  ),
  clientScript: "/profile-main.js",
  reducer: combineReducers({
    base: noopReducer,
    apolloState: noopReducer,
    webBpApolloState: noopReducer,
    smartContract: smartContractReducer
  })
});
