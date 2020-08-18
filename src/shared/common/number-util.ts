export function numberWithCommas(n: string): string {
  return n
    .toString()
    .replace(/\,/g, "")
    .split(".")
    .map((part, index) =>
      index === 0 ? part.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : part
    )
    .join(".");
}

export function numberFromCommaString(n: string): string {
  return n.toString().replace(/\,/g, "");
}


export const secondsToDuration = (second: number|string) => {
  const d = Math.floor(Number(second));
  const day = Math.floor(d / (3600*24));
  const h = Math.floor(d % (3600*24)/ 3600);
  const m = Math.floor(d % 3600 / 60);
  const s = Math.floor(d % 3600 % 60);

  const texts = [];
  const dayDisplay = day > 0 ? day + (h === 1 ? "d" : "d") : "";
  const hDisplay = h > 0 ? h + (h === 1 ? "h" : "h") : "";
  const mDisplay = m > 0 ? m + (m === 1 ? "min" : "min") : "";
  const sDisplay = s > 0 ? s + (s === 1 ? "s" : "s") : "";
  if (dayDisplay) { texts.push(dayDisplay); }
  if (hDisplay) { texts.push(hDisplay); }
  if (mDisplay) { texts.push(mDisplay); }
  if (sDisplay) { texts.push(sDisplay); }
  return texts.join(" ");
}
