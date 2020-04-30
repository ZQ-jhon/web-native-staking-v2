import React, { Component } from "react";
import { CommonModal } from "../common/common-modal";

type Props = {
  showModal: Boolean;
  registeredName?: String;
  isNative: boolean;
  onOk(): void;
  onCancel(): void;
};
type State = {};

class VotingCandidateView extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }
  render(): JSX.Element {
    const { showModal, onOk, onCancel } = this.props;
    return (
      // @ts-ignore
      <CommonModal visible={showModal} onOk={onOk} onCancel={onCancel}>
        <div>VotingCandidateView</div>
      </CommonModal>
    );
  }
}
export { VotingCandidateView };
