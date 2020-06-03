// @flow
// FIXME: move to a separate file?
export function isIotexAddressValid(str: string): boolean {
  if (typeof str !== "string") {
    return false;
  }

  if (!str) {
    return false;
  }

  return str.startsWith("io") && str.length === 41;
}
