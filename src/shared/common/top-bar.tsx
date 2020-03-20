// @ts-ignore
import document from "global/document";
// @ts-ignore
import window from "global/window";
import { assetURL } from "onefx/lib/asset-url";
import { styled } from "onefx/lib/styletron-react";
import React from "react";
import { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { Flex } from "./flex";
import { Cross } from "./icons/cross.svg";
import { Hamburger } from "./icons/hamburger.svg";
import { Image } from "./image";
import { colors } from "./styles/style-color";
import { media, PALM_WIDTH } from "./styles/style-media";
import { contentPadding } from "./styles/style-padding";
import { TopBarMenu, TopBarMobileMenu } from "./top-bar-menu";

export const TOP_BAR_HEIGHT = 75;
export const TOP_BAR_MARGIN = 32;

type State = {
  displayMobileMenu: boolean;
};
type Props = {
  eth?: string;
  // tslint:disable-next-line:no-any
  history?: any;
  userId?: string;
  faucetEnable?: boolean;
  displayWarning?: boolean;
  // tslint:disable-next-line:no-any
  updateTopBar?: any;
};

// @ts-ignore
@withRouter
// @ts-ignore
// tslint:disable-next-line:no-any
@connect((state: any) => ({
  faucetEnable: state.base.faucetEnable,
  displayWarning: state.base.displayWarning,
  updateTopBar: state.base.updateTopBar,
  eth: state.base.eth,
  userId: state.base.userId
}))
class TopBar extends Component<Props, State> {
  props: Props;

  // tslint:disable-next-line:no-any
  constructor(props: any) {
    super(props);
    this.state = {
      displayMobileMenu: false
    };
  }

  componentDidMount(): void {
    // @ts-ignore
    let resizeTimer = null;
    window.addEventListener("resize", () => {
      // @ts-ignore
      if (resizeTimer) {
        // @ts-ignore
        window.clearTimeout(resizeTimer);
      }
      resizeTimer = window.setTimeout(() => {
        if (
          document.documentElement &&
          document.documentElement.clientWidth > PALM_WIDTH
        ) {
          this.setState({
            displayMobileMenu: false
          });
        }
      }, 500);
    });
  }

  displayMobileMenu = () => {
    this.setState({
      displayMobileMenu: true
    });
  };

  hideMobileMenu = () => {
    this.setState({
      displayMobileMenu: false
    });
  };

  render(): JSX.Element {
    const displayMobileMenu = this.state.displayMobileMenu;
    const { history, faucetEnable, displayWarning } = this.props;
    const topheight = displayWarning ? TOP_BAR_MARGIN : 0;
    return (
      <div>
        {/*
        // @ts-ignore */}
        <Bar topheight={topheight}>
          <Flex alignItems={"center"} flexWrap={"nowrap"}>
            <Logo />
            <Flex>
              <Menu>
                {/*
        // @ts-ignore */}
                <TopBarMenu
                  history={history}
                  hideMobileMenu={this.hideMobileMenu}
                  faucetEnable={faucetEnable}
                />
              </Menu>
            </Flex>
          </Flex>
          <HamburgerBtn
            onClick={this.displayMobileMenu}
            displayMobileMenu={displayMobileMenu}
          >
            <Hamburger />
          </HamburgerBtn>
          <CrossBtn displayMobileMenu={displayMobileMenu}>
            <Cross />
          </CrossBtn>
        </Bar>
        {/*
        // @ts-ignore */}
        <BarPlaceholder topheight={topheight} />
        <TopBarMobileMenu
          displayMobileMenu={displayMobileMenu}
          history={history}
          hideMobileMenu={this.hideMobileMenu}
          faucetEnable={faucetEnable}
        />
      </div>
    );
  }
}

const Bar = styled("div", _ => ({
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  height: `${TOP_BAR_HEIGHT}px`,
  backgroundColor: colors.nav01,
  color: colors.white,
  position: "fixed",
  top: "0px",
  left: "0px",
  "z-index": "70",
  width: "100%",
  ...contentPadding,
  boxSizing: "border-box"
}));

const BarPlaceholder = styled("div", _ => {
  const height = TOP_BAR_HEIGHT / 2;
  return {
    display: "block",
    padding: `${height}px ${height}px ${height}px ${height}px`,
    backgroundColor: colors.nav01
  };
});

// tslint:disable-next-line:no-any
function HamburgerBtn({
  displayMobileMenu,
  children,
  onClick
}: // tslint:disable-next-line:no-any
any): JSX.Element {
  const Styled = styled("div", {
    ":hover": {
      color: colors.primary
    },
    display: "none!important",
    [media.palm]: {
      display: "flex!important",
      ...(displayMobileMenu ? { display: "none!important" } : {})
    },
    cursor: "pointer",
    justifyContent: "center"
  });
  return <Styled onClick={onClick}>{children}</Styled>;
}

// tslint:disable-next-line:no-any
function CrossBtn({ displayMobileMenu, children }: any): JSX.Element {
  const Styled = styled("div", {
    ":hover": {
      color: colors.primary
    },
    display: "none!important",
    [media.palm]: {
      display: "none!important",
      ...(displayMobileMenu ? { display: "flex!important" } : {})
    },
    cursor: "pointer",
    padding: "5px"
  });
  return <Styled>{children}</Styled>;
}

const LogoWrapper = styled("a", {
  width: "150px",
  height: "100%"
});
function Logo(): JSX.Element {
  return (
    <LogoWrapper href="//iotex.io/">
      <Image src={assetURL("logo.png")} width={"auto"} height={"35px"} />
    </LogoWrapper>
  );
}

const Menu = styled("div", {
  width: "100%",
  display: "flex!important",
  [media.palm]: {
    display: "none!important"
  }
});

export { TopBar };
