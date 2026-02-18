
import { Proxies } from "../../support/proxies.js";


/**
 * create a new FakeTextFinder instance
 * @param  {...any} args
 * @returns {FakeTextFinder}
 */
export const newFakeTextFinder = (...args) => {
  return Proxies.guard(new FakeTextFinder(...args));
};

/**
 * basic fake FakeTextFinder
 * ref: https://developers.google.com/apps-script/reference/spreadsheet/text-finder
 * @class FakeTextFinder
 */
export class FakeTextFinder {
  /**
   * @constructor
   * @param {Spreadsheet|Sheet|Range} spreadsheet
   * @param {String} text
   * @returns {FakeTextFinder}
   */
  constructor(obj, text) {
    this.spreadsheet = false;
    this.sheet = false;
    this.range = false;
    if (obj.toString() == "Spreadsheet") {
      this.spreadsheet = obj;
    } else if (obj.toString() == "Sheet") {
      this.sheet = obj;
    } else if (obj.toString() == "Range") {
      this.range = obj;
    }
    this.text = text;
    this.object = {};
    this.count = 0;
    this.searchResults = [];
    this.usefindNext = false;
    this.usefindPrevious = false;
  }

  findAll() {
    this.__searchText();
    return this.searchResults;
  }

  findNext() {
    if (this.searchResults.length == 0) {
      this.__searchText();
    }
    return this.searchResults[this.count++] || null;
  }

  findPrevious() {
    if (this.searchResults.length == 0) {
      this.__searchText();
    }
    return (
      this.searchResults[
      this.count == 0 ? this.searchResults.length - 1 : --this.count
      ] || null
    );
  }

  getCurrentMatch() {
    if (this.searchResults.length == 0) {
      return null;
    }
    if (!this.usefindNext && !this.usefindPrevious) {
      return null;
    }
    return this.searchResults[this.count];
  }

  ignoreDiacritics(ignoreDiacritics) {
    this.object.ignoreDiacritics = ignoreDiacritics;
    return this;
  }

  matchCase(matchCase) {
    this.object.matchCase = matchCase;
    return this;
  }

  matchEntireCell(matchEntireCell) {
    this.object.matchEntireCell = matchEntireCell;
    return this;
  }

  matchFormulaText(matchFormulaText) {
    this.object.matchFormulaText = matchFormulaText;
    return this;
  }

  replaceAllWith(replaceText) {
    return this.__findReplace({
      spreadsheet: this.spreadsheet,
      sheet: this.sheet,
      range: this.range,
      replaceText,
    });
  }

  replaceWith(replaceText) {
    if (this.searchResults.length == 0) {
      this.__searchText();
    }
    if (this.searchResults.length > 0) {
      return this.__findReplace({
        spreadsheet: false,
        sheet: false,
        range: this.searchResults[0],
        replaceText,
      });
    }
    return 0;
  }

  startFrom(startRange) {
    this.object.startFrom = startRange;
    return this;
  }

  toString() {
    return "TextFinder";
  }

  useRegularExpression(useRegEx) {
    this.object.useRegularExpression = useRegEx;
    return this;
  }

  __searchText() {
    if (!!this.spreadsheet) {
      this.searchResults = this.spreadsheet.getSheets().reduce((ar1, sheet) => {
        const temp = this.__searchTextFromRange(sheet, sheet.getDataRange());
        return [...ar1, ...temp];
      }, []);
    } else if (!!this.sheet) {
      this.searchResults = this.__searchTextFromRange(
        this.sheet,
        this.sheet.getDataRange()
      );
    } else if (!!this.range) {
      this.searchResults = this.__searchTextFromRange(
        this.range.getSheet(),
        this.range
      );
    }
  }

  __searchTextFromRange(sheet, range) {
    const {
      ignoreDiacritics = false,
      matchCase = false,
      matchEntireCell = false,
      matchFormulaText = false,
      startFrom,
      useRegularExpression = false,
    } = this.object;
    let startRowCol = null;
    if (startFrom) {
      startRowCol = {
        row: startForm.getRow(),
        col: startForm.getColumn(),
      };
    }
    const offsetRow = range.getRow() - 1;
    const offsetCol = range.getColumn() - 1;

    const values = matchFormulaText
      ? range.getFormulas()
      : range.getDisplayValues();

    return values.reduce((ar2, r, i) => {
      if (startRowCol && i < startRowCol.row) {
        return ar2;
      }
      r.forEach((c, j) => {
        if (startRowCol && j < startRowCol.col) {
          return;
        }
        let res = false;
        let target = c;
        if (ignoreDiacritics) {
          target = c.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        }
        if (!matchCase) {
          if (typeof c !== 'string') {
            c = String(c);
          }
          target = c.toLowerCase();
          this.text = this.text.toLowerCase();
        }
        if (useRegularExpression && matchEntireCell) {
          let rr = this.text;
          if (rr[0] != "^") {
            rr = rr.replace(/^/, "^");
          }
          if (rr[rr.length - 1] != "$") {
            rr = rr.replace(/$/, "$");
          }
          const reg = new RegExp(rr);
          if (reg.test(target)) {
            res = true;
          }
        } else if (useRegularExpression && !matchEntireCell) {
          const reg = new RegExp(this.text);
          if (reg.test(target)) {
            res = true;
          }
        } else if (!useRegularExpression && matchEntireCell) {
          if (target == this.text) {
            res = true;
          }
        } else {
          // if (target.includes(this.text)) {
          if (new RegExp(this.text).test(target)) {
            res = true;
          }
        }

        if (res) {
          ar2.push(sheet.getRange(offsetRow + i + 1, offsetCol + j + 1));
        }
      });
      return ar2;
    }, []);
  }

  __findReplace({
    spreadsheet = false,
    sheet = false,
    range = false,
    replaceText,
  }) {
    const findReplace = {
      find: this.text,
      replacement: replaceText,
      allSheets: !!spreadsheet,
      matchCase: this.object.matchCase,
      matchEntireCell: this.object.matchEntireCell,
      includeFormulas: this.object.matchFormulaText,
      searchByRegex: this.object.useRegularExpression,
    };
    if (!!sheet) {
      findReplace.sheetId = sheet.getSheetId();
      delete findReplace.allSheets;
    } else if (!!range) {
      const row = range.getRow() - 1;
      const col = range.getColumn() - 1;
      findReplace.range = {
        sheetId: range.getSheet().getSheetId(),
        startRowIndex: row,
        endRowIndex: row + range.getNumRows(),
        startColumnIndex: col,
        endColumnIndex: col + range.getNumColumns(),
      };
      delete findReplace.allSheets;
    }
    let spreadsheetId;
    if (!!spreadsheet) {
      spreadsheetId = spreadsheet.getId();
    } else if (!!sheet) {
      spreadsheetId = sheet.getParent().getId();
    } else if (!!range) {
      spreadsheetId = range.getSheet().getParent().getId();
    }
    const response = Sheets.Spreadsheets.batchUpdate(
      { requests: [{ findReplace }] },
      spreadsheetId
    );
    return response.replies[0]?.findReplace?.valuesChanged || 0;
  }
}
