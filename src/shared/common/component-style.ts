// @flow
import { styled } from "onefx/lib/styletron-react";
import { colors } from "./styles/style-color2";

export const KeySpan = styled("span", {
  fontSize: "12px",
  color: colors.black80
});

export const ValueSpan = styled("span", () => ({
  fontSize: "14px",
  color: colors.black,
  wordBreak: "break-word"
}));
