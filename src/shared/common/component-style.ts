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

export const shareStyle = {
  width: "100%",
  height: "auto",
  marginTop: "30px",
  padding: "12px 0",
  backgroundColor: "#ffbc00",
  fontWeight: "bold",
  fontSize: "20px",
  borderColor: "unset"
};

export const Title = styled("span", props => ({
  fontWeight: "bold",
  lineHeight: "1.36",
  fontSize: "14px",
  ...props
}));

export const BannerImg = styled("img", () => ({
  width: "100%"
}));
