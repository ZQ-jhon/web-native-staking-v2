//@ts-ignore
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
//@ts-ignore
const dateFormat = require("dateformat");

module.exports = {
  validateId: (str: string) => {
    return /^[a-zA-Z0-9\-_]+$/i.test(str);
  },
  md5,
  makeGravatar: (str: string) => {
    return `http://www.gravatar.com/avatar/${md5(str)}?size=48`;
  },
  bhash: (str: string) => {
    return bcrypt.hash(str, 10);
  },
  bcompare: (str: string, hash: any) => {
    return bcrypt.compare(str, hash);
  },
  formatDate: (date: Date, friendly: string) => {
    if (friendly) {
      //@ts-ignore
      return date.fromNow();
    }
    return dateFormat(date, "YYYY-MM-DD HH:mm");
  },
};

//@ts-ignore
function md5(str) {
  //@ts-ignore
  return crypto.createHash("md5").update(str).digest("hex");
}
