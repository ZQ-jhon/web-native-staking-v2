import { clientReactRender } from "onefx/lib/iso-react-render/client-react-render";
import { combineReducers } from "redux";
import { ApolloProvider } from "react-apollo";
import { noopReducer } from "onefx/lib/iso-react-render/root/root-reducer";
import { apolloClient } from "../common/apollo-client";
//import { smartContractReducer } from "../smart-contract/smart-contract-reducer";
import { ProfileAppContainer } from "./profile-app";

clientReactRender({
  VDom: (
    // @ts-ignore
    <ApolloProvider client={apolloClient}>
      //@ts-ignore
      <ProfileAppContainer />
    </ApolloProvider>
  ),
  // @ts-ignore
  clientScript: "/profile-app.js",
  reducer: combineReducers({
    base: noopReducer,
    apolloState: noopReducer,
    webBpApolloState: noopReducer
    //smartContract: smartContractReducer
  })
});
