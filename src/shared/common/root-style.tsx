import { styled } from "onefx/lib/styletron-react";
import { fonts } from "./styles/style-font";
import { colors } from "./styles/style-color2";

export const RootStyle = styled("div", () => ({
  ...fonts.body,
  backgroundColor: colors.white,
  color: colors.text01,
  textRendering: "optimizeLegibility"
}));
