import { validateAddress } from "iotex-antenna/lib/account/utils";
// @ts-ignore
import { t } from "onefx/lib/iso-i18n";

export const STAKE_DURATION_MAX_VALUE = 1050;

// @ts-ignore
export const validateCanName = (rule, value, callback) => {
  const reg = /^[a-z\d#]+$/;
  if (String(value).length > 12 || !reg.test(value)) {
    callback(t("my_stake.canName.err"));
  } else {
    callback();
  }
};
//@ts-ignore
export const validateIoAddress = (rule, value, callback) => {
  if (!validateAddress(value)) {
    callback(t("my_stake.ioAddress.err"));
  } else {
    callback();
  }
};

//@ts-ignore
export const smallerOrEqualTo = (num, min, minText?: string) => (rule, value, callback) => {
  if (num < min) {
    callback(t("my_stake.smallerOrEqualTo.err0", { num, min }));
  } else if (value && value < min) {
    callback(
      minText ? minText : t("my_stake.largerOrEqualTo.err", { num: min })
    );
  } else if (value && value > num) {
    callback(t("my_stake.smallerOrEqualTo.err", { num }));
  } else {
    callback();
  }
};

const isStakeDurationInvalid = (value: number, maxValue: number) => {
  return value < 0 || value > maxValue;
};

export const validateStakeDuration = (maxValue: number, minValue?: number) => (
  // tslint:disable-next-line:variable-name no-any
  _: any,
  value: number,
  // tslint:disable-next-line:unified-signatures
  callback: { (arg0: string): void; (): void }
) => {
  if (minValue !== undefined && value < minValue) {
    // @ts-ignore
    callback(t("my_stake.largerOrEqualTo.err", { num: minValue }));
  } else if (isStakeDurationInvalid(value, maxValue)) {
    // @ts-ignore
    callback(t("my_stake.stakeDuration.err", { maxValue }));
  } else {
    callback();
  }
};

export const getStakeDurationMaxValue = () => {
  return STAKE_DURATION_MAX_VALUE;
};

// @ts-ignore
export const validateMaxEpochCount = (max: number) => (_, value, callback) => {
  if (value > max) {
    // @ts-ignore
    callback(t("tools.maxEpochCountError", { max }));
  } else {
    callback();
  }
};

// @ts-ignore
export const largerOrEqualTo = (num) => (rule, value, callback) => {
  if (value < num) {
    callback(t("my_stake.largerOrEqualTo.err", { num }));
  } else {
    callback();
  }
};
