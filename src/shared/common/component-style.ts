// @flow
import { styled } from "onefx/lib/styletron-react";
import { colors } from "./styles/style-color2";
import { fonts } from "./styles/style-font";

export const KeySpan = styled("span", {
  fontSize: "12px",
  color: colors.black80
});

export const ValueSpan = styled("span", () => ({
  fontSize: "14px",
  color: colors.black,
  wordBreak: "break-word"
}));

export const RootStyle = styled("div", () => ({
  ...fonts.body,
  backgroundColor: colors.white,
  color: colors.text01,
  textRendering: "optimizeLegibility"
}));

export const GreySpan = styled("span", {
  color: "grey"
});
