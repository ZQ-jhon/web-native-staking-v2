import { assetURL } from "onefx/lib/asset-url";
import { t } from "onefx/lib/iso-i18n";
import Helmet from "onefx/lib/react-helmet";
// @ts-ignore
import { styled } from "onefx/lib/styletron-react";
import { PureComponent } from "react";
import React from "react";
import { Flex } from "./flex";
import { FOOTER_ABOVE } from "./footer";
import { colors } from "./styles/style-color";
import { fullOnPalm } from "./styles/style-media";
import { ContentPadding } from "./styles/style-padding";

type Props = {
  bar: string;
  title: string;
  info: string;
};

export class ErrorPage extends PureComponent<Props> {
  public render(): JSX.Element {
    const { bar, title, info } = this.props;
    return (
      <ContentPadding style={{ backgroundColor: colors.black10 }}>
        <Helmet title={`${bar} - ${t("topbar.brand")}`} />
        <Flex {...FOOTER_ABOVE} center={true}>
          <Image src={assetURL("favicon.svg")} />
          <Flex column={true} margin={"8px"}>
            <h1>{title}</h1>
            <div>{info}</div>
          </Flex>
        </Flex>
      </ContentPadding>
    );
  }
}

const Image = styled("img", {
  maxWidth: "160px",
  ...fullOnPalm
});
