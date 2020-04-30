import { styled } from "onefx/lib/styletron-react";
import React from "react";

const LEN = "100%";

type PropTypes = {
  src: string;
  className?: string,
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
class CloudinaryImage {
  url: string;

  constructor(url: string) {
    this.url = url || "";
  }

  changeWidth(w: number): CloudinaryImage {
    return new CloudinaryImage(this.url.replace("upload", `upload/w_${w}`));
  }

  cdnUrl(): string {
    return this.url.replace("res.cloudinary.com", "imgc.iotex.io");
  }
}
export function cloudinaryImage(url: string): CloudinaryImage {
  return new CloudinaryImage(url);
}
