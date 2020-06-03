// @flow
import { styled } from "onefx/lib/styletron-react";
import { colors } from "./styles/style-color2";

export const KeySpan = styled("span", {
  fontSize: "12px",
  color: colors.black80
});


export const BoldText = styled("b", {
  fontSize: "12px"
});

export const CellSpan = styled("span", {
  fontSize: "12px",
  color: colors.black,
  padding: "3px 0"
});

export const TimeSpan = styled("span", {
  fontSize: "10px",
  color: colors.black80
});

export const StatisticSpan = styled("span", {
  fontSize: "10px",
  color: colors.black80
});

export const StatisticValue = styled("span", {
  fontSize: "10px",
  color: colors.black95
});

export const LabelText = styled("span", props => ({
  fontSize: "14px",
  marginBottom: "24px",
  wordBreak: "break-word",
  ...props
}));

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
