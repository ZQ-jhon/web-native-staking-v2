// @ts-ignore
import window from "global/window";
import { t } from "onefx/lib/iso-i18n";
import { styled } from "onefx/lib/styletron-react";
import React from "react";
import OutsideClickHandler from "react-outside-click-handler";
// @ts-ignore
import shader from "shader";
import { transition } from "./styles/style-animation";
import { colors } from "./styles/style-color";
import { media } from "./styles/style-media";
import { contentPadding } from "./styles/style-padding";

export const TOP_BAR_HEIGHT = 75;
export const TOP_BAR_MARGIN = 32;

const minWitdh = { minWidth: 60 };
const actived = { color: colors.white, ...minWitdh };
const inactived = { ...minWitdh, textDecoration: "none" };

// tslint:disable-next-line:no-any
export const TopBarMenu = ({ hideMobileMenu, faucetEnable }: any) => {
  const pathname = window && window.location && window.location.pathname;
  const profileStyle = { minWitdh: "30px" };
  const aStyle =
    String(pathname) === "/" ||
    String(pathname) === "/my-votes" ||
    String(pathname) === "/my-referrals"
      ? actived
      : inactived;
  const a1Style = String(pathname).startsWith("/profile/")
    ? { ...actived, ...profileStyle }
    : { ...inactived, ...profileStyle };
  const a2Style = String(pathname).startsWith("/v2/")
    ? { ...actived, ...profileStyle }
    : { ...inactived, ...profileStyle };

  const menu = [
    <A key={0} href="/" style={aStyle} onClick={hideMobileMenu}>
      V1
    </A>,
    <A key={4} href="/v2/" style={a2Style} onClick={hideMobileMenu}>
      V2
    </A>,
    <A key={1} href="/profile/" style={a1Style} onClick={hideMobileMenu}>
      {t("topbar.i_am_a_delegate")}
    </A>,
    <A
      key={2}
      href="https://www.iotex.io/vita"
      target="_blank"
      style={inactived}
    >
      {t("topbar.vita")}
    </A>,
    <A
      key={3}
      href="https://support.iotex.io/"
      target="_blank"
      style={inactived}
    >
      {t("topbar.support")}
    </A>
  ];

  let key = 4;
  const aFStyle = String(pathname).startsWith("/faucet/") ? actived : inactived;
  if (faucetEnable) {
    menu.push(
      <A key={key} href="/faucet/" style={aFStyle} onClick={hideMobileMenu}>
        {t("topbar.faucet")}
      </A>
    );
    key++;
  }

  return menu;
};

export const TopBarMobileMenu = ({
  displayMobileMenu,
  history,
  hideMobileMenu,
  faucetEnable
}: // tslint:disable-next-line:no-any
any) => {
  if (!displayMobileMenu) {
    return null;
  }

  return (
    <OutsideClickHandler onOutsideClick={hideMobileMenu}>
      <Dropdown>
        {/*
        // @ts-ignore */}
        <TopBarMenu
          history={history}
          hideMobileMenu={hideMobileMenu}
          faucetEnable={faucetEnable}
        />
      </Dropdown>
    </OutsideClickHandler>
  );
};

const menuItem = {
  color: shader(colors.white, -0.5),
  marginLeft: "14px",
  textDecoration: "none",
  ":hover": {
    color: colors.primary
  },
  transition,
  fontWeight: "bold",
  [media.palm]: {
    boxSizing: "border-box",
    width: "100%",
    padding: "16px 0 16px 0",
    borderBottom: "1px #EDEDED solid"
  }
};
// @ts-ignore
const A = styled("a", menuItem);

const Dropdown = styled("div", {
  backgroundColor: colors.nav01,
  display: "flex",
  flexDirection: "column",
  ...contentPadding,
  position: "fixed",
  top: TOP_BAR_HEIGHT,
  "z-index": "1",
  width: "100vw",
  height: "100vh",
  alignItems: "flex-end!important",
  boxSizing: "border-box"
});
