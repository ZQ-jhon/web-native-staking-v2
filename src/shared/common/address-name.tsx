import { get } from "dottie";
import gql from "graphql-tag";
import { validateAddress } from "iotex-antenna/lib/account/utils";
import React from "react";
import { Query, QueryResult } from "react-apollo";
import { iotexExplorerClient } from "./apollo-client";
import { LinkButton } from "./buttons";

export const GET_ADDRESS_META = gql`
  query addressMeta($address: String!) {
    addressMeta(address: $address) {
      name
    }
  }
`;

const AddressName: React.FC<{ address: string; className: string }> = ({
  address,
  className
}) => {
  if (validateAddress(address)) {
    return (
      <Query
        query={GET_ADDRESS_META}
        variables={{ address }}
        errorPolicy="ignore"
        client={iotexExplorerClient}
      >
        {({ data, error }: QueryResult<{ name: string }>) => {
          if (error) {
            return (
              <LinkButton href={`https://iotexscan.io/address/${address}`}>
                {address}
              </LinkButton>
            );
          }
          const { name = address } = get(data || {}, "addressMeta") || {};
          return (
            <LinkButton
              href={`https://iotexscan.io/address/${address}`}
              className={className}
            >
              {name || address}
            </LinkButton>
          );
        }}
      </Query>
    );
  }
  return <LinkButton href={`#`}>{address}</LinkButton>;
};

export { AddressName };
