import { t } from "onefx/lib/iso-i18n";
import { PureComponent } from "react";
import React from "react";
import { Flex } from "../../common/flex";

class Welcome extends PureComponent {
  render(): JSX.Element {
    return (
      <Flex width="100%" column={true} alignItems="flex-start">
        {<p dangerouslySetInnerHTML={{ __html: t("profile.welcome_text") }} />}
      </Flex>
    );
  }
}

export { Welcome };
