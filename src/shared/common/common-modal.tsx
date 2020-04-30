import Modal from "antd/lib/modal";
import React, { Component } from "react";
import { connect } from "react-redux";
import { TOP_BAR_HEIGHT } from "./top-bar";

type Props = {
  children: JSX.Element | string;
  style?: Object;
  isIoPay?: boolean;
  title?: String | JSX.Element;
  okText?: String;
  cancelText?: String;
  visible: Boolean;
  // tslint:disable-next-line:no-any
  onOk: any;
  // tslint:disable-next-line:no-any
  onCancel: any;
};
type State = {};
// @ts-ignore
// tslint:disable-next-line:no-any
@connect((state: any) => ({ isIoPay: state.base.isIoPay }))
class CommonModal extends Component<Props, State> {
  state: State;
  props: Props;

  render(): JSX.Element {
    const { children, style, isIoPay = false, ...otherProps } = this.props;
    return (
      // @ts-ignore
      <Modal
        width={677}
        style={{
          top: isIoPay ? `${TOP_BAR_HEIGHT}px` : `${TOP_BAR_HEIGHT + 50}px`,
          marginBottom: `${TOP_BAR_HEIGHT * 2}px`,
          ...style
        }}
        {...otherProps}
      >
        {children}
      </Modal>
    );
  }
}

export { CommonModal };
