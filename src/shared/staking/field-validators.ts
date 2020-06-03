// @ts-ignore
import { t } from "onefx/lib/iso-i18n";

export const STAKE_DURATION_MAX_VALUE = 14 * 24;

// @ts-ignore
export const validateCanName = (rule, value, callback) => {
  const reg = /^[a-z\d#]+$/;
  if (String(value).length > 12 || !reg.test(value)) {
    callback(t("my_stake.canName.err"));
  } else {
    callback();
  }
};

// @ts-ignore
export const smallerOrEqualTo = (num, min) => (rule, value, callback) => {
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

const isStakeDurationInvalid = (value: number, maxValue: number) => {
  return value < 0 || value > maxValue || value % 7 !== 0;
};

// tslint:disable-next-line:variable-name no-any
export const validateStakeDuration = (maxValue: number, minValue?: number) => (
  _rule: any,
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
