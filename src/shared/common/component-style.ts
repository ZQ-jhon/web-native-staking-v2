// @flow
import { styled } from "onefx/lib/styletron-react";
import { CSSProperties } from "react";
import { colors } from "./styles/style-color2";
import { fonts } from "./styles/style-font";

export const KeySpan = styled("span", {
  fontSize: "12px",
  color: colors.black80,
});

export const ValueSpan = styled("span", () => ({
  fontSize: "14px",
  color: colors.black,
  wordBreak: "break-word",
}));

export const RootStyle = styled("div", () => ({
  ...fonts.body,
  backgroundColor: colors.white,
  color: colors.text01,
  textRendering: "optimizeLegibility",
}));

export const GreySpan = styled("span", {
  color: "grey",
});

export const shareStyle: CSSProperties = {
  width: "100%",
  height: "auto",
  marginTop: "30px",
  padding: "12px 0",
  backgroundColor: "#ffbc00",
  fontWeight: "bold",
  fontSize: "20px",
  borderColor: "unset",
};

export const stakeBadgeStyle: CSSProperties = {
  color: colors.black95,
  borderColor: colors.grayText44,
  padding: "1px 9px",
  marginRight: "4px",
};

export const BannerImg = styled("img", () => ({
  width: "100%",
}));

export const Title = styled("span", (props) => ({
  fontWeight: "bold",
  lineHeight: "1.36",
  fontSize: "14px",
  ...props,
}));
