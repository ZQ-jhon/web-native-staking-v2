// @flow
import { t } from "onefx/lib/iso-i18n";
import { styled } from "onefx/lib/styletron-react";
import React from "react";
import { colors } from "./styles/style-color";

type PropTypes = {
  activeRoute?: string;
};

const tabStyle = {
  height: "37px",
  textAlign: "center",
  display: "inline-block",
  fontWeight: "700",
  marginRight: "15px"
};
const linkStyle = {
  fontSize: "12px"
};

type RoutingTabItem = {
  active: string;
  to: string;
  text: string;
};

const ROUTING_TABS: Array<RoutingTabItem> = [
  { active: "/", to: "/", text: "topbar.delegate_list" },
  { active: "/my-votes", to: "/my-votes", text: "topbar.my_votes" },
  { active: "/polls", to: "/polls", text: "topbar.poll_list" },
  { active: "/tools/", to: "/tools/multi-send", text: "tools.title" }
];

export function RoutingTab({ activeRoute = "" }: PropTypes): JSX.Element {
  return (
    <StyledSpan>
      {ROUTING_TABS.map(({ active, to, text }: RoutingTabItem) => (
        <TabSpan isActive={activeRoute === active} key={text}>
          <a
            href={to}
            style={{
              ...linkStyle,
              color: activeRoute === active ? colors.black : colors.black60
            }}
          >
            {t(text)}
          </a>
        </TabSpan>
      ))}
    </StyledSpan>
  );
}

// tslint:disable-next-line:no-any
function TabSpan({
  isActive,
  children
}: {
  isActive: boolean;
  // tslint:disable-next-line:no-any
  children: any;
}): JSX.Element {
  const Inner = styled(
    "span",
    // @ts-ignore
    () => ({
      ...tabStyle,
      ...(isActive
        ? {
            borderBottomWidth: "3px",
            borderBottomColor: colors.primary,
            borderBottomStyle: "solid"
          }
        : {}),
      whiteSpace: "nowrap"
    })
  );
  return <Inner>{children}</Inner>;
}

const StyledSpan = styled("span", {
  "@media (max-width: 1080px)": {
    display: "flex"
  }
});
