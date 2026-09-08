// all these imports
// this is loaded by npm, but is a library on Apps Script side

import is from "@sindresorhus/is";
import '@mcpher/gas-fakes'

// all the fake services are here
//import '@mcpher/gas-fakes/main.js'

import { initTests } from "./testinit.js";

import {
  prepareTarget,
  eString,
  maketss,
  rgbToHex,
  getRandomRgb,
  getRandomHex,
  getStuff,
  fillRange,
  fillRangeFromDomain,
  isEnum,
  BLACK,
  cachePerformance,
  trasher,
  wrapupTest
} from "./testassist.js";

// this can run standalone, or as part of combined tests if result of inittests is passed over
export const testSheetsFormatting = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();


  unit.section("rich text tests", (t) => {
    const { sheet } = maketss("rich text tests", toTrash, fixes);

    // Test 1: single rich text value
    const range1 = sheet.getRange("A1");
    const boldStyle = SpreadsheetApp.newTextStyle().setBold(true).build();
    const italicStyle = SpreadsheetApp.newTextStyle().setItalic(true).build();

    const richTextValue = SpreadsheetApp.newRichTextValue()
      .setText("Bold Italic Link")
      .setTextStyle(0, 4, boldStyle)
      .setTextStyle(5, 11, italicStyle)
      .setLinkUrl(12, 16, "https://google.com")
      .build();

    range1.setRichTextValue(richTextValue);

    const result1 = range1.getRichTextValue();
    t.is(result1.getText(), "Bold Italic Link", "Text should match");

    const runs1 = result1.getRuns();
    t.is(runs1.length, 5, "Should have 5 runs, including unstyled segments");

    // Check first run (Bold)
    t.is(runs1[0].getStartIndex(), 0, "Run 1 (Bold) start index");
    t.is(runs1[0].getEndIndex(), 4, "Run 1 (Bold) end index");
    t.true(runs1[0].getTextStyle().isBold(), "Run 1 should be bold");
    t.false(runs1[0].getTextStyle().isItalic(), "Run 1 should not be italic");
    t.is(runs1[0].getLinkUrl(), null, "Run 1 should not have a link");

    // Check second run (space)
    t.is(runs1[1].getStartIndex(), 4, "Run 2 (space) start index");
    t.is(runs1[1].getEndIndex(), 5, "Run 2 (space) end index");
    t.false(runs1[1].getTextStyle().isBold(), "Run 2 should not be bold");
    t.false(runs1[1].getTextStyle().isItalic(), "Run 2 should not be italic");
    t.is(runs1[1].getLinkUrl(), null, "Run 2 should not have a link");

    // Check third run (Italic)
    t.is(runs1[2].getStartIndex(), 5, "Run 3 (Italic) start index");
    t.is(runs1[2].getEndIndex(), 11, "Run 3 (Italic) end index");
    t.false(runs1[2].getTextStyle().isBold(), "Run 3 should not be bold");
    t.true(runs1[2].getTextStyle().isItalic(), "Run 3 should be italic");
    t.is(runs1[2].getLinkUrl(), null, "Run 3 should not have a link");

    // Check fourth run (space)
    t.is(runs1[3].getStartIndex(), 11, "Run 4 (space) start index");
    t.is(runs1[3].getEndIndex(), 12, "Run 4 (space) end index");
    t.false(runs1[3].getTextStyle().isBold(), "Run 4 should not be bold");
    t.false(runs1[3].getTextStyle().isItalic(), "Run 4 should not be italic");
    t.is(runs1[3].getLinkUrl(), null, "Run 4 should not have a link");

    // Check fifth run (Link)
    t.is(runs1[4].getStartIndex(), 12, "Run 5 (Link) start index");
    t.is(runs1[4].getEndIndex(), 16, "Run 5 (Link) end index");
    t.is(
      runs1[4].getLinkUrl(),
      "https://google.com",
      "Run 5 should have a link"
    );

    // Test 2: array of rich text values
    const range2 = sheet.getRange("B1:C2");
    const redColor = SpreadsheetApp.newColor().setRgbColor("#ff0000").build();
    const redStyle = SpreadsheetApp.newTextStyle()
      .setForegroundColorObject(redColor)
      .build();
    const blueStyle = SpreadsheetApp.newTextStyle()
      .setForegroundColor("#0000ff")
      .build();
    const underlineStyle = SpreadsheetApp.newTextStyle()
      .setUnderline(true)
      .build();
    const strikethroughStyle = SpreadsheetApp.newTextStyle()
      .setStrikethrough(true)
      .build();

    const values = [
      [
        SpreadsheetApp.newRichTextValue()
          .setText("Red")
          .setTextStyle(0, 3, redStyle)
          .build(),
        SpreadsheetApp.newRichTextValue()
          .setText("Blue")
          .setTextStyle(0, 4, blueStyle)
          .build(),
      ],
      [
        SpreadsheetApp.newRichTextValue()
          .setText("Underline")
          .setTextStyle(0, 9, underlineStyle)
          .build(),
        SpreadsheetApp.newRichTextValue()
          .setText("Strikethrough")
          .setTextStyle(0, 13, strikethroughStyle)
          .build(),
      ],
    ];

    range2.setRichTextValues(values);

    const results2 = range2.getRichTextValues();
    t.is(results2.length, 2, "Should have 2 rows");
    t.is(results2[0].length, 2, "Should have 2 columns in first row");

    t.is(results2[0][0].getText(), "Red", "B1 text");
    t.is(
      results2[0][0].getRuns()[0].getTextStyle().getForegroundColor(),
      "#ff0000",
      "B1 color"
    );

    t.is(results2[0][1].getText(), "Blue", "C1 text");
    t.is(
      results2[0][1].getRuns()[0].getTextStyle().getForegroundColor(),
      "#0000ff",
      "C1 color"
    );

    t.is(results2[1][0].getText(), "Underline", "B2 text");
    t.true(
      results2[1][0].getRuns()[0].getTextStyle().isUnderline(),
      "B2 underline"
    );

    t.is(results2[1][1].getText(), "Strikethrough", "C2 text");
    t.true(
      results2[1][1].getRuns()[0].getTextStyle().isStrikethrough(),
      "C2 strikethrough"
    );

    // Test 3: plain text cell
    const range3 = sheet.getRange("E5");
    range3.setValue("Plain text");

    const result3 = range3.getRichTextValue();
    t.is(result3.getText(), "Plain text", "Plain text should be preserved");
    t.is(
      result3.getRuns().length,
      1,
      "Should have one default run for plain text"
    );

    const style3 = result3.getTextStyle();
    t.false(style3.isBold(), "Default style should not be bold");
    t.is(style3.getFontSize(), 10, "Default font size should be 10");
    if (SpreadsheetApp.isFake) cachePerformance()
  });

  unit.section("exotic styles", (t) => {
    const { sheet } = maketss("exoticcellformats", toTrash, fixes);
    const startAt = sheet.getRange("b2:e5");

    const w1 = SpreadsheetApp.WrapStrategy.OVERFLOW;
    const rw1 = startAt.offset(10, 5);
    rw1.clearFormat();
    rw1.setWrapStrategy(w1);
    const wa1 = rw1.getWrapStrategy();
    t.is(wa1.compareTo(w1), 0);
    const wa2 = rw1.getWrapStrategies();
    wa2.flat().forEach((f) => t.is(f.toString(), w1.toString()));

    const rw2 = startAt.offset(11, 6);
    const w2 = fillRangeFromDomain(rw2, [
      SpreadsheetApp.WrapStrategy.WRAP,
      SpreadsheetApp.WrapStrategy.OVERFLOW,
      SpreadsheetApp.WrapStrategy.CLIP,
    ]);

    rw2.clearFormat();
    rw2.setWrapStrategies(w2);
    const rw2s = rw2.getWrapStrategies();
    t.deepEqual(
      rw2s.flat().map((f) => f.toString()),
      w2.flat().map((f) => f.toString())
    );

    const rw3 = startAt.offset(12, 7);
    rw3.clearFormat();
    rw3.setWrapStrategy(w1);
    const w3a = rw3.getWrap();
    t.is(w3a, false);
    const w3b = rw3.getWrapStrategy();
    t.is(w3b.toString(), w1.toString());
    const rw3sb = rw3.getWrap();
    t.is(rw3sb, false);

    const rw4 = startAt.offset(14, 8);
    rw4.clearFormat();
    const w4a = rw4.getWrap();
    t.is(w4a, true);
    const w4 = fillRange(rw4, SpreadsheetApp.WrapStrategy.CLIP);
    rw4.setWrapStrategies(w4);
    const rw4sa = rw4.getWrapStrategies();
    t.deepEqual(
      rw4sa.flat().map((f) => f.toString()),
      w4.flat().map((f) => f.toString())
    );
    const rw4sb = rw4.getWraps();
    t.true(rw4sb.flat().every((f) => f === false));

    const rw5 = startAt.offset(16, 9);
    rw5.clearFormat();
    const w5a = rw5.getWrap();
    t.is(w5a, true);
    const w5 = fillRange(rw4, SpreadsheetApp.WrapStrategy.WRAP);
    rw5.setWrapStrategies(w5);
    const rw5sa = rw5.getWrapStrategies();
    t.deepEqual(
      rw5sa.flat().map((f) => f.toString()),
      w5.flat().map((f) => f.toString())
    );
    const rw5sb = rw5.getWraps();
    t.true(rw5sb.flat().every((f) => f === true));

    const rw6 = startAt.offset(18, 11);
    rw6.clearFormat();
    const w6 = fillRangeFromDomain(rw6, [true, false]);
    rw6.setWraps(w6);
    const rw6sa = rw6.getWraps();
    t.deepEqual(rw6sa, w6);
    const rw6sb = rw6.getWrapStrategies();
    t.deepEqual(
      rw6sb.flat().map((f) => f.toString()),
      w6.flat().map((f) => (f ? "WRAP" : "OVERFLOW"))
    );
    t.is(rw6.getWrap(), rw6sa[0][0]);
    rw6.setWrap(true);
    t.is(rw6.getWrap(), true);
    t.is(rw6.getWrapStrategy().toString(), "WRAP");

    // set styles
    const tob = SpreadsheetApp.ThemeColorType.ACCENT1;
    const cob = SpreadsheetApp.newColor().setThemeColor(tob);
    const t1 = SpreadsheetApp.newTextStyle()
      .setFontSize(20)
      .setForegroundColorObject(cob.build())
      .build();
    const r1 = startAt.offset(0, 0);
    r1.clearFormat();
    r1.setTextStyle(t1);
    const a1 = r1.getTextStyle();
    t.is(a1.getFontSize(), 20);
    t.is(
      a1
        .getForegroundColorObject()
        .asThemeColor()
        .getThemeColorType()
        .compareTo(tob),
      0
    );

    const t2 = SpreadsheetApp.newTextStyle()
      .setFontSize(12)
      .setFontFamily("helvetica,times new roman,arial")
      .build();
    const r2 = startAt.offset(1, 0);
    r2.clearFormat();
    r2.setTextStyle(t2);
    const a2 = r2.getTextStyles();
    a2.flat().forEach((f) => {
      t.is(f.getFontSize(), 12);
      t.is(f.getFontFamily(), "helvetica,times new roman,arial");
    });

    const t3a = SpreadsheetApp.newTextStyle()
      .setFontSize(32)
      .setFontFamily("helvetica")
      .setBold(true)
      .setUnderline(false)
      .setForegroundColor("#00ff00")
      .build();

    // check that copy works
    const t3 = t3a.copy().build();
    const r3 = startAt.offset(2, 1);
    r3.clearFormat();
    r3.setTextStyle(t3);
    const a3 = r3.getTextStyles();
    a3.flat().forEach((f) => {
      t.is(f.getFontSize(), 32);
      t.is(f.getFontFamily(), "helvetica");
      t.is(f.isBold(), true);
      t.is(f.isUnderline(), false);
      t.is(f.getForegroundColor(), "#00ff00");
    });
    if (SpreadsheetApp.isFake) cachePerformance()
  });

  unit.section("setting and repeating cell formats", (t) => {
    const tester = (range, prop, props, domain, nullIs, patcher) => {
      /// console.log(prop, props)

      // this is source data - will be randomly drawn from a set of acceptable values
      const rd = fillRangeFromDomain(range, domain);

      // in some cases the api returns different values to those set, so we fix the input data to patch what to expect instead
      // this is all about makeing the input look like what the api will return in response
      const rdn = rd
        .map((row) =>
          row.map((f) => {
            return is.null(f) ? nullIs : f;
          })
        )
        // we also may need to stringify enums to compare
        .map((row) => row.map(eString))
        // sometimes the api returns a different value to what was set or what gas expects
        .map((row) =>
          row.map((f) => {
            return patcher && Reflect.has(patcher, f) ? patcher[f] : f;
          })
        );

      // we'lso need to check when the entire range is set to the same value
      const rdnFill = fillRange(range, rdn[0][0]);

      // now do a multiple set
      range["set" + props](rd);

      // get the result of multiple set
      const cobs = range["get" + props]();

      // need to massage the results to normalize enums
      const cobsn = cobs.map((row) => row.map(eString));

      // finally we can compare results
      t.deepEqual(cobsn, rdn, props);

      // now test setting the same value on ech member of the range
      range["set" + prop](rd[0][0]);

      // get back the entire thing
      const cob = range["get" + props]();
      // normalize for enums
      const cobn = cob.map((row) => row.map(eString));

      // check all set to the expexted response
      t.deepEqual(cobn, rdnFill, prop);

      // do a single get
      const gs = range["get" + prop]();
      const gsn = eString(gs);

      t.is(gsn, rdnFill[0][0], props);

      // we can also check that the original enum matches
      if (isEnum(gs)) {
        t.is(gs.compareTo(cobs[0][0]), 0, props);
      }
    };
    const { sheet } = maketss("cellsformats", toTrash, fixes);
    const startAt = sheet.getRange("b2:e5");

    tester(
      startAt.offset(0, 0),
      "FontWeight",
      "FontWeights",
      ["bold", "normal", null],
      "normal"
    );
    tester(
      startAt.offset(5, 1),
      "FontStyle",
      "FontStyles",
      ["italic", "normal", null],
      "normal"
    );
    // note that fontsize doesnt allow anything other than an integer (ie - there is no null option)
    tester(
      startAt.offset(10, 2),
      "FontSize",
      "FontSizes",
      [10, 8, 4, 5, 20, 11],
      null
    );
    tester(
      startAt.offset(10, 2),
      "FontSize",
      "FontSizes",
      [10, 8, 4, 5, 20, 11],
      null
    );
    tester(
      startAt.offset(15, 3),
      "FontLine",
      "FontLines",
      ["line-through", "none", "underline", null],
      "none"
    );
    tester(
      startAt.offset(20, 4),
      "FontFamily",
      "FontFamilies",
      [
        "Arial,Tahoma,Times New Roman",
        "Helvetica",
        "Verdana,Sans Serif",
        "Courier New",
      ],
      null
    );
    tester(
      startAt.offset(25, 5),
      "NumberFormat",
      "NumberFormats",
      ["0.0000", "#,##0.00", "$#.##0.00", "general"],
      null,
      {
        // because we set general, but receive this default in return
        general: "0.###############",
      }
    );
    tester(
      startAt.offset(30, 6),
      "HorizontalAlignment",
      "HorizontalAlignments",
      ["left", "center", "right", "normal", null],
      "general",
      {
        // see readme oddities for why this....
        normal: Sheets.isFake ? "general" : "general-left",
      }
    );
    tester(
      startAt.offset(35, 6),
      "VerticalAlignment",
      "VerticalAlignments",
      ["top", "middle", "bottom", null],
      "bottom"
    );

    tester(
      startAt.offset(40, 7),
      "TextDirection",
      "TextDirections",
      [
        SpreadsheetApp.TextDirection.LEFT_TO_RIGHT,
        SpreadsheetApp.TextDirection.RIGHT_TO_LEFT,
        null,
      ],
      null
    );

    // note that a repeat cell will autoincrement the formulas, so Im using absolute values here
    tester(
      startAt.offset(45, 8),
      "Formula",
      "Formulas",
      [null, "=SUM($B$2:$B$4)", "=SUM($C$2:$4)", "=AVERAGE($C$2:$C$4)"],
      ""
    );
    // lets do a quick text on autincrement
    const fr1 = startAt.offset(50, 0, 2, 2);
    const frv = "=A1";
    const frr = [
      ["=A1", "=B1"],
      ["=A2", "=B2"],
    ];
    fr1.setFormula(frv);
    t.deepEqual(fr1.getFormulas(), frr);

    // TODO can't properly do text rotation because of https://issuetracker.google.com/issues/425390984.
    // revisit this when fixed
    const fr0 = startAt.offset(50, 9);
    fr0.setTextRotation(45);
    // see https://issuetracker.google.com/issues/425390984 and readme oddities - textRotation. The fake returns 0 because the API doesn't return the angle.
    const tr0 = fr0.getTextRotation();
    t.is(tr0.getDegrees(), SpreadsheetApp.isFake ? 0 : 45);
    t.is(tr0.isVertical(), false);

    fr0.setVerticalText(true);
    const tr0v = fr0.getTextRotation();
    t.is(tr0v.getDegrees(), 0);
    t.is(tr0v.isVertical(), true);

    fr0.setVerticalText(false);
    const tr1v = fr0.getTextRotation();
    t.is(tr1v.getDegrees(), 0);
    t.is(tr1v.isVertical(), false);

    // this also doesnt work in GAS so we'll skipuntil its fixed
    if (SpreadsheetApp.isFake) {
      const rotd = fillRangeFromDomain(fr0, [-2, 9, 89, null]);
      fr0.setTextRotations(rotd);
      const r2 = fr0.getTextRotations();
      // see https://issuetracker.google.com/issues/425390984 and readme oddities - textRotation. The fake returns 0 because the API doesn't return the angle.
      t.deepEqual(
        r2.flat().map((f) => f.getDegrees()),
        rotd.flat().map((f) => (SpreadsheetApp.isFake ? 0 : f))
      );
      // this should always be false if we've set rotation with a number
      t.true(r2.flat().every((f) => !f.isVertical()));
      // Note that pass TextRotation object rather than degrees throws an error in GAS so we wont be implementing that overload yet.
    }

    const startAgain = startAt.offset(100, 0);

    // fontcolorobjects
    // these are more complex so i wont bother trying to push them thru standard test
    const fr = startAgain.offset(1, 0);
    const tct = SpreadsheetApp.ThemeColorType;
    const td = Object.keys(tct)
      .filter((f) => f !== "UNSUPPORTED" && !is.function(tct[f]))
      .map((f) => tct[f]);
    const rd = fillRangeFromDomain(fr, td);
    const rc = rd.map((row) =>
      row.map((f) => SpreadsheetApp.newColor().setThemeColor(f).build())
    );

    const fr2 = startAgain.offset(5, 1);
    fr2.setFontColorObject(rc[0][0]);
    const cobs2 = fr2
      .getFontColorObjects()
      .map((row) => row.map((f) => f.asThemeColor().getThemeColorType()));
    t.deepEqual(cobs2, fillRange(fr2, rd[0][0]));
    const cob2 = fr2.getFontColorObject().asThemeColor().getThemeColorType();
    t.is(cob2, rc[0][0].asThemeColor().getThemeColorType());

    fr.setFontColorObjects(rc);
    const cobs = fr
      .getFontColorObjects()
      .map((row) => row.map((f) => f.asThemeColor().getThemeColorType()));
    t.deepEqual(cobs, rd);

    // try all that with rgb color object
    const fr3 = startAgain.offset(10, 2);
    const rd3 = fillRange(fr3, getRandomHex);
    const rc3 = rd3.map((row) =>
      row.map((f) => SpreadsheetApp.newColor().setRgbColor(f).build())
    );
    fr3.setFontColorObjects(rc3);

    const fr4 = startAgain.offset(15, 3);
    fr4.setFontColorObject(rc3[0][0]);
    const cobs4 = fr4
      .getFontColorObjects()
      .map((row) => row.map((f) => f.asRgbColor().asHexString()));
    t.deepEqual(cobs4, fillRange(fr4, rd3[0][0]));
    const cob4 = fr4.getFontColorObject().asRgbColor().asHexString();
    t.is(cob4, rc3[0][0].asRgbColor().asHexString());

    const fr5 = startAgain.offset(20, 4);
    const rd5 = fillRange(fr5, getRandomHex);
    fr5.setBackground(rd5[0][0]);
    const cobs5 = fr5.getBackgrounds();
    t.deepEqual(cobs5, fillRange(fr5, rd5[0][0]));
    const cob5 = fr5.getBackground();
    t.is(cob5, rd5[0][0]);
    fr5.setBackgrounds(rd5);
    t.deepEqual(fr5.getBackgrounds(), rd5);

    // these are undocumented
    const fr6 = startAgain.offset(25, 4);
    fr6.setBackground(rd5[0][0]);
    const cobs6 = fr6.getBackgrounds();
    t.deepEqual(cobs6, fillRange(fr6, rd5[0][0]));
    const cob6 = fr6.getBackground();
    t.is(cob5, rd5[0][0]);
    fr6.setBackgroundColors(rd5);
    t.deepEqual(fr6.getBackgroundColors(), rd5);

    // check clearing works
    const clearRange = sheet.getRange("a1:z100");
    clearRange.clearFormat();

    if (SpreadsheetApp.isFake) cachePerformance()
  });

  // this section is kind of redundant now as I've consolodated most of these tests into setting and repearing cell formats
  // however we'll just leave these here as extra tests in any case
  unit.section("assorted cell userenteredformats", (t) => {
    const { sheet } = maketss("assorted", toTrash, fixes);
    const range = sheet.getRange("b15:e19");
    const nFormat = "0.#";
    const nFormats = fillRange(range, nFormat);
    range.setNumberFormat(nFormat);

    const nf = range.getNumberFormat();
    t.is(nf, nFormat);
    range.setNumberFormats(nFormats);
    const nfs = range.getNumberFormats();

    t.is(nf, nfs[0][0]);
    t.is(nfs.length, range.getNumRows());
    t.is(nfs[0].length, range.getNumColumns());
    t.deepEqual(nfs, nFormats);

    const fl = range.getFontLine();
    t.is(fl, "none");
    t.true(
      range
        .getFontLines()
        .flat()
        .every((f) => f === fl)
    );

    // newly created sheet has all null borders
    t.is(range.getBorder(), null);

    // default colot and style
    range.setBorder(true, true, true, true, true, true);
    // this doesnt work on GAS
    // const b1 = range.getBorders()
    const b1 = range.getBorder();
    t.is(b1.getTop().getColor().getColorType().toString(), "RGB");
    t.is(b1.getTop().getBorderStyle().toString(), "SOLID");
    t.is(b1.getBottom().getBorderStyle().toString(), "SOLID");
    t.is(b1.getLeft().getBorderStyle().toString(), "SOLID");
    t.is(b1.getRight().getBorderStyle().toString(), "SOLID");
    t.is(b1.getTop().getColor().asRgbColor().asHexString(), BLACK);

    // hopefully we can get something from an offset to mitigate the range.getBorders() thing
    const b0 = range.offset(1, 1, 1, 1).getBorder();

    // this will drop any symbols in the response
    t.deepEqual(JSON.stringify(b0), JSON.stringify(b1));

    // left should remain as before
    const GREEN = "#00ff00";
    range.setBorder(
      true,
      null,
      true,
      true,
      true,
      true,
      GREEN,
      SpreadsheetApp.BorderStyle.DASHED
    );
    const b2 = range.getBorder();
    t.is(b2.getTop().getBorderStyle().toString(), "DASHED");
    t.is(b2.getLeft().getBorderStyle().toString(), "SOLID");
    t.is(b2.getTop().getColor().asRgbColor().asHexString(), GREEN);
    t.is(b2.getLeft().getColor().asRgbColor().asHexString(), BLACK);

    if (SpreadsheetApp.isFake) cachePerformance()
  });

  unit.section("cell and font backgrounds, styles and alignments", (t) => {
    const { sheet } = maketss("cells", toTrash, fixes);

    // text styles - an empty sheet shoud all be defaults
    const range = sheet.getRange("A1:C5");
    const txss = range.getTextStyles();
    const txs = range.getTextStyle();
    t.is(txss.length, range.getNumRows());
    t.is(txss[0].length, range.getNumColumns());
    t.is(txs.toString(), "TextStyle");
    t.is(txs.getFontSize(), 10);
    t.is(txs.getFontFamily(), "arial,sans,sans-serif");
    t.is(txs.isBold(), false);
    t.is(txs.isItalic(), false);
    t.is(txs.isUnderline(), false);
    t.is(txs.isStrikethrough(), false);
    t.is(txs.getForegroundColor(), BLACK);
    t.is(txs.getForegroundColorObject().asRgbColor().asHexString(), BLACK);
    t.true(txss.flat().every((f) => f.getFontSize() === txs.getFontSize()));
    t.true(txss.flat().every((f) => f.getFontFamily() === txs.getFontFamily()));
    t.true(txss.flat().every((f) => f.isBold() === txs.isBold()));
    t.true(txss.flat().every((f) => f.isItalic() === txs.isItalic()));
    t.true(txss.flat().every((f) => f.isUnderline() === txs.isUnderline()));
    t.true(
      txss.flat().every((f) => f.isStrikethrough() === txs.isStrikethrough())
    );
    t.true(
      txss
        .flat()
        .every((f) => f.getForegroundColor() === txs.getForegroundColor())
    );
    t.true(
      txss
        .flat()
        .every(
          (f) =>
            f.getForegroundColorObject().asRgbColor().asHexString() ===
            txs.getForegroundColorObject().asRgbColor().asHexString()
        )
    );

    // backgrounds
    const backgrounds = range.getBackgrounds();
    const background = range.getBackground();
    t.true(is.nonEmptyString(background));
    t.true(is.array(backgrounds));

    // these 2 i think have just been renamed - they dont exist in the documentation any more
    t.is(range.getBackgroundColor(), background);
    t.deepEqual(range.getBackgroundColors(), backgrounds);

    t.is(backgrounds.length, range.getNumRows());
    t.is(backgrounds[0].length, range.getNumColumns());
    t.is(backgrounds[0][0], background);
    t.true(backgrounds.flat().every((f) => is.nonEmptyString(f)));
    t.is(background.substring(0, 1), "#");
    t.is(background.length, 7);
    t.is(
      background,
      "#ffffff",
      "newly created sheet will have white background"
    );

    const color = getRandomHex();
    range.setBackground(color);
    t.is(range.getBackground(), color);
    t.true(
      range
        .getBackgrounds()
        .flat()
        .every((f) => f === color)
    );

    const colorRgb = getRandomRgb();
    const color255 = [
      Math.round(colorRgb.red * 255),
      Math.round(colorRgb.green * 255),
      Math.round(colorRgb.blue * 255),
    ];
    range.setBackgroundRGB(...color255);
    t.is(range.getBackground(), rgbToHex(colorRgb));

    // some random colorsas
    const colors = fillRange(range, getRandomHex);
    const fontColors = fillRange(range, getRandomHex);

    range.setBackgrounds(colors);
    t.deepEqual(range.getBackgrounds(), colors);

    range.setFontColors(fontColors);

    // text rotations
    const rots = range.getTextRotations();
    const rot = range.getTextRotation();
    t.is(rots.length, range.getNumRows());
    t.is(rots[0].length, range.getNumColumns());
    t.true(rots.flat().every((f) => f.getDegrees() === 0));
    t.is(rot.getDegrees(), 0);
    t.true(rots.flat().every((f) => f.isVertical() === false));
    t.is(rot.isVertical(), false);

    // this is deprec, but we'll implement it anyway
    const fcs = range.getFontColors();
    const fc = range.getFontColor();
    t.is(fcs.length, range.getNumRows());
    t.is(fcs[0].length, range.getNumColumns());
    t.deepEqual(fcs, fontColors);
    t.is(fc, fontColors[0][0]);

    // default font family
    const defFamily = "Arial";
    const ffs = range.getFontFamilies();
    const ff = range.getFontFamily();
    t.is(ffs.length, range.getNumRows());
    t.is(ffs[0].length, range.getNumColumns());
    t.true(ffs.flat().every((f) => f === ff));
    t.is(ff, defFamily);

    // default font family
    const defFontSize = 10;
    const fss = range.getFontSizes();
    const fs = range.getFontSize();
    t.is(fss.length, range.getNumRows());
    t.is(fss[0].length, range.getNumColumns());
    t.true(fss.flat().every((f) => f === fs));
    t.is(fs, defFontSize);

    // default wrap
    const defWrap = true;
    const fws = range.getWraps();
    const fw = range.getWrap();
    t.is(fws.length, range.getNumRows());
    t.is(fws[0].length, range.getNumColumns());
    t.true(fws.flat().every((f) => f === fw));
    t.is(fw, defWrap);

    const defWrapStrategy = "OVERFLOW";
    const wss = range.getWrapStrategies();
    const ws = range.getWrapStrategy();
    t.is(wss.length, range.getNumRows());
    t.is(wss[0].length, range.getNumColumns());
    t.true(wss.flat().every((f) => f.toString() === ws.toString()));
    t.is(ws.toString(), defWrapStrategy);

    // the preferred way nowadays
    const fcobs = range.getFontColorObjects();
    const fcob = range.getFontColorObject();
    t.is(fcobs.length, range.getNumRows());
    t.is(fcobs[0].length, range.getNumColumns());
    t.deepEqual(
      fcobs.flat().map((f) => f.asRgbColor().asHexString()),
      fontColors.flat()
    );
    t.is(fcob.asRgbColor().asHexString(), fontColors[0][0]);

    range.setFontColor(getRandomHex());

    // now with rangelists
    const range2 = range.offset(3, 3, 2, 2);
    const rangeList = range
      .getSheet()
      .getRangeList([range, range2].map((r) => r.getA1Notation()));
    rangeList.setBackground(color);
    rangeList.getRanges().forEach((range) =>
      t.true(
        range
          .getBackgrounds()
          .flat()
          .every((f) => f === color)
      )
    );
    rangeList.getRanges().forEach((range) => {
      range.setBackgroundRGB(...color255);
      t.is(range.getBackground(), rgbToHex(colorRgb));
    });

    // now alignments
    const verticalAlignments = range.getVerticalAlignments();
    const verticalAlignment = range.getVerticalAlignment();
    t.is(verticalAlignments.length, range.getNumRows());
    t.is(verticalAlignments[0].length, range.getNumColumns());
    t.true(verticalAlignments.flat().every((f) => is.nonEmptyString(f)));
    t.is(verticalAlignments[0][0], verticalAlignment);
    // sometimes this is upper sometimes lower - havent figured out rule yet
    t.is(
      verticalAlignment.toUpperCase(),
      "BOTTOM",
      "newly created sheet will have bottom"
    );

    const horizontalAlignments = range.getHorizontalAlignments();
    const horizontalAlignment = range.getHorizontalAlignment();
    t.is(horizontalAlignments.length, range.getNumRows());
    t.is(horizontalAlignments[0].length, range.getNumColumns());
    t.true(horizontalAlignments.flat().every((f) => is.nonEmptyString(f)));
    t.is(horizontalAlignments[0][0], horizontalAlignment);
    t.is(
      horizontalAlignment,
      "general",
      "newly created sheet will have general"
    );
    if (SpreadsheetApp.isFake) cachePerformance()
  });

  unit.section(
    "TODO - currently skipped - range.getBorder() does work on GAS although it's not documented",
    (t) => {
      // TODO figure out how to handle thick/medium etc.

      const rt = sb.getRange("a26:b28");

      // the top of of the first row should be null
      // the bottom of the last row should be null
      // the left of the first column should be null
      // the right of last column should be null
      const topRow = rt.offset(0, 0, 1).getBorder();
      const bottomRow = rt.offset(rt.getNumRows() - 1, 1).getBorder();
      const leftCol = rt.offset(0, 0, rt.getNumRows(), 1).getBorder();
      const rightCol = rt
        .offset(0, rt.getNumColumns() - 1, rt.getNumRows(), 1)
        .getBorder();

      t.is(topRow.getTop().getColor().getColorType().toString(), "UNSUPPORTED");
      t.is(
        bottomRow.getBottom().getColor().getColorType().toString(),
        "UNSUPPORTED"
      );
      t.is(
        leftCol.getLeft().getColor().getColorType().toString(),
        "UNSUPPORTED"
      );
      t.is(
        rightCol.getRight().getColor().getColorType().toString(),
        "UNSUPPORTED"
      );
      t.is(topRow.getTop().getBorderStyle(), null);
      t.is(bottomRow.getBottom().getBorderStyle(), null);
      t.is(leftCol.getLeft().getBorderStyle(), null);
      t.is(rightCol.getRight().getBorderStyle(), null);

    if (SpreadsheetApp.isFake) cachePerformance()
    },
    { skip: true }
  );

  unit.section("text Style objects and builders", (t) => {
    const builder = SpreadsheetApp.newTextStyle();
    t.is(builder.toString(), "TextStyleBuilder");
    const fontFamily = "Helvetica";
    builder
      .setFontSize(10)
      .setBold(true)
      .setItalic(true)
      .setUnderline(false)
      .setStrikethrough(false)
      .setFontFamily(fontFamily);
    const textStyle = builder.build();
    t.is(textStyle.toString(), "TextStyle");
    t.is(textStyle.getFontSize(), 10);
    t.is(textStyle.getFontFamily(), fontFamily);
    t.is(textStyle.isBold(), true);
    t.is(textStyle.isItalic(), true);
    t.is(textStyle.isUnderline(), false);
    t.is(textStyle.isStrikethrough(), false);

    t.is(textStyle.getForegroundColor(), null);
    t.is(textStyle.getForegroundColorObject(), null);

    const rgbColor = getRandomHex();
    const rgbBuilder = SpreadsheetApp.newTextStyle();
    rgbBuilder.setForegroundColor(rgbColor);
    const rgbStyle = rgbBuilder.build();
    t.is(rgbStyle.getForegroundColor(), rgbColor);
    t.is(
      rgbStyle.getForegroundColorObject().asRgbColor().asHexString(),
      rgbColor
    );

    const tc = "ACCENT4";
    const tcb = SpreadsheetApp.newColor();
    tcb.setThemeColor(SpreadsheetApp.ThemeColorType[tc]).build();
    const themeBuilder = SpreadsheetApp.newTextStyle()
      .setForegroundColorObject(tcb)
      .build();
    // strangely enough, if it's a theme color it returns the enum for the colortype
    t.is(themeBuilder.getForegroundColor(), tc);
    t.is(
      themeBuilder
        .getForegroundColorObject()
        .asThemeColor()
        .getThemeColorType()
        .toString(),
      tc
    );

    if (SpreadsheetApp.isFake) cachePerformance()
  });

  unit.section("color objects and builders", (t) => {
    const builder = SpreadsheetApp.newColor();
    t.is(builder.toString(), "ColorBuilder");
    t.is(
      t.threw(() => builder.asThemeColor()).message,
      "Object is not of type ThemeColor."
    );
    t.is(
      t.threw(() => builder.asRgbColor()).message,
      "Object is not of type RgbColor."
    );
    t.is(builder.getColorType().toString(), "UNSUPPORTED");
    const rgbColor = getRandomHex();

    builder.setRgbColor(rgbColor);
    t.is(
      t.threw(() => builder.asThemeColor()).message,
      "Object is not of type ThemeColor."
    );
    t.is(builder.getColorType().toString(), "RGB");
    t.is(builder.asRgbColor().toString(), "RgbColor");
    t.is(builder.asRgbColor().asHexString(), rgbColor);
    t.is(builder.asRgbColor().getRed(), parseInt(rgbColor.substring(1, 3), 16));

    const builtRgb = builder.build();
    t.is(builtRgb.toString(), "Color");
    t.is(builtRgb.getColorType().toString(), "RGB");
    t.is(builtRgb.asRgbColor().toString(), "RgbColor");
    t.is(
      builtRgb.asRgbColor().getGreen(),
      parseInt(rgbColor.substring(3, 5), 16)
    );
    t.is(
      builtRgb.asRgbColor().getBlue(),
      parseInt(rgbColor.substring(5, 7), 16)
    );
    t.is(
      builtRgb.asRgbColor().getRed(),
      parseInt(rgbColor.substring(1, 3), 16)
    );
    t.is(
      t.threw(() => builtRgb.asThemeColor()).message,
      "Object is not of type ThemeColor."
    );

    const themeBuilder = SpreadsheetApp.newColor();
    themeBuilder.setThemeColor(SpreadsheetApp.ThemeColorType.ACCENT1);
    t.is(themeBuilder.getColorType().toString(), "THEME");
    t.is(themeBuilder.asThemeColor().getColorType().toString(), "THEME");
    t.is(themeBuilder.asThemeColor().getThemeColorType().toString(), "ACCENT1");
    t.is(
      t.threw(() => themeBuilder.asRgbColor()).message,
      "Object is not of type RgbColor."
    );

    const builtTheme = themeBuilder.build();
    t.is(builtTheme.toString(), "Color");
    t.is(builtTheme.getColorType().toString(), "THEME");
    t.is(builtTheme.asThemeColor().getColorType().toString(), "THEME");
    t.is(
      t.threw(() => builtTheme.asRgbColor()).message,
      "Object is not of type RgbColor."
    );

    if (SpreadsheetApp.isFake) cachePerformance()
  });

  unit.section("setting and getting color objects}", (t) => {
    const { sheet } = maketss("colors", toTrash, fixes);
    const range = sheet.getRange("c6:i12");

    // so we can see the colors better if necessary add some random values
    const stuff = getStuff(range);
    range.setValues(stuff);
    t.deepEqual(range.getValues(), stuff);

    const cts = [
      "TEXT",
      "BACKGROUND",
      "ACCENT1",
      "ACCENT2",
      "ACCENT3",
      "ACCENT4",
      "ACCENT5",
      "ACCENT6",
      "LINK",
    ];

    const colorObjects = Array.from(
      {
        length: range.getNumRows(),
      },
      (_) =>
        Array.from(
          {
            length: range.getNumColumns(),
          },
          (_, i) =>
            SpreadsheetApp.newColor()
              .setThemeColor(SpreadsheetApp.ThemeColorType[cts[i % cts.length]])
              .build()
        )
    );

    t.true(
      colorObjects
        .flat()
        .every((f) => f.asThemeColor().getColorType().toString() === "THEME")
    );
    t.true(
      colorObjects.flat().every((f) => f.getColorType().toString() === "THEME")
    );

    range.setBackgroundObjects(colorObjects);
    const tobs = range.getBackgroundObjects();
    t.true(tobs.flat().every((f) => f.getColorType().toString() === "THEME"));
    t.deepEqual(
      tobs.flat().map((f) => f.asThemeColor().getThemeColorType().toString()),
      colorObjects
        .flat()
        .map((f) => f.asThemeColor().getThemeColorType().toString())
    );

    // color objects can be rgb too
    const rgbObjects = Array.from(
      {
        length: range.getNumRows(),
      },
      (_) =>
        Array.from(
          {
            length: range.getNumColumns(),
          },
          (_, i) =>
            SpreadsheetApp.newColor().setRgbColor(getRandomHex()).build()
        )
    );

    const rgbRange = range.offset(range.getNumRows() + 1, 0);
    rgbRange.setBackgroundObjects(rgbObjects);
    const robs = rgbRange.getBackgroundObjects();
    t.true(robs.flat().every((f) => f.getColorType().toString() === "RGB"));
    t.deepEqual(
      robs.flat().map((f) => f.asRgbColor().asHexString()),
      rgbObjects.flat().map((f) => f.asRgbColor().asHexString())
    );

    // and they can be mixed
    const mixedRange = rgbRange.offset(rgbRange.getNumRows() + 1, 0);
    const half = Math.floor(mixedRange.getNumRows() / 2);
    const mixed = colorObjects
      .slice(0, half)
      .concat(rgbObjects.slice(0, mixedRange.getNumRows() - half));
    mixedRange.setBackgroundObjects(mixed);
    const mobs = mixedRange.getBackgroundObjects();
    t.deepEqual(
      mobs.flat().map((f) => f.getColorType().toString()),
      mixed.flat().map((f) => f.getColorType().toString())
    );

    const singleColor = getRandomHex();
    const singleColorObj = SpreadsheetApp.newColor()
      .setRgbColor(singleColor)
      .build();
    const singleRange = mixedRange.offset(mixedRange.getNumRows() + 1, 0);
    singleRange.setBackgroundObject(singleColorObj);
    const back1 = singleRange.getBackgrounds();
    t.true(back1.flat().every((f) => f === singleColor));
    const sobs = singleRange.getBackgroundObjects();
    t.true(
      sobs.flat().every((f) => f.asRgbColor().asHexString() === singleColor)
    );

    const singleRgbRange = singleRange.offset(singleRange.getNumRows() + 1, 0);
    const singleColorRgbObj = SpreadsheetApp.newColor()
      .setRgbColor(singleColor)
      .build();
    singleRgbRange.setBackgroundObject(singleColorRgbObj);
    const back2 = singleRgbRange.getBackgrounds();
    t.true(back2.flat().every((f) => f === singleColor));
    const srobs = singleRange.getBackgroundObjects();
    t.true(
      srobs.flat().every((f) => f.asRgbColor().asHexString() === singleColor)
    );
    t.deepEqual(back1, back2);

    const clearRange = sheet.getRange("a1:z100");
    clearRange.clear();
    t.true(
      clearRange
        .getValues()
        .flat()
        .every((f) => f === "")
    );

    if (SpreadsheetApp.isFake) cachePerformance()
  });


  // running standalone
  if (!pack) {
    if (SpreadsheetApp.isFake) cachePerformance()
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);

  return { unit, fixes };
};

wrapupTest(testSheetsFormatting);
