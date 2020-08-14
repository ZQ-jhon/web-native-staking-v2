import BN from "bn.js";
import _ from "underscore";
import utf8 from "utf8";
// tslint:disable-next-line:no-var-requires
const numberToBN = require("number-to-bn");

export function numberToHex(value: string | number): string {
  if (_.isNull(value) || _.isUndefined(value)) {
    return typeof value === "number" ? value.toString() : value;
  }

  // @ts-ignore
  if (!isFinite(value) && !isHexStrict(value)) {
    throw new Error(`Given input "${value}" is not a number.`);
  }

  const numberBN = toBN(value);
  const result = numberBN.toString(16);

  return numberBN.lt(new BN(0)) ? `-0x${result.substr(1)}` : `0x${result}`;
}

export function isHexStrict(hex: string | number): boolean {
  // @ts-ignore
  return (_.isString(hex) || _.isNumber(hex)) && /^(-)?0x[0-9a-f]*$/i.test(hex);
}

// tslint:disable-next-line:no-any
export function toBN(numberValue: string | number): any {
  try {
    return numberToBN.apply(null, arguments);
  } catch (e) {
    throw new Error(`${e} Given value: "${numberValue}"`);
  }
}

export function utf8ToHex(aStr: string): string {
  let str = utf8.encode(aStr);
  let hex = "";

  // remove \u0000 padding from either side
  str = str.replace(/^(?:\u0000)*/, "");
  str = str
    .split("")
    .reverse()
    .join("");
  str = str.replace(/^(?:\u0000)*/, "");
  str = str
    .split("")
    .reverse()
    .join("");

  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    const n = code.toString(16);
    hex += n.length < 2 ? `0${n}` : n;
  }

  return `0x${hex}`;
}

export function hexToUtf8(aHex: string): string {
  if (!isHexStrict(aHex)) {
    throw new Error(`The parameter "${aHex}" must be a valid HEX string.`);
  }

  let str = "";
  let code = 0;
  let hex = aHex.replace(/^0x/i, "");

  // remove 00 padding from either side
  hex = hex.replace(/^(?:00)*/, "");
  hex = hex
    .split("")
    .reverse()
    .join("");
  hex = hex.replace(/^(?:00)*/, "");
  hex = hex
    .split("")
    .reverse()
    .join("");

  const l = hex.length;

  for (let i = 0; i < l; i += 2) {
    code = parseInt(hex.substr(i, 2), 16);
    // if (code !== 0) {
    str += String.fromCharCode(code);
    // }
  }

  return utf8.decode(str);
}


export function utf8ToHex2(aStr: string): string {
  let str = utf8.encode(aStr);
  let hex = "";

  // remove \u0000 padding from either side
  str = str.replace(/^(?:\u0000)*/, "");
  str = str
    .split("")
    .reverse()
    .join("");
  str = str.replace(/^(?:\u0000)*/, "");
  str = str
    .split("")
    .reverse()
    .join("");

  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if(code===0x5c&&i<str.length-1){
      const next = str.charCodeAt(i+1);
      if (next===0x22){
        continue;
      }
    }
    const n = code.toString(16);
    hex += n.length < 2 ? `0${n}` : n;
  }

  return `0x${hex}`;
}


export function serializeBuffer(payload: object): Uint8Array {
  const start = Buffer.from("{");
  const list = [start];
  const keys = Object.keys(payload);
  keys.forEach((key, index)=>{
    const bKey = Buffer.from(String.fromCharCode(0x22)+key+String.fromCharCode(0x22)+String.fromCharCode(0x3a));
    list.push(bKey);
    // @ts-ignore
    const value = payload[key];
    if(typeof value === "number"){
      list.push(Buffer.from(`${value}`));
    } else if(typeof value === "string"){
      list.push(Buffer.from(String.fromCharCode(0x22)+value+String.fromCharCode(0x22)));
    }
    if(index<keys.length-1){
      list.push(Buffer.from(","));
    }
  });
  list.push(Buffer.from("}"))
  return Buffer.concat(list);
}
