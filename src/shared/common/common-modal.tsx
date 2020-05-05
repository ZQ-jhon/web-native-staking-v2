// @flow
import { Modal } from "antd";
import React, { Component } from "react";
import { connect } from "react-redux";
import { TOP_BAR_HEIGHT } from "./top-bar";

type Props = {
  // tslint:disable-next-line:no-any
  children: any,
  // tslint:disable-next-line:no-any
  style?: any,
  isIoPay?: boolean
};
type State = {};

// @ts-ignore
@connect(state => ({ isIoPay: state.base.isIoPay }))
class CommonModal extends Component<Props, State> {
  state: State;
  props: Props;

  render(): JSX.Element {
    const { children, style, isIoPay = false, ...otherProps } = this.props;
    return (
      <Modal
        width={677}
        style={{
          top: isIoPay ? `${TOP_BAR_HEIGHT}px` : `${TOP_BAR_HEIGHT + 50}px`,
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
