// @flow
import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { VotesReceivedTable } from "./votes-received-table";

type Props = {
  registeredName: string
};

class VotesIReceivedInner extends PureComponent<Props> {
  render() {
    const { registeredName } = this.props;
    return <VotesReceivedTable registeredName={registeredName} />;
  }
}

export const VotesIReceived = connect(function mapStateToProps(state: { base: { registeredName: string } }) {
  return {
    registeredName: state.base.registeredName
  };
})(VotesIReceivedInner)

