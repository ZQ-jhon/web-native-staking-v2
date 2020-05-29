import { t } from "onefx/lib/iso-i18n";
// @ts-ignore
import window from "global/window";

export const STAKE_DURATION_MAX_VALUE = 14 * 24;

export const STAKE_DURATION_MAX_VALUE_ON_KOVAN = 14 * 24;

/* tslint:disable-next-line:no-any */
const isStakeDurationInvalid = (value: any, maxValue: any) => {
  return value < 0 || value > maxValue || value % 7 !== 0;
};

/* tslint:disable-next-line:no-any */
export const validateStakeDuration = (maxValue: any) => (_rule: any, value: any, callback: any) => {
  if (isStakeDurationInvalid(value, maxValue)) {
    callback(t("my_stake.stakeDuration.err", { maxValue }));
  } else {
    callback();
  }
};

export const validateRestakeDuration = (
  /* tslint:disable-next-line:no-any */
  stakeDuration: any, stakeTime: any, nonDecay: any, maxValue: any
  /* tslint:disable-next-line:no-any */
) => (_rule: any, value: any, callback: Function) => {
  const isRestateInvalid = nonDecay
    ? value < stakeDuration
    : value * 24 * 3600 + Date.now() < stakeDuration * 24 * 3600 + stakeTime;

  if (isStakeDurationInvalid(value, maxValue)) {
    callback(t("my_stake.stakeDuration.err", { maxValue }));
  } else if (isRestateInvalid) {
    callback(t("my_stake.restakeDuration.err"));
  } else {
    callback();
  }
};

/* tslint:disable-next-line:no-any */
export const largerOrEqualTo = (num: any) => (_rule: any, value: any, callback: Function) => {
  if (value < num) {
    callback(t("my_stake.largerOrEqualTo.err", { num }));
  } else {
    callback();
  }
};

/* tslint:disable-next-line:no-any */
export const validateIoAddress = (_rule: any, value: any, callback: Function) => {
  if (
    value &&
    (String(value).length !== 41 || !String(value).startsWith("io"))
  ) {
    callback(t("my_stake.ioAddress.err"));
  } else {
    callback();
  }
};

/* tslint:disable-next-line:no-any */
export const validateCanName = (_rule: any, value: any, callback: Function) => {
  const reg = /^[a-z\d#]+$/;
  if (String(value).length > 12 || !reg.test(value)) {
    callback(t("my_stake.canName.err"));
  } else {
    callback();
  }
};


/* tslint:disable-next-line:no-any */
export const validateAddress = (_rule: any, value: any, callback: Function) => {
  if (
    value &&
    (String(value).length !== 42 || !String(value).startsWith("0x"))
  ) {
    callback(t("faucet.address-invalid"));
  } else {
    callback();
  }
};

/* tslint:disable-next-line:no-any */
export const smallerOrEqualTo = (num: any, min: any) => (_rule: any, value: any, callback: Function) => {
  if (num < min) {
    callback(t("my_stake.smallerOrEqualTo.err0", { num, min }));
  } else if (value && value < min) {
    callback(t("my_stake.largerOrEqualTo.err", { num: min }));
  } else if (value && value > num) {
    callback(t("my_stake.smallerOrEqualTo.err", { num }));
  } else {
    callback();
  }
};

/* tslint:disable-next-line:no-any */
export function validateJSON(_rule: any, value: any, callback: Function) {
  try {
    JSON.parse(value);
    callback();
  } catch (e) {
    callback("invalid JSON format");
  }
}

/* tslint:disable-next-line:no-any */
export const validateEthOrIoAddress = (_rule: any, value: any, callback: Function) => {
  if (
    value &&
    (String(value).length !== 41 || !String(value).startsWith("io")) &&
    (String(value).length !== 42 || !String(value).startsWith("0x"))
  ) {
    callback(t("faucet.address-invalid"));
  } else {
    callback();
  }
};

/* tslint:disable-next-line:no-any */
export const validateHash = (_rule: any, value: any, callback: Function) => {
  if (value && String(value).length !== 64) {
    callback(t("tools.hash_invalid"));
  } else {
    callback();
  }
};

/* tslint:disable-next-line:no-any */
export const hasError = (fieldsError: any) =>
  Object.keys(fieldsError).some(field => fieldsError[field]);

  /* tslint:disable-next-line:no-any */
export const validateMaxEpochCount = (max: any) => (_rule: any, value: any, callback: Function) => {
  if (value > max) {
    callback(t("tools.maxEpochCountError", { max }));
  } else {
    callback();
  }
};

export const getStakeDurationMaxValue = () => {
  const net =
    window.web3 && window.web3.currentProvider.networkVersion === "42"
      ? "kovan"
      : "main";
  const isMainNet = net === "main";
  return isMainNet
    ? STAKE_DURATION_MAX_VALUE
    : STAKE_DURATION_MAX_VALUE_ON_KOVAN;
};
