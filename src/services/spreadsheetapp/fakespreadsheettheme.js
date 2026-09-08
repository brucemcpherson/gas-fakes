import { Proxies } from "../../support/proxies.js";
import { signatureArgs } from "../../support/helpers.js";

export const newFakeSpreadsheetTheme = (...args) => {
  return Proxies.guard(new FakeSpreadsheetTheme(...args));
};

export class FakeSpreadsheetTheme {
  constructor(apiTheme) {
    this.__apiTheme = apiTheme || {
      primaryFontFamily: "Arial",
      themeColors: []
    };
  }

  getFontFamily() {
    const { nargs, matchThrow } = signatureArgs(arguments, "SpreadsheetTheme.getFontFamily");
    if (nargs) matchThrow();
    return this.__apiTheme.primaryFontFamily || "Arial";
  }

  setFontFamily(fontFamily) {
    const { nargs, matchThrow } = signatureArgs(arguments, "SpreadsheetTheme.setFontFamily");
    if (nargs !== 1) matchThrow();
    this.__apiTheme.primaryFontFamily = fontFamily;
    return this;
  }

  getThemeColors() {
    const { nargs, matchThrow } = signatureArgs(arguments, "SpreadsheetTheme.getThemeColors");
    if (nargs) matchThrow();
    const app = SpreadsheetApp;
    return app.ThemeColorType ? Object.values(app.ThemeColorType) : [];
  }

  getConcreteColor(themeColorType) {
    const { nargs, matchThrow } = signatureArgs(arguments, "SpreadsheetTheme.getConcreteColor");
    if (nargs !== 1) matchThrow();
    const app = SpreadsheetApp;
    if (app.newColor) {
      return app.newColor().setRgbColor("#000000").build();
    }
    return null;
  }

  setConcreteColor(themeColorType, colorOrRed, green, blue) {
    return this;
  }

  toString() {
    return "SpreadsheetTheme";
  }
}
