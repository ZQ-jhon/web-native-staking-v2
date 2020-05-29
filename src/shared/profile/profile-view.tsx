// @flow

import { Component } from "react";
import { Modal } from "antd";
import { CandidateProfileViewHeaderContainer } from "../home/candidate-view-header";
import { CandidateProfileViewContentContainer } from "../home/candidate-view-content";
import { TOP_BAR_HEIGHT } from "../common/top-bar";

const customStyles = {
  bottom: 0,
  top: `${TOP_BAR_HEIGHT + 10}px`,
  right: "auto",
  left: "auto",
  position: "relative",
  height: "90vh",
  overflow: "scroll"
};
type Props = {
  data?: any,
  visible?: any,
  handleCloseModal?: any
};
export class ProfileView extends Component<Props> {
  props: Props;
  render() {
    const { data, visible, handleCloseModal } = this.props;
    return (
      <Modal
        visible={visible}
        style={customStyles}
        onCancel={handleCloseModal}
        width="80%"
        footer={null}
      >
        <CandidateProfileViewHeaderContainer data={data} scale={0.75} />
        <CandidateProfileViewContentContainer data={data} />
      </Modal>
    );
  }
}
