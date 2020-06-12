// @flow
import { Form } from "antd";
import { assetURL } from "onefx/lib/asset-url";
import { t } from "onefx/lib/iso-i18n";
import React from "react";
import { Flex } from "../../common/flex";
import { colors } from "../../common/styles/style-color2";

export function SuccessStep({
  txHash
}: {
  txHash: string;
  siteUrl: string;
}): JSX.Element {
  return (
    // @ts-ignore
    <Form layout={"vertical"}>
      <Flex
        column={true}
        fontSize={"14px"}
        alignItems={"baseline"}
        lineHeight={1.88}
        color={colors.black}
      >
        {
          // tslint:disable-next-line:react-no-dangerous-html
          <span
            dangerouslySetInnerHTML={{
              __html: t("my_stake.transaction_hash", {
                txHash,
                href: `https://iotexscan.io/action/${txHash}`
              })
            }}
            style={{ wordBreak: "break-word" }}
          />
        }
        <span
          dangerouslySetInnerHTML={{
            __html: t("my_stake.check_few_seconds", {
              href: assetURL("my-votes")
            })
          }}
        />
      </Flex>
    </Form>
  );
}
