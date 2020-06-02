import React from "react";
import MarkdownIt from "markdown-it";
import { t } from "onefx/lib/iso-i18n";
import { PureComponent } from "react";
import { Flex } from "../common/flex";

const md = new MarkdownIt({
  linkify: true,
});

class Welcome extends PureComponent {
  render() {
    return (
      <Flex width="100%" column={true} alignItems="flex-start">
        <p dangerouslySetInnerHTML={getHtml(t("profile.welcome_text"))} />
      </Flex>
    );
  }
}

function getHtml(content: string) {
  return { __html: md.render(content) };
}

export { Welcome };
