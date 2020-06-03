// @flow
import React, { Component } from "react";
import { CommonModal } from "../../common/common-modal";

type Props = {
  // tslint:disable-next-line:no-any
  clickable: any;
  // tslint:disable-next-line:no-any
  children: any;
  onOk(cb: () => void): void;
  // tslint:disable-next-line:no-any
  onCancel?: any;
  // tslint:disable-next-line:no-any
  modalUnMountFun?: any;
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
        visible: false,
      });
    }
  };

  componentDidMount(): void {
    if (this.props.modalUnMountFun) {
      this.props.modalUnMountFun();
    }
  }

  render(): JSX.Element {
    // eslint-disable-next-line no-unused-vars
    const { clickable, children, onOk, ...otherProps } = this.props;
    const { visible } = this.state;

    return (
      <div>
        {/* tslint:disable-next-line:react-a11y-event-has-role */}
        <div onClick={() => this.setState({ visible: true })}>{clickable}</div>
        <CommonModal
          onCancel={() => this.onCancel()}
          onOk={() => this.onOk()}
          visible={visible}
          {...otherProps}
        >
          {children}
        </CommonModal>
      </div>
    );
  }
}
