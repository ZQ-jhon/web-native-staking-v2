import { clientReactRender } from "onefx/lib/iso-react-render/client-react-render";
import { noopReducer } from "onefx/lib/iso-react-render/root/root-reducer";
import React from "react";
import { ApolloProvider } from "react-apollo";
import { combineReducers } from "redux";
import { AppContainer } from "../../shared/app-container";
import { apolloClient } from "../../shared/common/apollo-client";
import {
  accountMetaReducer,
  bucketsReducer
} from "../../shared/home/buckets-reducer";
import { smartContractReducer } from "../../shared/staking/smart-contract-reducer";

clientReactRender({
  VDom: (
    <ApolloProvider client={apolloClient}>
      <AppContainer />
    </ApolloProvider>
  ),
  reducer: combineReducers({
    buckets: bucketsReducer,
    base: noopReducer,
    staking: noopReducer,
    apolloState: noopReducer,
    accountMeta: accountMetaReducer,
    smartContract: smartContractReducer
  })
});
