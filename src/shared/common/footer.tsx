// @ts-ignore
import Footer, { FOOTER_HEIGHT } from "iotex-react-footer";
import React from "react";
import { TOP_BAR_HEIGHT } from "./top-bar";

export { FOOTER_HEIGHT };

export const FOOTER_ABOVE = {
  minHeight: `calc(100vh - ${FOOTER_HEIGHT + TOP_BAR_HEIGHT}px)`
};

export function Footer(): JSX.Element {
  return <Footer />;
}
