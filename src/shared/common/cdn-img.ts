// @flow
export function cdnImg(img: string): string {
  if (/res.cloudinary.com/.test(img)) {
    return img.replace("res.cloudinary.com", "imgc.iotex.io");
  }
  return img;
}
