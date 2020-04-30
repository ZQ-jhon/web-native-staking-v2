export const PALM_WIDTH = 575;

export const media = {
  palm: `@media only screen and (max-width: ${PALM_WIDTH}px)`,
  lap: `@media only screen and (min-width: ${PALM_WIDTH}px) and (max-width: 768px)`,
  desk: "@media only screen and (min-width: 769px) and (max-width: 1280px)",
  deskWide: "@media only screen and (min-width: 1281px)",
  media769to960:
    "@media only screen and (min-width: 769px) and (max-width: 960px)",
  media769to1100:
    "@media only screen and (min-width: 769px) and (max-width: 1100px)",
  media1101to1280:
    "@media only screen and (min-width: 1101px) and (max-width: 1280px)",
  media1320less: `@media only screen and (min-width: ${PALM_WIDTH}px) and (max-width: 1319px)`,
  media1320: "@media only screen and (min-width: 1320px)",
  media1440: "@media only screen and (min-width: 1440px)",
  media700: "@media only screen and (max-width: 700px)",
  media1100: "@media only screen and (max-width: 1100px)",
  media1024: "@media only screen and (max-width: 1024px)"
};

export const fullOnPalm = {
  [media.palm]: {
    width: "100%"
  }
};
