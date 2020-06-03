//@ts-ignore
export function getExpireEpoch(minutes) {
  return Date.now() + minutes * 60 * 1000;
}

//@ts-ignore
export function getExpireEpochDays(days) {
  return Date.now() + days * 24 * 60 * 60 * 1000;
}
