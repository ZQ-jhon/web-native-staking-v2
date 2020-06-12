// @flow
import { Modal } from "antd";
import React, { Component } from "react";
import { connect } from "react-redux";
import { TOP_BAR_HEIGHT } from "./top-bar";

type Props = {
  // tslint:disable-next-line:no-any
  children: any;
  // tslint:disable-next-line:no-any
  style?: any;
  isIoPayMobile?: boolean;
  title?: JSX.Element;
  okText?: string;
  cancelText?: string;
  visible?: boolean;
  // tslint:disable-next-line:no-any
} & any;
type State = {};

// @ts-ignore
@connect(state => ({ isIoPayMobile: state.base.isIoPayMobile }))
class CommonModal extends Component<Props, State> {
  state: State;
  props: Props;

  render(): JSX.Element {
    const {
      children,
      style,
      isIoPayMobile = false,
      ...otherProps
    } = this.props;
    return (
      <Modal
        width={677}
        style={{
          top: isIoPayMobile
            ? `${TOP_BAR_HEIGHT}px`
            : `${TOP_BAR_HEIGHT + 50}px`,
          // tslint:disable-next-line:binary-expression-operand-order
          marginBottom: `${2 * TOP_BAR_HEIGHT}px`,
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
