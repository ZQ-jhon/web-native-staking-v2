/* eslint-disable no-invalid-this */
// @flow
import React, { Component } from "react";
import { CommonModal } from "../../common/common-modal";

type Props = {
  clickable: any;
  children: any;
  onOk: (cb: () => void) => void;
  onCancel?: any;
  modalUnMountFun?: any;
  title?: string;
  okButtonProps?: {
    disabled: boolean;
  };
};
type State = { visible: boolean };

export class ModalWrapper extends Component<Props, State> {
  state: State = { visible: false };
  props: Props;

  onOk = () => {
    const { onOk } = this.props;
    onOk(() => {
      this.setState({ visible: false });
    });
  };

  onCancel = () => {
    const { onCancel } = this.props;
    if (onCancel) {
      onCancel();
    } else {
      this.setState({
        visible: false
      });
    }
  };

  componentWillUnmount() {
    if (this.props.modalUnMountFun) {
      this.props.modalUnMountFun();
    }
  }

  render() {
    // eslint-disable-next-line no-unused-vars
    const { clickable, children, onOk, title, ...otherProps } = this.props;
    const { visible } = this.state;

    return (
      <div>
        <div onClick={() => this.setState({ visible: true })}>{clickable}</div>
        <CommonModal
          onCancel={() => this.onCancel()}
          onOk={() => this.onOk()}
          visible={visible}
          title={title}
          {...otherProps}
        >
          {children}
        </CommonModal>
      </div>
    );
  }
}
