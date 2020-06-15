// @flow
import { styled } from "onefx/lib/styletron-react";
import React from "react";

const LEN = "100%";

type PropTypes = {
  url: string;

  width?: string;
  height?: string;
  margin?: string;
};

export function ImageIcon({
  width = LEN,
  height = LEN,
  url,
  margin = "0"
}: PropTypes): JSX.Element {
  const StyledDiv = styled("img", {
    margin
  });

  return <StyledDiv src={url} width={width} height={height} />;
}

export function ImageIcon({
  width = LEN,
  height = LEN,
  url,
  margin = "0"
}: PropTypes) {
  const StyledDiv = styled("img", {
    margin
  });

  return <StyledDiv src={url} width={width} height={height} />;
}
