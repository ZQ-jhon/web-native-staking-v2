import { styled } from "onefx/lib/styletron-react";
import React from "react";

const LEN = "100%";

type PropTypes = {
  src: string;
  width?: string;
  height?: string;
  resizeWidth?: number;
  // tslint:disable-next-line:no-any
  style?: any;
  // tslint:disable-next-line:no-any
  children?: any;
};

export function Image({
  width = LEN,
  height = LEN,
  src,
  resizeWidth,
  children,
  style,
  ...props
}: PropTypes): JSX.Element {
  if (children) {
    const StyledDiv = styled("div", {
      backgroundImage: `url("${src}")`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      backgroundSize: "contain",
      boxSizing: "border-box",
      width,
      height,
      ...style
    });
    return <StyledDiv {...props}>{children}</StyledDiv>;
  }
  const StyledImg = styled("img", style);
  return <StyledImg {...props} width={width} height={height} src={src} />;
}
