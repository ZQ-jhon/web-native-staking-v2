import { StyleObject } from "styletron-standard";

export const fontFamily =
  "Noto Sans,Helvetica Neue,sans-serif,Microsoft YaHei !important";

export const secondFontFamily =
  "\"Chinese Quote\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", \"PingFang SC\", \"Hiragino Sans GB\", \"Microsoft YaHei\", \"Helvetica Neue\", Helvetica, Arial, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\"";

export const fonts: { [key: string]: StyleObject } = {
  body: {
    fontFamily
  },
  h1: {
    fontSize: "3rem",
    color: "#152935",
    textTransform: "capitalize",
    fontWeight: 700,
    margin: "-1.15rem 0 0 -3px",
    padding: 0,
    transition: "250ms cubic-bezier(0.5, 0, 0.1, 1)"
  },
  textBox: {
    fontFamily,
    fontSize: "18px !important",
    fontWeight: 300
  },
  inputLabel: {
    fontFamily,
    fontSize: "14px",
    fontWeight: 700
  },
  inputError: {
    fontFamily,
    fontSize: "12px !important"
  }
};
