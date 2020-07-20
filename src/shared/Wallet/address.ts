import bech32 from "bech32";

export function toIoTeXAddress(ethAddress: string): string {
  if (!ethAddress.startsWith("0x")) {
    throw new Error("invalid ETH address prefix");
  }
  const payload = Buffer.from(ethAddress.substr(2), "hex");
  const grouped = bech32.toWords(payload);
  return bech32.encode("io", grouped);
}
