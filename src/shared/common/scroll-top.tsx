// @ts-ignore
import { RouteComponentProps, withRouter } from "onefx/lib/react-router";
import React from "react";

type PathParamsType = {
  hash: string;
};

type Props = RouteComponentProps<PathParamsType> & {
  children: Array<JSX.Element> | JSX.Element;
};

class ScrollToTopComponent extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }
  public componentDidUpdate(preProps: Props): void {
    if (preProps.location.pathname !== this.props.location.pathname) {
      window.document.documentElement.scrollTop = 0;
      // @ts-ignore
      // tslint:disable-next-line:no-unused-expression
      window.ga && window.ga("send", "pageview");
    }
  }
  public render(): Array<JSX.Element> | JSX.Element {
    return this.props.children;
  }
}

export const ScrollToTop = withRouter(ScrollToTopComponent);
